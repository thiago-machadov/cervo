"use client"

import { useTransition } from "react"
import { TrashIcon } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { deleteChallenge } from "@/app/actions/clubs"

export function DeleteChallengeButton({ challengeId }: { challengeId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      aria-label="Apagar desafio"
      disabled={pending}
      onClick={() => {
        if (!confirm("Apagar este desafio?")) return
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
