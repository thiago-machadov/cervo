"use client"

import { useTransition } from "react"
import { CheckIcon, UserMinusIcon, UserPlusIcon, XIcon } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { removeFriendship, respondFriendRequest, sendFriendRequest, type FriendActionResult } from "@/app/actions/friends"
import type { FriendState } from "@/lib/friends"
import { cn } from "@/lib/utils"

/** Botões de amizade conforme a situação: adicionar, pedido enviado, aceitar/recusar ou amigos. */
export function FriendButton({
  targetId,
  state,
  size = "default",
  className,
}: {
  targetId: string
  state: FriendState
  size?: "default" | "sm"
  className?: string
}) {
  const [pending, startTransition] = useTransition()
  const height = size === "sm" ? "h-9" : "h-11"

  function run(action: () => Promise<FriendActionResult>) {
    startTransition(async () => {
      const result = await action()
      if (result.error) toast.error(result.error)
      else if (result.message) toast.success(result.message)
    })
  }

  if (state.kind === "self") return null

  if (state.kind === "none") {
    return (
      <Button className={cn(height, className)} disabled={pending} onClick={() => run(() => sendFriendRequest(targetId))}>
        <UserPlusIcon /> {pending ? "Enviando…" : "Adicionar amigo"}
      </Button>
    )
  }

  if (state.kind === "sent") {
    return (
      <Button
        variant="outline"
        className={cn(height, className)}
        disabled={pending}
        onClick={() => run(() => removeFriendship(state.friendshipId))}
      >
        <XIcon /> {pending ? "Cancelando…" : "Cancelar pedido"}
      </Button>
    )
  }

  if (state.kind === "received") {
    return (
      <div className={cn("flex gap-2", className)}>
        <Button className={cn(height, "flex-1")} disabled={pending} onClick={() => run(() => respondFriendRequest(state.friendshipId, true))}>
          <CheckIcon weight="bold" /> Aceitar
        </Button>
        <Button
          variant="outline"
          className={cn(height, "flex-1")}
          disabled={pending}
          onClick={() => run(() => respondFriendRequest(state.friendshipId, false))}
        >
          Recusar
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      className={cn(height, className)}
      disabled={pending}
      onClick={() => {
        if (window.confirm("Desfazer a amizade? Vocês deixam de ver a leitura um do outro no feed.")) {
          run(() => removeFriendship(state.friendshipId))
        }
      }}
    >
      <UserMinusIcon /> {pending ? "Removendo…" : "Desfazer amizade"}
    </Button>
  )
}
