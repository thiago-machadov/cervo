"use client"

import { useEffect } from "react"
import { applyAccent, type AccentId } from "@/lib/accents"

/** Mantém a cor do app igual à salva na conta (e volta ao cobalto se o Pro acabar). */
export function AccentSync({ accent }: { accent: AccentId | null }) {
  useEffect(() => applyAccent(accent), [accent])
  return null
}
