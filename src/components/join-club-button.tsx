"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { joinPublicClub } from "@/app/actions/clubs"

export function JoinClubButton({ clubId }: { clubId: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await joinPublicClub(clubId)
          if (result?.limit) {
            toast.error(result.error, { action: { label: "Ver o Pro", onClick: () => router.push("/assinatura") } })
          } else if (result?.error) toast.error(result.error)
        })
      }
    >
      {pending ? "Entrando…" : "Entrar"}
    </Button>
  )
}
