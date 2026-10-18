import "server-only"
import { computeStreaks, dayKey, shiftDay } from "@/lib/dates"
import { db } from "@/lib/db"

export const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
export const WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"]

function weekday(day: string) {
  return new Date(`${day}T12:00:00Z`).getUTCDay()
}

/** Estatísticas e retrospectiva de um ano de leitura. */
export async function getYearStats(userId: string, year: number) {
  const from = `${year}-01-01`
  const to = `${year}-12-31`
  const [checkIns, finished, firstCheckIn] = await Promise.all([
    db.checkIn.findMany({
      where: { userId, day: { gte: from, lte: to } },
      select: { day: true, pagesRead: true, minutes: true, bookId: true },
    }),
    db.libraryItem.findMany({
      where: { userId, status: "DONE", finishedAt: { gte: new Date(`${from}T03:00:00Z`), lt: new Date(`${year + 1}-01-01T03:00:00Z`) } },
      select: { finishedAt: true, book: { select: { id: true, title: true, author: true, coverUrl: true, totalPages: true } } },
      orderBy: { finishedAt: "asc" },
    }),
    db.checkIn.findFirst({ where: { userId }, orderBy: { day: "asc" }, select: { day: true } }),
  ])

  const pagesByMonth = Array.from({ length: 12 }, () => 0)
  const pagesByWeekday = Array.from({ length: 7 }, () => 0)
  const pagesByDay = new Map<string, number>()
  let minutes = 0
  for (const c of checkIns) {
    pagesByMonth[Number(c.day.slice(5, 7)) - 1]! += c.pagesRead
    pagesByWeekday[weekday(c.day)]! += c.pagesRead
    pagesByDay.set(c.day, (pagesByDay.get(c.day) ?? 0) + c.pagesRead)
    minutes += c.minutes ?? 0
  }

  const totalPages = checkIns.reduce((sum, c) => sum + c.pagesRead, 0)
  const daysRead = pagesByDay.size
  const bestDay = [...pagesByDay.entries()].sort((a, b) => b[1] - a[1])[0] ?? null
  const topMonth = totalPages > 0 ? pagesByMonth.indexOf(Math.max(...pagesByMonth)) : null
  const topWeekday = totalPages > 0 ? pagesByWeekday.indexOf(Math.max(...pagesByWeekday)) : null
  const { longest } = computeStreaks(pagesByDay.keys(), to < dayKey() ? to : dayKey())

  // Últimas 26 semanas (ou até o fim do ano escolhido), em colunas de domingo a sábado.
  const end = to < dayKey() ? to : dayKey()
  const start = shiftDay(end, -(26 * 7 - 1))
  const calendar: { day: string; pages: number; inYear: boolean }[][] = []
  let cursor = shiftDay(start, -weekday(start))
  while (cursor <= end) {
    const week = Array.from({ length: 7 }, (_, i) => {
      const day = shiftDay(cursor, i)
      return { day, pages: day <= end ? (pagesByDay.get(day) ?? 0) : -1, inYear: day >= from && day <= to }
    })
    calendar.push(week)
    cursor = shiftDay(cursor, 7)
  }

  return {
    year,
    totalPages,
    daysRead,
    minutes,
    longestStreak: longest,
    booksFinished: finished.map((f) => ({ ...f.book, finishedAt: f.finishedAt })),
    booksTouched: new Set(checkIns.map((c) => c.bookId)).size,
    pagesByMonth,
    pagesByWeekday,
    averagePerDay: daysRead > 0 ? Math.round(totalPages / daysRead) : 0,
    bestDay: bestDay ? { day: bestDay[0], pages: bestDay[1] } : null,
    topMonth,
    topWeekday,
    calendar,
    firstYear: firstCheckIn ? Number(firstCheckIn.day.slice(0, 4)) : year,
  }
}
