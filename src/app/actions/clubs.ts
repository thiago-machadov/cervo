"use server"

import { randomBytes } from "node:crypto"
import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { requireUserId } from "@/lib/auth"
import { acceptInvite, ensureReading } from "@/lib/clubs"
import { db } from "@/lib/db"
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
  const parsed = clubSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const { name, description, goalEndDate, weeklyPages } = parsed.data
  const bookId = await bookFromLibrary(userId, parsed.data.bookId)

  const club = await db.club.create({
    data: {
      name,
      description: description || null,
      ownerId: userId,
      bookId,
      bookStartedAt: bookId ? new Date() : null,
      goalEndDate: goalDate(goalEndDate),
      weeklyPages: weeklyPages ?? null,
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
    where: { id: clubId, ownerId: userId },
    include: { members: { select: { userId: true } } },
  })
  if (!club) return { error: "Só quem criou o clube pode editá-lo" }

  const parsed = clubSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const { name, description, goalEndDate, weeklyPages } = parsed.data
  const bookId = (await bookFromLibrary(userId, parsed.data.bookId)) ?? club.bookId
  const bookChanged = bookId !== club.bookId

  await db.club.update({
    where: { id: club.id },
    data: {
      name,
      description: description || null,
      bookId,
      bookStartedAt: bookChanged ? new Date() : club.bookStartedAt,
      goalEndDate: goalDate(goalEndDate),
      weeklyPages: weeklyPages ?? null,
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
  const clubId = await acceptInvite(userId, code)
  redirect(clubId ? `/clubes/${clubId}` : `/convite/${code}`)
}

export async function leaveClub(clubId: string) {
  const userId = await requireUserId()
  const club = await db.club.findUnique({ where: { id: clubId }, select: { ownerId: true } })
  if (!club) return
  if (club.ownerId === userId) {
    // Dono saindo: apaga o clube inteiro.
    await db.club.delete({ where: { id: clubId } })
  } else {
    await db.clubMember.deleteMany({ where: { clubId, userId } })
  }
  refresh()
  redirect("/clubes")
}
