"use server"

import { refresh } from "next/cache"
import { requireUserId } from "@/lib/auth"
import { isAccent } from "@/lib/accents"
import { db } from "@/lib/db"
import { isPro } from "@/lib/plan"

/** Salva a cor do app (recurso Pro; cobalto é o padrão e sempre permitido). */
export async function setAccent(accent: string): Promise<{ error?: string } | void> {
  const userId = await requireUserId()
  if (!isAccent(accent)) return { error: "Cor inválida" }
  if (accent !== "cobalto" && !(await isPro(userId))) return { error: "As cores do app são do Cervo Pro" }

  await db.user.update({ where: { id: userId }, data: { accent: accent === "cobalto" ? null : accent } })
  refresh()
}
