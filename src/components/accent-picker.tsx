"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { CheckIcon, LockSimpleIcon } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"
import { setAccent } from "@/app/actions/preferences"
import { ACCENTS, applyAccent, type AccentId } from "@/lib/accents"
import { cn } from "@/lib/utils"

/** Escolha da cor do app. No grátis, mostra as opções bloqueadas com link para o Pro. */
export function AccentPicker({ current, isPro }: { current: AccentId; isPro: boolean }) {
  const [selected, setSelected] = useState<AccentId>(current)
  const [, startTransition] = useTransition()

  function choose(id: AccentId) {
    const previous = selected
    setSelected(id)
    applyAccent(id)
    startTransition(async () => {
      const result = await setAccent(id)
      if (result?.error) {
        setSelected(previous)
        applyAccent(previous)
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-3 rounded-2xl bg-card p-4 ring-1 ring-border/60">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Cor do app</p>
        {!isPro && (
          <Link href="/assinatura" className="flex items-center gap-1 text-xs font-semibold text-primary">
            <LockSimpleIcon className="size-3.5" weight="fill" /> Pro
          </Link>
        )}
      </div>
      <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Cor do app">
        {ACCENTS.map((accent) => {
          const active = accent.id === selected
          const locked = !isPro && accent.id !== "cobalto"
          return (
            <button
              key={accent.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={locked ? `${accent.label} (Pro)` : accent.label}
              disabled={locked}
              onClick={() => choose(accent.id)}
              className={cn(
                "relative flex size-10 items-center justify-center rounded-full ring-offset-2 ring-offset-card transition-transform active:scale-95",
                active && "ring-2 ring-foreground",
                locked && "opacity-40"
              )}
              style={{ background: accent.swatch }}
            >
              {active && <CheckIcon className="size-4 text-white" weight="bold" />}
              {locked && <LockSimpleIcon className="size-3.5 text-white" weight="fill" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
