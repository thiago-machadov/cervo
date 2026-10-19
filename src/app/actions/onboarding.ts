"use server"

import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { requireUserId } from "@/lib/auth"
import { acceptInvite, joinErrorMessage, parseInviteCode } from "@/lib/clubs"
import { saveCover } from "@/lib/covers"
import { db } from "@/lib/db"
import { safeNext } from "@/lib/redirects"
import type { ActionState } from "@/lib/utils-text"

const goalSchema = z.object({
  goalType: z.enum(["PAGES", "MINUTES"], "Escolha páginas ou minutos"),
  dailyGoal: z.coerce.number("Escolha sua meta").int().min(1, "A meta precisa ser maior que zero").max(1000, "Meta alta demais"),
})

/** Define (ou altera) a meta diária. Usado no onboarding e no perfil. */
export async function saveGoal(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  const parsed = goalSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  await db.user.update({ where: { id: userId }, data: parsed.data })
  refresh()
  return { ok: true }
}

const firstBookSchema = z
  .object({
    title: z.string().trim().min(1, "Informe o título").max(200),
    author: z.string().trim().min(1, "Informe o autor").max(120),
    totalPages: z.coerce.number().int().min(1, "Número de páginas inválido").max(20000),
    currentPage: z.preprocess((v) => (v === "" ? 0 : v), z.coerce.number().int().min(0, "Página atual inválida")),
  })
  .refine((b) => b.currentPage < b.totalPages, {
    message: "A página atual precisa ser menor que o total de páginas",
  })

export async function saveFirstBook(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  const { coverFile, ...fields } = Object.fromEntries(formData)
  const parsed = firstBookSchema.safeParse(fields)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const cover = await saveCover(userId, coverFile ?? null)
  if (cover && "error" in cover) return { error: cover.error }

  const { title, author, totalPages, currentPage } = parsed.data
  await db.book.create({
    data: {
      title,
      author,
      totalPages,
      coverUrl: cover?.path ?? null,
      createdById: userId,
      libraryItems: { create: { userId, status: "READING", currentPage, startedAt: new Date() } },
    },
  })
  refresh()
  return { ok: true }
}

const finishSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("skip") }),
  z.object({ mode: z.literal("create"), clubName: z.string().trim().min(2, "Dê um nome ao clube").max(80) }),
  z.object({ mode: z.literal("join"), invite: z.string().trim().min(1, "Cole o link ou código do convite") }),
])

export async function finishOnboarding(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { dailyGoal: true, library: { where: { status: "READING" }, orderBy: { createdAt: "desc" }, take: 1 } },
  })
  // A meta é obrigatória (o livro pode ser pulado): não deixa concluir pulando etapas pela URL.
  if (!user?.dailyGoal) return { error: "Defina sua meta diária primeiro" }

  const parsed = finishSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  let destination = safeNext(formData.get("next"))
  const input = parsed.data

  if (input.mode === "join") {
    const result = await acceptInvite(userId, parseInviteCode(input.invite))
    if ("error" in result) return { error: joinErrorMessage(result.error) }
    destination = `/clubes/${result.clubId}`
  } else if (input.mode === "create") {
    // Sem livro (passo pulado), o clube nasce sem livro definido; o dono escolhe depois.
    const bookId = user.library[0]?.bookId ?? null
    const club = await db.club.create({
      data: {
        name: input.clubName,
        ownerId: userId,
        bookId,
        bookStartedAt: bookId ? new Date() : null,
        members: { create: { userId, role: "OWNER" } },
      },
    })
    destination = `/clubes/${club.id}`
  }

  await db.user.update({ where: { id: userId }, data: { onboardedAt: new Date() } })
  redirect(destination)
}
