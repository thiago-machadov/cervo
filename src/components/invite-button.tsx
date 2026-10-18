"use client"

import { useTransition } from "react"
import { UserPlusIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { createInvite } from "@/app/actions/clubs"

export function InviteButton({ clubId, clubName }: { clubId: string; clubName: string }) {
  const [pending, startTransition] = useTransition()

  function invite() {
    startTransition(async () => {
      const result = await createInvite(clubId)
      if (!result.code) {
        toast.error(result.error ?? "Não foi possível gerar o convite")
        return
      }

      const url = `${window.location.origin}/convite/${result.code}`
      const shareData = { title: clubName, text: `Bora ler junto no clube "${clubName}"?`, url }

      if (navigator.share && navigator.canShare?.(shareData)) {
        try {
          await navigator.share(shareData)
          return
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return
        }
      }

      try {
        await navigator.clipboard.writeText(url)
        toast.success("Link de convite copiado!", { description: "Válido por 7 dias." })
      } catch {
        toast.message("Link de convite", { description: url, duration: 15000 })
      }
    })
  }

  return (
    <Button onClick={invite} disabled={pending} variant="outline" className="h-10 flex-1">
      <UserPlusIcon /> {pending ? "Gerando…" : "Convidar"}
    </Button>
  )
}
