import "server-only"
import { db } from "@/lib/db"

/** Garante que o livro do clube esteja na biblioteca do usuário como "Lendo". */
export async function ensureReading(userId: string, bookId: string) {
  const existing = await db.libraryItem.findUnique({ where: { userId_bookId: { userId, bookId } } })
  if (!existing) {
    await db.libraryItem.create({ data: { userId, bookId, status: "READING", startedAt: new Date() } })
  } else if (existing.status === "WANT") {
    await db.libraryItem.update({
      where: { id: existing.id },
      data: { status: "READING", startedAt: existing.startedAt ?? new Date() },
    })
  }
}

/** Aceita o link completo (…/convite/CODIGO) ou só o código. */
export function parseInviteCode(input: string) {
  const trimmed = input.trim()
  const match = trimmed.match(/\/convite\/([\w-]+)/)
  return match ? match[1] : trimmed
}

/** Coloca o usuário no clube do convite. Devolve o id do clube, ou null se o convite for inválido. */
export async function acceptInvite(userId: string, code: string) {
  const invite = await db.invite.findUnique({ where: { code }, include: { club: true } })
  if (!invite || (invite.expiresAt && invite.expiresAt < new Date())) return null

  await db.clubMember.upsert({
    where: { clubId_userId: { clubId: invite.clubId, userId } },
    update: {},
    create: { clubId: invite.clubId, userId },
  })
  if (invite.club.bookId) await ensureReading(userId, invite.club.bookId)
  return invite.clubId
}
