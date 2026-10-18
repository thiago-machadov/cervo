"use server"

import { refresh } from "next/cache"
import { z } from "zod"
import { requireUserId } from "@/lib/auth"
import { db } from "@/lib/db"
import { dayKey } from "@/lib/dates"
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

export async function createCheckIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
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

  refresh()
  return { ok: true }
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
  const checkIn = await db.checkIn.findUnique({ where: { id: checkInId }, select: { userId: true } })
  if (!checkIn) return { error: "Check-in não encontrado" }

  // Só quem divide um clube com o autor (ou o próprio autor) pode comentar.
  if (checkIn.userId !== userId) {
    const shared = await db.clubMember.findFirst({
      where: { userId, club: { members: { some: { userId: checkIn.userId } } } },
      select: { id: true },
    })
    if (!shared) return { error: "Você não pode comentar neste check-in" }
  }

  await db.comment.create({ data: { checkInId, userId, body } })
  refresh()
  return { ok: true }
}
