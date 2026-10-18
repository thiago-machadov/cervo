"use client"

import { useActionState, useState } from "react"
import { WarningIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { deleteMyAccount } from "@/app/actions/account"

export function DeleteAccountForm({ ownedClubs }: { ownedClubs: number }) {
  const [state, action, pending] = useActionState(deleteMyAccount, undefined)
  const [typed, setTyped] = useState("")
  const ready = typed.trim().toUpperCase() === "EXCLUIR"

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-destructive/40 p-4">
      <div className="flex gap-3">
        <WarningIcon className="size-6 shrink-0 text-destructive" weight="fill" />
        <div className="space-y-2 text-sm">
          <p className="font-semibold">Excluir minha conta</p>
          <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
            <li>Apaga na hora seu perfil, biblioteca, check-ins, fotos, comentários, reações, amizades e feedbacks.</li>
            <li>Livros que estão na biblioteca de outras pessoas continuam lá, sem o seu nome.</li>
            {ownedClubs > 0 && (
              <li>
                {ownedClubs === 1 ? "O clube que você criou passa" : `Os ${ownedClubs} clubes que você criou passam`} para o
                admin (ou membro) mais antigo. Clubes em que só você participa são apagados.
              </li>
            )}
            <li>Não dá para desfazer. Se quiser, baixe seus dados antes.</li>
          </ul>
        </div>
      </div>
      <Field>
        <FieldLabel htmlFor="confirm">Para confirmar, digite EXCLUIR</FieldLabel>
        <Input
          id="confirm"
          name="confirm"
          autoComplete="off"
          autoCapitalize="characters"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="h-11"
        />
        <FieldDescription>Depois disso, você sai do app automaticamente.</FieldDescription>
      </Field>
      {state?.error && <FieldError>{state.error}</FieldError>}
      <Button type="submit" variant="destructive" className="h-11 w-full" disabled={!ready || pending}>
        {pending ? "Excluindo…" : "Excluir conta definitivamente"}
      </Button>
    </form>
  )
}
