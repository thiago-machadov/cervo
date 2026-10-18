import "server-only"
import { db } from "@/lib/db"
import { computeStreaks, dayKey, shiftDay } from "@/lib/dates"

const feedInclude = {
  user: { select: { id: true, name: true } },
  book: { select: { id: true, title: true, author: true, totalPages: true, coverUrl: true } },
  _count: { select: { comments: true } },
} as const

export async function getUserStats(userId: string) {
  const checkIns = await db.checkIn.findMany({
    where: { userId },
    select: { day: true, pagesRead: true, minutes: true },
  })
  const booksDone = await db.libraryItem.count({ where: { userId, status: "DONE" } })

  const today = dayKey()
  const weekStart = shiftDay(today, -6)
  const streaks = computeStreaks(checkIns.map((c) => c.day), today)

  return {
    ...streaks,
    totalPages: checkIns.reduce((sum, c) => sum + c.pagesRead, 0),
    pagesThisWeek: checkIns.filter((c) => c.day >= weekStart).reduce((sum, c) => sum + c.pagesRead, 0),
    daysRead: new Set(checkIns.map((c) => c.day)).size,
    pagesToday: checkIns.filter((c) => c.day === today).reduce((sum, c) => sum + c.pagesRead, 0),
    minutesToday: checkIns.filter((c) => c.day === today).reduce((sum, c) => sum + (c.minutes ?? 0), 0),
    booksDone,
    /** Últimos 7 dias, do mais antigo ao mais recente, para o "calendário" da streak. */
    lastWeek: Array.from({ length: 7 }, (_, i) => {
      const day = shiftDay(today, i - 6)
      return { day, read: checkIns.some((c) => c.day === day) }
    }),
  }
}

export function getLibrary(userId: string) {
  return db.libraryItem.findMany({
    where: { userId },
    include: { book: true },
    orderBy: { updatedAt: "desc" },
  })
}

/** Livros que podem receber check-in: lendo primeiro, depois "quero ler". */
export async function getCheckInOptions(userId: string) {
  const items = await db.libraryItem.findMany({
    where: { userId, status: { in: ["READING", "WANT"] } },
    include: { book: { select: { title: true, totalPages: true } } },
    orderBy: { updatedAt: "desc" },
  })
  return items
    .sort((a, b) => (a.status === b.status ? 0 : a.status === "READING" ? -1 : 1))
    .map((item) => ({
      id: item.id,
      title: item.book.title,
      currentPage: item.currentPage,
      totalPages: item.book.totalPages,
    }))
}

export type CheckInOption = Awaited<ReturnType<typeof getCheckInOptions>>[number]

/** Ids de quem divide pelo menos um clube com o usuário (inclui o próprio). */
async function circleUserIds(userId: string) {
  const members = await db.clubMember.findMany({
    where: { club: { members: { some: { userId } } } },
    select: { userId: true },
  })
  return [...new Set([userId, ...members.map((m) => m.userId)])]
}

export async function getHomeFeed(userId: string) {
  const ids = await circleUserIds(userId)
  return db.checkIn.findMany({
    where: { userId: { in: ids } },
    include: feedInclude,
    orderBy: { createdAt: "desc" },
    take: 30,
  })
}

export type FeedCheckIn = Awaited<ReturnType<typeof getHomeFeed>>[number]

export function getUserClubs(userId: string) {
  return db.club.findMany({
    where: { members: { some: { userId } } },
    include: {
      book: { select: { title: true, coverUrl: true } },
      members: { select: { user: { select: { id: true, name: true } } }, take: 5 },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

/** Clube com ranking e feed. Devolve null se o usuário não for membro. */
export async function getClubDetail(clubId: string, userId: string) {
  const club = await db.club.findFirst({
    where: { id: clubId, members: { some: { userId } } },
    include: {
      book: true,
      members: { include: { user: { select: { id: true, name: true } } }, orderBy: { joinedAt: "asc" } },
    },
  })
  if (!club) return null

  const memberIds = club.members.map((m) => m.userId)
  const since = club.bookStartedAt ?? club.createdAt
  const sinceDay = dayKey(since)

  const [bookCheckIns, memberDays, progress] = await Promise.all([
    club.bookId
      ? db.checkIn.findMany({
          where: { bookId: club.bookId, userId: { in: memberIds }, createdAt: { gte: since } },
          include: feedInclude,
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    db.checkIn.findMany({
      where: { userId: { in: memberIds } },
      select: { userId: true, day: true },
    }),
    club.bookId
      ? db.libraryItem.findMany({
          where: { bookId: club.bookId, userId: { in: memberIds } },
          select: { userId: true, currentPage: true },
        })
      : Promise.resolve([]),
  ])

  const ranking = club.members
    .map((member) => {
      const pages = bookCheckIns
        .filter((c) => c.userId === member.userId)
        .reduce((sum, c) => sum + c.pagesRead, 0)
      const memberCheckInDays = memberDays.filter((c) => c.userId === member.userId).map((c) => c.day)
      // Dias de check-in contam desde que o livro foi escolhido; a streak é a geral do usuário.
      const days = new Set(memberCheckInDays.filter((day) => day >= sinceDay)).size
      const streak = computeStreaks(memberCheckInDays).current
      const currentPage = progress.find((p) => p.userId === member.userId)?.currentPage ?? 0
      return { user: member.user, role: member.role, pages, days, currentPage, streak }
    })
    .sort((a, b) => b.pages - a.pages || b.days - a.days)

  return { club, ranking, feed: bookCheckIns.slice(0, 30) }
}

/** Página esperada hoje segundo a meta do clube (null se não houver meta). */
export function expectedPage(club: {
  bookStartedAt: Date | null
  createdAt: Date
  goalEndDate: Date | null
  weeklyPages: number | null
  book: { totalPages: number } | null
}) {
  if (!club.book) return null
  const start = (club.bookStartedAt ?? club.createdAt).getTime()
  const elapsed = Math.max(0, Date.now() - start)
  const total = club.book.totalPages

  if (club.goalEndDate) {
    const span = club.goalEndDate.getTime() - start
    if (span <= 0) return total
    return Math.min(total, Math.round((elapsed / span) * total))
  }
  if (club.weeklyPages) {
    const weeks = elapsed / (7 * 24 * 60 * 60 * 1000)
    return Math.min(total, Math.round(weeks * club.weeklyPages))
  }
  return null
}

/** Check-in com comentários, visível para o autor e para quem divide um clube com ele. */
export async function getCheckInDetail(checkInId: string, viewerId: string) {
  const checkIn = await db.checkIn.findUnique({
    where: { id: checkInId },
    include: {
      ...feedInclude,
      comments: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } },
    },
  })
  if (!checkIn) return null

  const ids = await circleUserIds(viewerId)
  return ids.includes(checkIn.userId) ? checkIn : null
}

export async function getLibraryItem(itemId: string, userId: string) {
  const item = await db.libraryItem.findFirst({ where: { id: itemId, userId }, include: { book: true } })
  if (!item) return null
  const checkIns = await db.checkIn.findMany({
    where: { userId, bookId: item.bookId },
    include: feedInclude,
    orderBy: { createdAt: "desc" },
  })
  return { item, checkIns }
}

export function getInvite(code: string) {
  return db.invite.findUnique({
    where: { code },
    include: {
      createdBy: { select: { name: true } },
      club: {
        include: {
          book: { select: { title: true, author: true, coverUrl: true } },
          _count: { select: { members: true } },
        },
      },
    },
  })
}
