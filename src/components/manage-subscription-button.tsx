"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { openPortal } from "@/app/actions/billing"

/** Abre o portal do Stripe (trocar cartão, mudar de plano, faturas, cancelar). */
export function ManageSubscriptionButton({ label = "Gerenciar assinatura" }: { label?: string }) {
  const [state, action, pending] = useActionState(() => openPortal(), undefined)
  return (
    <form action={action} className="space-y-2">
      <Button type="submit" variant="outline" className="h-11 w-full" disabled={pending}>
        {pending ? "Abrindo…" : label}
      </Button>
      {state?.error && <FieldError>{state.error}</FieldError>}
    </form>
  )
}
