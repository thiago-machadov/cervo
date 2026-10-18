"use client"

import { useFormStatus } from "react-dom"
import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"

/** Botão de envio para formulários com Server Action: mostra carregando e bloqueia clique duplo. */
export function SubmitButton({
  children,
  pendingText,
  ...props
}: React.ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-busy={pending} {...props}>
      {pending ? (
        <>
          <CircleNotchIcon className="size-5 animate-spin" /> {pendingText ?? "Aguarde…"}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
