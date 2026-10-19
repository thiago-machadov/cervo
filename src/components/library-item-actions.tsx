"use client"

import { useTransition } from "react"
import { TrashIcon } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useConfirm } from "@/components/confirm-dialog"
import { removeFromLibrary, setLibraryStatus } from "@/app/actions/library"
import { cn } from "@/lib/utils"
import { STATUS_LABEL } from "@/lib/utils-text"

type Status = "WANT" | "READING" | "DONE"

/**
 * Status do livro na biblioteca (grupo de opções, não abas: muda o dado, não a tela).
 * Marcar como lido leva o progresso a 100%: pede confirmação e oferece desfazer.
 */
export function LibraryStatusTabs({
  itemId,
  status,
  currentPage,
  totalPages,
}: {
  itemId: string
  status: string
  currentPage: number
  totalPages: number
}) {
  const [pending, startTransition] = useTransition()
  const confirm = useConfirm()

  async function choose(next: Status) {
    if (next === status) return
    const previous = status as Status
    if (next === "DONE" && currentPage < totalPages) {
      const ok = await confirm({
        title: "Marcar como lido?",
        description: `Seu progresso vai para 100% (você está na página ${currentPage} de ${totalPages}).`,
        confirmLabel: "Marcar como lido",
      })
      if (!ok) return
    }
    startTransition(async () => {
      await setLibraryStatus(itemId, next)
      toast.success(`Movido para “${STATUS_LABEL[next]}”`, {
        // Tempo suficiente para perceber e desfazer.
        duration: 8000,
        action: { label: "Desfazer", onClick: () => startTransition(() => setLibraryStatus(itemId, previous)) },
      })
    })
  }

  return (
    <div className="space-y-2">
      <p id={`status-${itemId}`} className="text-xs font-medium text-muted-foreground">
        Status
      </p>
      <div
        role="radiogroup"
        aria-labelledby={`status-${itemId}`}
        aria-busy={pending}
        className="grid grid-cols-3 gap-1 rounded-full bg-muted p-1"
      >
        {(Object.keys(STATUS_LABEL) as Status[]).map((key) => {
          const selected = key === status
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={pending}
              onClick={() => choose(key)}
              className={cn(
                "h-10 rounded-full text-sm font-medium text-muted-foreground transition-colors disabled:opacity-60",
                selected && "bg-card text-foreground shadow-sm"
              )}
            >
              {STATUS_LABEL[key]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function RemoveFromLibraryButton({ itemId }: { itemId: string }) {
  const [pending, startTransition] = useTransition()
  const confirm = useConfirm()

  return (
    <Button
      variant="destructive"
      className="w-full"
      disabled={pending}
      onClick={async () => {
        const ok = await confirm({
          title: "Remover este livro da biblioteca?",
          description: "Ele sai da sua lista e o progresso salvo é perdido. Seus check-ins continuam no histórico.",
          confirmLabel: "Remover",
          destructive: true,
        })
        if (ok) startTransition(() => removeFromLibrary(itemId))
      }}
    >
      <TrashIcon /> Remover da biblioteca
    </Button>
  )
}
