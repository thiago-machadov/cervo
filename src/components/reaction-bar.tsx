"use client"

import { useOptimistic, useState, useTransition } from "react"
import { SmileyIcon, XIcon } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"
import { toggleReaction } from "@/app/actions/checkins"
import { REACTIONS, type ReactionEmoji, type ReactionSummary } from "@/lib/reactions"
import { cn } from "@/lib/utils"

function applyToggle(summary: ReactionSummary[], emoji: ReactionEmoji): ReactionSummary[] {
  const current = summary.find((r) => r.emoji === emoji)
  const next = current
    ? summary.map((r) => (r.emoji === emoji ? { ...r, count: r.count + (r.mine ? -1 : 1), mine: !r.mine } : r))
    : [...summary, { emoji, count: 1, mine: true }]
  return REACTIONS.flatMap((e) => next.filter((r) => r.emoji === e && r.count > 0))
}

/** Reações de um check-in: contadores clicáveis + seletor de emoji. */
export function ReactionBar({ checkInId, reactions }: { checkInId: string; reactions: ReactionSummary[] }) {
  const [optimistic, toggleOptimistic] = useOptimistic(reactions, applyToggle)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [, startTransition] = useTransition()

  function toggle(emoji: ReactionEmoji) {
    setPickerOpen(false)
    startTransition(async () => {
      toggleOptimistic(emoji)
      try {
        await toggleReaction(checkInId, emoji)
      } catch {
        // O estado otimista volta sozinho; avisa para a falha não passar despercebida.
        toast.error("Não foi possível reagir. Tente de novo.")
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {optimistic.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => toggle(r.emoji)}
          aria-pressed={r.mine}
          aria-label={`${r.emoji} ${r.count}${r.mine ? " (sua reação, toque para remover)" : ""}`}
          className={cn(
            "flex h-8 items-center gap-1 rounded-full bg-muted px-2.5 text-sm transition-colors pointer-coarse:h-10 pointer-coarse:px-3",
            r.mine && "bg-secondary font-semibold text-secondary-foreground ring-1 ring-primary/40"
          )}
        >
          <span aria-hidden>{r.emoji}</span>
          <span className="text-xs tabular-nums">{r.count}</span>
        </button>
      ))}

      {pickerOpen ? (
        <div
          className="flex items-center gap-0.5 rounded-full bg-card p-0.5 shadow-md ring-1 ring-border"
          role="group"
          aria-label="Escolha uma reação"
          onKeyDown={(event) => event.key === "Escape" && setPickerOpen(false)}
        >
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => toggle(emoji)}
              className="flex size-8 items-center justify-center rounded-full text-lg transition-transform hover:scale-110 active:scale-95 pointer-coarse:size-10"
              aria-label={`Reagir com ${emoji}`}
            >
              {emoji}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPickerOpen(false)}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted pointer-coarse:size-10"
            aria-label="Fechar"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted pointer-coarse:size-10"
          aria-label="Adicionar reação"
        >
          <SmileyIcon className="size-5" />
        </button>
      )}
    </div>
  )
}
