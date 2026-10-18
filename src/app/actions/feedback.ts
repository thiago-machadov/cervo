"use server"

import { headers } from "next/headers"
import { z } from "zod"
import { requireUserId } from "@/lib/auth"
import { db } from "@/lib/db"
import type { ActionState } from "@/lib/utils-text"

const feedbackSchema = z.object({
  kind: z.enum(["BUG", "IDEA", "PRAISE", "OTHER"], { message: "Escolha o tipo de feedback" }),
  message: z.string().trim().min(5, "Conte um pouco mais (mínimo de 5 caracteres)").max(2000, "Máximo de 2000 caracteres"),
})

export async function sendFeedback(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  const parsed = feedbackSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  // Limite simples contra spam: no máximo 10 feedbacks por dia por pessoa.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recent = await db.feedback.count({ where: { userId, createdAt: { gte: since } } })
  if (recent >= 10) return { error: "Você já mandou bastante feedback hoje. Obrigado! Tente de novo amanhã." }

  const userAgent = (await headers()).get("user-agent")?.slice(0, 300) ?? null
  await db.feedback.create({ data: { userId, ...parsed.data, userAgent } })
  return { ok: true }
}
