"use client"

import { useTransition } from "react"
import { LogOutIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { leaveClub } from "@/app/actions/clubs"

export function LeaveClubButton({ clubId, isOwner }: { clubId: string; isOwner: boolean }) {
  const [pending, startTransition] = useTransition()
  const message = isOwner
    ? "Você criou este clube. Sair vai apagar o clube para todos. Continuar?"
    : "Sair deste clube?"

  return (
    <Button
      variant="ghost"
      className="w-full text-destructive"
      disabled={pending}
      onClick={() => {
        if (confirm(message)) startTransition(() => leaveClub(clubId))
      }}
    >
      <LogOutIcon /> {isOwner ? "Apagar clube" : "Sair do clube"}
    </Button>
  )
}
