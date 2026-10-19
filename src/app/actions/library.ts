"use server"

import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { requireUserId } from "@/lib/auth"
import { saveCover } from "@/lib/covers"
import { db } from "@/lib/db"
import type { ActionState } from "@/lib/utils-text"

const bookSchema = z.object({
  title: z.string().trim().min(1, "Informe o título").max(200, "Título muito longo (máximo de 200 caracteres)"),
  author: z.string().trim().min(1, "Informe o autor").max(120, "Nome do autor muito longo (máximo de 120 caracteres)"),
  totalPages: z.coerce.number({ message: "Informe o número de páginas" }).int("Use um número inteiro de páginas").min(1, "O livro precisa ter pelo menos 1 página").max(20000, "Máximo de 20.000 páginas"),
  status: z.enum(["WANT", "READING", "DONE"]).default("WANT"),
})

export async function addBook(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  const { coverFile, ...fields } = Object.fromEntries(formData)
  const parsed = bookSchema.safeParse(fields)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  // Só sobe a foto depois de validar o resto, para não deixar arquivo órfão no R2.
  const cover = await saveCover(userId, coverFile ?? null)
  if (cover && "error" in cover) return { error: cover.error }

  const { title, author, totalPages, status } = parsed.data
  const now = new Date()

  await db.book.create({
    data: {
      title,
      author,
      totalPages,
      coverUrl: cover?.path ?? null,
      createdById: userId,
      libraryItems: {
        create: {
          userId,
          status,
          currentPage: status === "DONE" ? totalPages : 0,
          startedAt: status === "WANT" ? null : now,
          finishedAt: status === "DONE" ? now : null,
        },
      },
    },
  })

  refresh()
  return { ok: true }
}

export async function setLibraryStatus(itemId: string, status: "WANT" | "READING" | "DONE") {
  const userId = await requireUserId()
  const item = await db.libraryItem.findFirst({
    where: { id: itemId, userId },
    include: { book: { select: { totalPages: true } } },
  })
  if (!item) return

  const now = new Date()
  // Saindo de "Lido": a página volta para a do último check-in (marcar como lido leva a página ao fim).
  let currentPage = status === "DONE" ? item.book.totalPages : item.currentPage
  if (status !== "DONE" && item.status === "DONE") {
    const last = await db.checkIn.findFirst({
      where: { userId, bookId: item.bookId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { toPage: true },
    })
    currentPage = Math.min(last?.toPage ?? 0, item.book.totalPages - 1)
  }
  await db.libraryItem.update({
    where: { id: item.id },
    data: {
      status,
      startedAt: status !== "WANT" ? (item.startedAt ?? now) : item.startedAt,
      finishedAt: status === "DONE" ? now : null,
      currentPage,
    },
  })
  refresh()
}

export async function removeFromLibrary(itemId: string) {
  const userId = await requireUserId()
  await db.libraryItem.deleteMany({ where: { id: itemId, userId } })
  redirect("/biblioteca")
}
