"use client"

import { useTransition } from "react"
import { SignOutIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { useConfirm } from "@/components/confirm-dialog"
import { deleteClub, leaveClub } from "@/app/actions/clubs"

/**
 * Sair do clube. O dono, ao sair, passa o clube para `heirName` (admin ou membro mais antigo);
 * se está sozinho, sair apaga o clube. O dono também pode apagar o clube para todos.
 */
export function LeaveClubButton({ clubId, isOwner, heirName }: { clubId: string; isOwner: boolean; heirName: string | null }) {
  const [pending, startTransition] = useTransition()
  const confirm = useConfirm()
  const leaveDescription = !isOwner
    ? "Você sai do ranking e do feed do clube. Seus check-ins continuam no seu perfil."
    : heirName
      ? `${heirName} passa a ser o dono. Para escolher outra pessoa, use “Passar o clube” em Membros.`
      : "Você é o único membro, então o clube será apagado."

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className="w-full text-destructive"
        disabled={pending}
        onClick={async () => {
          const ok = await confirm({
            title: "Sair do clube?",
            description: leaveDescription,
            confirmLabel: isOwner && !heirName ? "Sair e apagar" : "Sair",
            destructive: true,
          })
          if (ok) startTransition(() => leaveClub(clubId))
        }}
      >
        <SignOutIcon /> Sair do clube
      </Button>
      {isOwner && heirName && (
        <Button
          variant="ghost"
          className="w-full text-destructive"
          disabled={pending}
          onClick={async () => {
            const ok = await confirm({
              title: "Apagar o clube para todos?",
              description: "O ranking, os desafios e o histórico do clube somem. Os check-ins continuam no perfil de cada um.",
              confirmLabel: "Apagar clube",
              destructive: true,
            })
            if (ok) startTransition(() => deleteClub(clubId))
          }}
        >
          <TrashIcon /> Apagar clube
        </Button>
      )}
    </div>
  )
}
