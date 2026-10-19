"use server"

import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { requireUserId } from "@/lib/auth"
import { deleteImages, saveCheckInPhoto } from "@/lib/covers"
import { db } from "@/lib/db"
import { dayKey } from "@/lib/dates"
import { findFriendship } from "@/lib/friends"
import { getUserStats } from "@/lib/queries"
import { isReaction } from "@/lib/reactions"
import type { ActionState } from "@/lib/utils-text"

const checkInSchema = z.object({
  itemId: z.string().min(1, "Escolha um livro"),
  toPage: z.coerce.number().int().min(1, "Informe a página em que você parou"),
  minutes: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().min(1, "Minutos inválidos").max(1440, "Minutos inválidos").optional()
  ),
  note: z.string().trim().max(1000).optional(),
})

/** Dados para comemorar o check-in (sequência e meta do dia). */
export type CheckInResult =
  | {
      error?: string
      ok?: boolean
      celebrate?: { streak: number; finished: boolean; goal: { type: "PAGES" | "MINUTES"; target: number; done: number } | null }
    }
  | undefined

export async function createCheckIn(_prev: CheckInResult, formData: FormData): Promise<CheckInResult> {
  const userId = await requireUserId()
  const parsed = checkInSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const { itemId, toPage, minutes, note } = parsed.data
  const item = await db.libraryItem.findFirst({
    where: { id: itemId, userId },
    include: { book: true },
  })
  if (!item) return { error: "Livro não encontrado na sua biblioteca" }

  const { book } = item
  if (toPage <= item.currentPage) {
    return { error: `Você já está na página ${item.currentPage}. Informe uma página maior.` }
  }
  if (toPage > book.totalPages) {
    return { error: `Esse livro tem ${book.totalPages} páginas.` }
  }

  const photo = await saveCheckInPhoto(userId, formData.get("photoFile"))
  if (photo && "error" in photo) return { error: photo.error }

  const now = new Date()
  const finished = toPage === book.totalPages

  await db.$transaction([
    db.checkIn.create({
      data: {
        userId,
        bookId: book.id,
        fromPage: item.currentPage,
        toPage,
        pagesRead: toPage - item.currentPage,
        minutes: minutes ?? null,
        note: note || null,
        photoUrl: photo?.path ?? null,
        day: dayKey(now),
      },
    }),
    db.libraryItem.update({
      where: { id: item.id },
      data: {
        currentPage: toPage,
        status: finished ? "DONE" : "READING",
        startedAt: item.startedAt ?? now,
        finishedAt: finished ? now : null,
      },
    }),
  ])

  const [stats, user] = await Promise.all([
    getUserStats(userId),
    db.user.findUnique({ where: { id: userId }, select: { goalType: true, dailyGoal: true } }),
  ])
  const goal =
    user?.goalType && user.dailyGoal
      ? {
          type: user.goalType,
          target: user.dailyGoal,
          done: user.goalType === "MINUTES" ? stats.minutesToday : stats.pagesToday,
        }
      : null

  refresh()
  return { ok: true, celebrate: { streak: stats.current, finished, goal } }
}

const editSchema = z.object({
  checkInId: z.string().min(1),
  toPage: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().int().optional()),
  minutes: checkInSchema.shape.minutes,
  note: z.string().trim().max(1000).optional(),
  removePhoto: z.literal("on").optional(),
})

