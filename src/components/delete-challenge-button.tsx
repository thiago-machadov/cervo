"use client"

import { useTransition } from "react"
import { TrashIcon } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useConfirm } from "@/components/confirm-dialog"
import { deleteChallenge } from "@/app/actions/clubs"

export function DeleteChallengeButton({ challengeId }: { challengeId: string }) {
  const [pending, startTransition] = useTransition()
  const confirm = useConfirm()
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      aria-label="Apagar desafio"
      disabled={pending}
      onClick={async () => {
        const ok = await confirm({
          title: "Apagar este desafio?",
          description: "O progresso de todos no desafio deixa de aparecer. Os check-ins não são afetados.",
          confirmLabel: "Apagar",
          destructive: true,
        })
        if (!ok) return
        startTransition(async () => {
          const result = await deleteChallenge(challengeId)
          if (result?.error) toast.error(result.error)
        })
      }}
    >
      <TrashIcon />
    </Button>
  )
}
