"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr"

/** Recarrega os dados da tela de tempos em tempos (ex.: esperando o Stripe confirmar). */
export function AutoRefresh({ everyMs = 3000, times = 5 }: { everyMs?: number; times?: number }) {
  const router = useRouter()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (count >= times) return
    const timer = setTimeout(() => {
      router.refresh()
      setCount((n) => n + 1)
    }, everyMs)
    return () => clearTimeout(timer)
  }, [count, everyMs, times, router])

  if (count >= times) return null
  return (
    <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground">
      <CircleNotchIcon className="size-4 animate-spin" /> Confirmando com o Stripe…
    </p>
  )
}
