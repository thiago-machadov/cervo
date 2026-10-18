"use server"

import { randomBytes } from "node:crypto"
import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { requireUserId } from "@/lib/auth"
import {
  acceptInvite,
  CLUB_LIMIT_MESSAGE,
  ensureReading,
  getClubRole,
  joinPublicClub as joinPublic,
  ownerLeaveClub,
  transferClub,
} from "@/lib/clubs"
import { db } from "@/lib/db"
import { periodLength } from "@/lib/challenges"
import { dayKey } from "@/lib/dates"
import { isPro, remainingClubSlots } from "@/lib/plan"
import type { ActionState } from "@/lib/utils-text"

const optionalInt = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().int().min(1, "Páginas por semana inválidas").max(5000).optional()
)
const optionalDate = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.iso.date("Data inválida").optional()
)

const clubSchema = z.object({
  name: z.string().trim().min(2, "Dê um nome ao clube").max(80),
  description: z.string().trim().max(500).optional(),
  bookId: z.string().optional(),
  goalEndDate: optionalDate,
  weeklyPages: optionalInt,
  visibility: z.enum(["PRIVATE", "PUBLIC"]).default("PRIVATE"),
  readingMode: z.enum(["FIXED", "FREE"]).default("FIXED"),
  maxMembers: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().min(2, "O limite precisa ser de pelo menos 2 pessoas").max(1000, "Limite alto demais").optional()
  ),
})

/** O usuário só pode escolher livros que estão na própria biblioteca. */
async function bookFromLibrary(userId: string, bookId?: string) {
  if (!bookId) return null
  const item = await db.libraryItem.findUnique({ where: { userId_bookId: { userId, bookId } } })
  return item ? bookId : null
}

function goalDate(value?: string) {
  // Meio-dia UTC evita que a data "volte" um dia ao exibir em fusos negativos.
  return value ? new Date(`${value}T12:00:00Z`) : null
}

export async function createClub(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  if ((await remainingClubSlots(userId)) === 0) return { error: CLUB_LIMIT_MESSAGE }
  const parsed = clubSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const { name, description, weeklyPages, visibility, maxMembers, readingMode } = parsed.data
  // Na leitura livre não existe livro do clube nem data final.
  const bookId = readingMode === "FIXED" ? await bookFromLibrary(userId, parsed.data.bookId) : null
  const goalEndDate = readingMode === "FIXED" ? parsed.data.goalEndDate : undefined

  const club = await db.club.create({
    data: {
      name,
      description: description || null,
      ownerId: userId,
      bookId,
      bookStartedAt: bookId ? new Date() : null,
      goalEndDate: goalDate(goalEndDate),
      weeklyPages: weeklyPages ?? null,
      visibility,
      maxMembers: maxMembers ?? null,
      readingMode,
      members: { create: { userId, role: "OWNER" } },
    },
  })
  if (bookId) await ensureReading(userId, bookId)

  redirect(`/clubes/${club.id}`)
}

export async function updateClub(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  const clubId = String(formData.get("clubId") ?? "")
  const club = await db.club.findFirst({
    where: { id: clubId, members: { some: { userId, role: { in: ["OWNER", "ADMIN"] } } } },
    include: { members: { select: { userId: true } } },
  })
  if (!club) return { error: "Só o dono e os admins podem editar o clube" }

  const parsed = clubSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const { name, description, weeklyPages, visibility, maxMembers, readingMode } = parsed.data
  const goalEndDate = readingMode === "FIXED" ? parsed.data.goalEndDate : undefined
  if (maxMembers !== undefined && maxMembers < club.members.length) {
    return { error: `O clube já tem ${club.members.length} membros; o limite não pode ser menor que isso` }
  }
  const bookId = readingMode === "FIXED" ? ((await bookFromLibrary(userId, parsed.data.bookId)) ?? club.bookId) : null
  const modeChanged = readingMode !== club.readingMode
  const bookChanged = bookId !== club.bookId

  await db.club.update({
    where: { id: club.id },
    data: {
      name,
      description: description || null,
      bookId,
      // Início do período do ranking: muda quando troca o livro ou o modo de leitura.
      bookStartedAt: bookChanged || modeChanged ? new Date() : club.bookStartedAt,
      goalEndDate: goalDate(goalEndDate),
      weeklyPages: weeklyPages ?? null,
      visibility,
      maxMembers: maxMembers ?? null,
      readingMode,
    },
  })
  if (bookChanged && bookId) {
    for (const member of club.members) await ensureReading(member.userId, bookId)
  }

  redirect(`/clubes/${club.id}`)
}

