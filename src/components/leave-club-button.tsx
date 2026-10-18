"use client"

import { useTransition } from "react"
import { SignOutIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { deleteClub, leaveClub } from "@/app/actions/clubs"

/**
 * Sair do clube. O dono, ao sair, passa o clube para `heirName` (admin ou membro mais antigo);
 * se está sozinho, sair apaga o clube. O dono também pode apagar o clube para todos.
 */
export function LeaveClubButton({ clubId, isOwner, heirName }: { clubId: string; isOwner: boolean; heirName: string | null }) {
  const [pending, startTransition] = useTransition()
  const leaveMessage = !isOwner
    ? "Sair deste clube?"
    : heirName
      ? `Sair do clube? ${heirName} passa a ser o dono. (Para escolher outra pessoa, use “Passar o clube” em Membros.)`
      : "Você é o único membro. Sair vai apagar o clube. Continuar?"

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className="w-full text-destructive"
        disabled={pending}
        onClick={() => {
          if (confirm(leaveMessage)) startTransition(() => leaveClub(clubId))
        }}
      >
        <SignOutIcon /> Sair do clube
      </Button>
      {isOwner && heirName && (
        <Button
          variant="ghost"
          className="w-full text-destructive"
          disabled={pending}
          onClick={() => {
            if (confirm("Apagar o clube para todos os membros? O ranking e o histórico do clube somem. Os check-ins continuam no perfil de cada um."))
              startTransition(() => deleteClub(clubId))
          }}
        >
          <TrashIcon /> Apagar clube
        </Button>
      )}
    </div>
  )
}
