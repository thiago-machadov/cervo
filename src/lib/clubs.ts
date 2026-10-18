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

export type JoinResult = { clubId: string } | { error: "invalid" | "full" | "private" }

/**
 * Coloca o usuário no clube respeitando o limite de membros.
 * Quem já é membro sempre "entra" (nada muda).
 */
export async function addMember(userId: string, clubId: string): Promise<JoinResult> {
  const club = await db.club.findUnique({
    where: { id: clubId },
    select: { id: true, bookId: true, maxMembers: true, _count: { select: { members: true } } },
  })
  if (!club) return { error: "invalid" }

  const existing = await db.clubMember.findUnique({ where: { clubId_userId: { clubId, userId } } })
  if (existing) return { clubId }
  if (club.maxMembers !== null && club._count.members >= club.maxMembers) return { error: "full" }

  await db.clubMember.create({ data: { clubId, userId } })
  if (club.bookId) await ensureReading(userId, club.bookId)
  return { clubId }
}

/** Entrada por link de convite (vale para clubes públicos e privados). */
export async function acceptInvite(userId: string, code: string): Promise<JoinResult> {
  const invite = await db.invite.findUnique({ where: { code }, select: { clubId: true, expiresAt: true } })
  if (!invite || (invite.expiresAt && invite.expiresAt < new Date())) return { error: "invalid" }
  return addMember(userId, invite.clubId)
}

/** Entrada direta pela busca: só clubes públicos. */
export async function joinPublicClub(userId: string, clubId: string): Promise<JoinResult> {
  const club = await db.club.findUnique({ where: { id: clubId }, select: { visibility: true } })
  if (!club) return { error: "invalid" }
  if (club.visibility !== "PUBLIC") return { error: "private" }
  return addMember(userId, clubId)
}

/** "3 de 10 membros · Público" */
export function clubMembersLabel(count: number, maxMembers: number | null, visibility?: "PUBLIC" | "PRIVATE") {
  const members = maxMembers ? `${count} de ${maxMembers} membros` : `${count} ${count === 1 ? "membro" : "membros"}`
  return visibility ? `${members} · ${visibility === "PUBLIC" ? "Público" : "Privado"}` : members
}

export function joinErrorMessage(error: "invalid" | "full" | "private") {
  if (error === "full") return "Esse clube está lotado"
  if (error === "private") return "Esse clube é privado: entre por um link de convite"
  return "Convite inválido ou expirado"
}