/** Gera (ou reaproveita) um convite válido e devolve o código. */
export async function createInvite(clubId: string): Promise<{ code?: string; error?: string }> {
  const userId = await requireUserId()
  const member = await db.clubMember.findUnique({ where: { clubId_userId: { clubId, userId } } })
  if (!member) return { error: "Você não faz parte deste clube" }

  const existing = await db.invite.findFirst({
    where: { clubId, createdById: userId, expiresAt: { gt: new Date(Date.now() + 24 * 60 * 60 * 1000) } },
    orderBy: { createdAt: "desc" },
  })
  if (existing) return { code: existing.code }

  const invite = await db.invite.create({
    data: {
      clubId,
      createdById: userId,
      code: randomBytes(6).toString("base64url"),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })
  return { code: invite.code }
}

export async function joinClub(code: string) {
  const userId = await requireUserId()
  const result = await acceptInvite(userId, code)
  redirect("clubId" in result ? `/clubes/${result.clubId}` : `/convite/${code}`)
}

/** Entrar num clube público a partir da busca. */
export async function joinPublicClub(clubId: string): Promise<{ error?: string; limit?: boolean } | void> {
  const userId = await requireUserId()
  const result = await joinPublic(userId, clubId)
  if ("error" in result) {
    if (result.error === "limit") return { error: CLUB_LIMIT_MESSAGE, limit: true }
    return { error: result.error === "full" ? "Esse clube lotou" : "Não foi possível entrar nesse clube" }
  }
  redirect(`/clubes/${result.clubId}`)
}

export async function leaveClub(clubId: string) {
  const userId = await requireUserId()
  const role = await getClubRole(clubId, userId)
  if (!role) return
  if (role === "OWNER") {
    // Dono saindo: o clube passa para o admin (ou membro) mais antigo; sozinho, é apagado.
    await ownerLeaveClub(clubId, userId)
  } else {
    await db.clubMember.deleteMany({ where: { clubId, userId } })
  }
  refresh()
  redirect("/clubes")
}

/** Apaga o clube para todos. Só o dono. */
export async function deleteClub(clubId: string) {
  const userId = await requireUserId()
  const { count } = await db.club.deleteMany({ where: { id: clubId, ownerId: userId } })
  if (count === 0) return
  refresh()
  redirect("/clubes")
}

export type MemberActionResult = { ok?: true; message?: string; error?: string }

/** Dono remove qualquer um; admin remove só membros comuns. */
export async function removeMember(clubId: string, memberId: string): Promise<MemberActionResult> {
  const userId = await requireUserId()
  if (memberId === userId) return { error: "Para sair, use “Sair do clube”" }
  const [actorRole, targetRole] = await Promise.all([getClubRole(clubId, userId), getClubRole(clubId, memberId)])
  if (!targetRole) return { error: "Essa pessoa não está no clube" }
  const allowed = actorRole === "OWNER" || (actorRole === "ADMIN" && targetRole === "MEMBER")
  if (!allowed || targetRole === "OWNER") return { error: "Você não pode remover essa pessoa" }

  await db.clubMember.delete({ where: { clubId_userId: { clubId, userId: memberId } } })
  refresh()
  return { ok: true, message: "Removido do clube" }
}

/** Promove a admin ou volta a membro. Só o dono. */
export async function setMemberRole(clubId: string, memberId: string, role: "ADMIN" | "MEMBER"): Promise<MemberActionResult> {
  const userId = await requireUserId()
  if (role !== "ADMIN" && role !== "MEMBER") return { error: "Papel inválido" }
  const [actorRole, targetRole] = await Promise.all([getClubRole(clubId, userId), getClubRole(clubId, memberId)])
  if (actorRole !== "OWNER") return { error: "Só o dono muda os papéis" }
  if (!targetRole || targetRole === "OWNER") return { error: "Não dá para mudar o papel dessa pessoa" }

  await db.clubMember.update({ where: { clubId_userId: { clubId, userId: memberId } }, data: { role } })
  refresh()
  return { ok: true, message: role === "ADMIN" ? "Agora é admin" : "Voltou a ser membro" }
}

/** Passa o clube para outro membro; o dono atual vira admin. */
export async function transferOwnership(clubId: string, memberId: string): Promise<MemberActionResult> {
  const userId = await requireUserId()
  const [actorRole, targetRole] = await Promise.all([getClubRole(clubId, userId), getClubRole(clubId, memberId)])
  if (actorRole !== "OWNER") return { error: "Só o dono pode passar o clube" }
  if (!targetRole || memberId === userId) return { error: "Escolha outro membro do clube" }

  await transferClub(clubId, userId, memberId)
  refresh()
  return { ok: true, message: "O clube tem um novo dono" }
}

const challengeSchema = z.object({
  clubId: z.string().min(1),
  title: z.string().trim().min(3, "Dê um nome ao desafio").max(60),
  targetDays: z.coerce.number().int().min(1, "Meta de dias inválida").max(366),
  startsOn: z.iso.date("Data de início inválida"),
  endsOn: z.iso.date("Data de fim inválida"),
})

/** Só dono/admins criam desafios, e só se o dono do clube for Pro. */
async function canRunChallenges(clubId: string, userId: string) {
  const [role, club] = await Promise.all([
    getClubRole(clubId, userId),
    db.club.findUnique({ where: { id: clubId }, select: { ownerId: true } }),
  ])
  if (!club || (role !== "OWNER" && role !== "ADMIN")) return "Só o dono e os admins criam desafios"
  if (!(await isPro(club.ownerId))) return "Desafios são um recurso do Cervo Pro do dono do clube"
  return null
}

export async function createChallenge(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  const parsed = challengeSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const { clubId, title, targetDays, startsOn, endsOn } = parsed.data

  const denied = await canRunChallenges(clubId, userId)
  if (denied) return { error: denied }
  if (endsOn < startsOn) return { error: "O fim precisa ser depois do início" }
  const length = periodLength(startsOn, endsOn)
  if (length > 366) return { error: "O desafio pode durar no máximo um ano" }
  if (targetDays > length) return { error: `O período tem ${length} dias; a meta não pode passar disso` }
  if (endsOn < dayKey()) return { error: "Esse período já terminou" }

  await db.clubChallenge.create({ data: { clubId, title, targetDays, startsOn, endsOn, createdById: userId } })
  refresh()
  return { ok: true }
}

export async function deleteChallenge(challengeId: string): Promise<{ error?: string } | void> {
  const userId = await requireUserId()
  const challenge = await db.clubChallenge.findUnique({ where: { id: challengeId }, select: { clubId: true } })
  if (!challenge) return
  const role = await getClubRole(challenge.clubId, userId)
  if (role !== "OWNER" && role !== "ADMIN") return { error: "Só o dono e os admins apagam desafios" }
  await db.clubChallenge.delete({ where: { id: challengeId } })
  refresh()
}
