import "server-only"
import { db } from "@/lib/db"
import { FREE_CLUB_LIMIT, remainingClubSlots } from "@/lib/plan"

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

export type JoinResult = { clubId: string } | { error: "invalid" | "full" | "private" | "limit" }

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
  if ((await remainingClubSlots(userId)) === 0) return { error: "limit" }

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

export const CLUB_LIMIT_MESSAGE = `No plano grátis você participa de até ${FREE_CLUB_LIMIT} clubes. Saia de um ou assine o Cervo Pro para ter clubes ilimitados.`

export function joinErrorMessage(error: "invalid" | "full" | "private" | "limit") {
  if (error === "full") return "Esse clube está lotado"
  if (error === "limit") return CLUB_LIMIT_MESSAGE
  if (error === "private") return "Esse clube é privado: entre por um link de convite"
  return "Convite inválido ou expirado"
}

export type ClubRoleName = "OWNER" | "ADMIN" | "MEMBER"

export const ROLE_LABEL: Record<ClubRoleName, string> = { OWNER: "Dono", ADMIN: "Admin", MEMBER: "Membro" }

/** Papel do usuário no clube, ou null se não for membro. */
export async function getClubRole(clubId: string, userId: string): Promise<ClubRoleName | null> {
  const member = await db.clubMember.findUnique({ where: { clubId_userId: { clubId, userId } }, select: { role: true } })
  return member?.role ?? null
}

/** Dono e admins editam o clube e removem membros comuns. */
export function canManageClub(role: ClubRoleName | null) {
  return role === "OWNER" || role === "ADMIN"
}

/** Passa o clube para outro membro (o antigo dono vira admin). */
export async function transferClub(clubId: string, fromUserId: string, toUserId: string) {
  await db.$transaction([
    db.club.update({ where: { id: clubId }, data: { ownerId: toUserId } }),
    db.clubMember.update({ where: { clubId_userId: { clubId, userId: toUserId } }, data: { role: "OWNER" } }),
    db.clubMember.update({ where: { clubId_userId: { clubId, userId: fromUserId } }, data: { role: "ADMIN" } }),
  ])
}

/**
 * Quem herda o clube quando o dono sai: o admin mais antigo ou, sem admins,
 * o membro mais antigo. Devolve null se o dono está sozinho.
 */
export async function findClubHeir(clubId: string, ownerId: string) {
  const members = await db.clubMember.findMany({
    where: { clubId, userId: { not: ownerId } },
    orderBy: { joinedAt: "asc" },
    select: { userId: true, role: true, user: { select: { name: true } } },
  })
  return members.find((m) => m.role === "ADMIN") ?? members[0] ?? null
}

/** O dono sai do clube: passa para o herdeiro e sai; sozinho, o clube é apagado. */
export async function ownerLeaveClub(clubId: string, ownerId: string) {
  const heir = await findClubHeir(clubId, ownerId)
  if (!heir) {
    await db.club.delete({ where: { id: clubId } })
    return
  }
  await transferClub(clubId, ownerId, heir.userId)
  await db.clubMember.delete({ where: { clubId_userId: { clubId, userId: ownerId } } })
}