/** O check-in do autor e se ele é o mais recente daquele livro (só o último pode mudar a página). */
async function findOwnCheckIn(userId: string, checkInId: string) {
  const checkIn = await db.checkIn.findFirst({
    where: { id: checkInId, userId },
    include: { book: { select: { totalPages: true } } },
  })
  if (!checkIn) return null
  const latest = await db.checkIn.findFirst({
    where: { userId, bookId: checkIn.bookId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { id: true },
  })
  return { checkIn, isLatest: latest?.id === checkIn.id }
}

/**
 * Edita um check-in próprio: nota, minutos e foto sempre; a página final só no check-in
 * mais recente do livro (mudar um antigo quebraria a sequência de páginas dos seguintes).
 */
export async function updateCheckIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  const parsed = editSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const { checkInId, toPage, minutes, note, removePhoto } = parsed.data
  const found = await findOwnCheckIn(userId, checkInId)
  if (!found) return { error: "Check-in não encontrado" }
  const { checkIn, isLatest } = found

  const pageChanged = toPage !== undefined && toPage !== checkIn.toPage
  if (pageChanged) {
    if (!isLatest) return { error: "Só dá para mudar a página do check-in mais recente deste livro." }
    if (toPage <= checkIn.fromPage) return { error: `A página precisa ser maior que ${checkIn.fromPage}.` }
    if (toPage > checkIn.book.totalPages) return { error: `Esse livro tem ${checkIn.book.totalPages} páginas.` }
  }

  const photo = await saveCheckInPhoto(userId, formData.get("photoFile"))
  if (photo && "error" in photo) return { error: photo.error }
  const photoUrl = photo ? photo.path : removePhoto ? null : checkIn.photoUrl

  const finalPage = pageChanged ? toPage : checkIn.toPage
  const finished = finalPage === checkIn.book.totalPages
  await db.$transaction([
    db.checkIn.update({
      where: { id: checkIn.id },
      data: { toPage: finalPage, pagesRead: finalPage - checkIn.fromPage, minutes: minutes ?? null, note: note || null, photoUrl },
    }),
    ...(pageChanged
      ? [
          db.libraryItem.updateMany({
            where: { userId, bookId: checkIn.bookId },
            data: { currentPage: finalPage, status: finished ? "DONE" : "READING", finishedAt: finished ? new Date() : null },
          }),
        ]
      : []),
  ])
  // A foto antiga sai do R2 depois que o banco já aponta para a nova (ou para nenhuma).
  if (photoUrl !== checkIn.photoUrl) await deleteImages([checkIn.photoUrl])

  refresh()
  return { ok: true }
}

/**
 * Apaga um check-in próprio (com comentários, reações e foto). Se for o mais recente
 * do livro, o progresso na biblioteca volta para a página em que ele começou.
 */
export async function deleteCheckIn(checkInId: string) {
  const userId = await requireUserId()
  const found = await findOwnCheckIn(userId, checkInId)
  if (!found) return
  const { checkIn, isLatest } = found

  await db.$transaction([
    db.checkIn.delete({ where: { id: checkIn.id } }),
    ...(isLatest
      ? [
          db.libraryItem.updateMany({
            where: { userId, bookId: checkIn.bookId },
            data: { currentPage: checkIn.fromPage, status: "READING", finishedAt: null },
          }),
        ]
      : []),
  ])
  await deleteImages([checkIn.photoUrl])

  refresh()
  redirect("/feed")
}

/** Só o autor, quem divide um clube com ele ou os amigos dele podem comentar/reagir num check-in. */
async function canInteract(userId: string, checkInId: string) {
  const checkIn = await db.checkIn.findUnique({ where: { id: checkInId }, select: { userId: true } })
  if (!checkIn) return false
  if (checkIn.userId === userId) return true
  const [shared, friendship] = await Promise.all([
    db.clubMember.findFirst({
      where: { userId, club: { members: { some: { userId: checkIn.userId } } } },
      select: { id: true },
    }),
    findFriendship(userId, checkIn.userId),
  ])
  return Boolean(shared) || friendship?.status === "ACCEPTED"
}

const commentSchema = z.object({
  checkInId: z.string().min(1),
  body: z.string().trim().min(1, "Escreva um comentário").max(1000),
})

export async function addComment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  const parsed = commentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const { checkInId, body } = parsed.data
  if (!(await canInteract(userId, checkInId))) return { error: "Você não pode comentar neste check-in" }

  await db.comment.create({ data: { checkInId, userId, body } })
  refresh()
  return { ok: true }
}

/** Liga/desliga uma reação do usuário num check-in. */
export async function toggleReaction(checkInId: string, emoji: string) {
  const userId = await requireUserId()
  if (!isReaction(emoji) || !(await canInteract(userId, checkInId))) return

  const where = { checkInId_userId_emoji: { checkInId, userId, emoji } }
  const existing = await db.reaction.findUnique({ where })
  if (existing) await db.reaction.delete({ where })
  else await db.reaction.create({ data: { checkInId, userId, emoji } })
  refresh()
}
