"use server"

import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { requireUserId } from "@/lib/auth"
import { db } from "@/lib/db"
import type { ActionState } from "@/lib/utils-text"

const bookSchema = z.object({
  title: z.string().trim().min(1, "Informe o título").max(200),
  author: z.string().trim().min(1, "Informe o autor").max(120),
  totalPages: z.coerce.number().int().min(1, "Número de páginas inválido").max(20000),
  coverUrl: z.union([z.literal(""), z.url("URL da capa inválida")]).optional(),
  status: z.enum(["WANT", "READING", "DONE"]).default("WANT"),
})

export async function addBook(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  const parsed = bookSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const { title, author, totalPages, coverUrl, status } = parsed.data
  const now = new Date()

  await db.book.create({
    data: {
      title,
      author,
      totalPages,
      coverUrl: coverUrl || null,
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
  await db.libraryItem.update({
    where: { id: item.id },
    data: {
      status,
      startedAt: status !== "WANT" ? (item.startedAt ?? now) : item.startedAt,
      finishedAt: status === "DONE" ? now : null,
      currentPage: status === "DONE" ? item.book.totalPages : item.currentPage,
    },
  })
  refresh()
}

export async function removeFromLibrary(itemId: string) {
  const userId = await requireUserId()
  await db.libraryItem.deleteMany({ where: { id: itemId, userId } })
  redirect("/biblioteca")
}
