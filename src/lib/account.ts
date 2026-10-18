import "server-only"
import { ownerLeaveClub } from "@/lib/clubs"
import { deleteAllCheckInPhotos, deleteImages } from "@/lib/covers"
import { db } from "@/lib/db"

/** Todos os dados do usuário em JSON (direito de acesso e portabilidade da LGPD). */
export async function exportUserData(userId: string) {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, name: true, email: true, goalType: true, dailyGoal: true, onboardedAt: true, createdAt: true },
  })
  const [library, checkIns, comments, reactions, memberships, friendships, feedbacks] = await Promise.all([
    db.libraryItem.findMany({
      where: { userId },
      select: {
        status: true,
        currentPage: true,
        startedAt: true,
        finishedAt: true,
        createdAt: true,
        book: { select: { title: true, author: true, totalPages: true, coverUrl: true } },
      },
    }),
    db.checkIn.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        day: true,
        fromPage: true,
        toPage: true,
        pagesRead: true,
        minutes: true,
        note: true,
        photoUrl: true,
        createdAt: true,
        book: { select: { title: true } },
      },
    }),
    db.comment.findMany({ where: { userId }, select: { body: true, createdAt: true, checkInId: true } }),
    db.reaction.findMany({ where: { userId }, select: { emoji: true, createdAt: true, checkInId: true } }),
    db.clubMember.findMany({ where: { userId }, select: { role: true, joinedAt: true, club: { select: { name: true } } } }),
    db.friendship.findMany({
      where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
      select: {
        status: true,
        createdAt: true,
        acceptedAt: true,
        requester: { select: { name: true } },
        addressee: { select: { name: true } },
      },
    }),
    db.feedback.findMany({ where: { userId }, select: { kind: true, message: true, createdAt: true } }),
  ])

  return {
    exportadoEm: new Date().toISOString(),
    app: "Cervo (cervobook.club)",
    conta: user,
    biblioteca: library,
    checkIns,
    comentarios: comments,
    reacoes: reactions,
    clubes: memberships,
    amizades: friendships,
    feedbacks,
  }
}

/**
 * Exclui a conta e os dados pessoais:
 * - clubes que a pessoa criou passam para o admin/membro mais antigo (ou são apagados se ela estava sozinha);
 * - livros que só ela usava são apagados; os que estão na biblioteca de outros ficam, sem autor;
 * - fotos de check-in e capas dos livros apagados saem do R2;
 * - perfil, biblioteca, check-ins, comentários, reações, amizades e feedbacks saem do banco;
 * - o login (auth.users do Supabase) é apagado na mesma transação.
 */
export async function deleteAccount(userId: string) {
  const ownedClubs = await db.club.findMany({ where: { ownerId: userId }, select: { id: true } })
  for (const club of ownedClubs) await ownerLeaveClub(club.id, userId)

  const orphanBooks = await db.book.findMany({
    where: {
      createdById: userId,
      libraryItems: { none: { userId: { not: userId } } },
      checkIns: { none: { userId: { not: userId } } },
      clubs: { none: {} },
    },
    select: { id: true, coverUrl: true },
  })

  await db.$transaction([
    db.book.deleteMany({ where: { id: { in: orphanBooks.map((b) => b.id) } } }),
    db.user.delete({ where: { id: userId } }),
    db.$executeRaw`DELETE FROM auth.users WHERE id = ${userId}::uuid`,
  ])

  // Arquivos depois do banco: se algo falhar aqui, sobra só arquivo sem dono (inacessível pelo app).
  await Promise.all([deleteImages(orphanBooks.map((b) => b.coverUrl)), deleteAllCheckInPhotos(userId)])
}
