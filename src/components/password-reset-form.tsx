"use client"

import Link from "next/link"
import { useActionState } from "react"
import { EnvelopeDoodle } from "@/components/doodles"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { requestPasswordReset, updatePassword } from "@/app/actions/auth"

/** Pede o e-mail e envia o link de redefinição. */
export function RequestResetForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined)

  if (state?.sent) {
    return (
      <div className="space-y-6 rounded-3xl bg-card p-6 text-center ring-1 ring-border/60">
        <EnvelopeDoodle className="mx-auto w-28" />
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-primary">Confira seu e-mail</h2>
          <p className="text-sm text-muted-foreground">
            Se existir uma conta com <span className="font-semibold text-foreground">{state.email}</span>, mandamos um link
            para criar uma senha nova. Ele vale por pouco tempo.
          </p>
        </div>
        <Link href="/entrar" className="block text-sm font-semibold text-primary">
          Voltar para o login
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">E-mail da sua conta</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            defaultValue={state?.email}
            required
            className="h-12"
          />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
      </FieldGroup>
      <Button type="submit" size="lg" className="h-13 w-full text-base font-semibold" disabled={pending}>
        {pending ? "Enviando…" : "Enviar link"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Lembrou?{" "}
        <Link href="/entrar" className="font-semibold text-primary">
          Entrar
        </Link>
      </p>
    </form>
  )
}

/** Define a senha nova (a sessão vem do link do e-mail). */
export function NewPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, undefined)

  return (
    <form action={action} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">Nova senha</FieldLabel>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="h-12" />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm">Repita a nova senha</FieldLabel>
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required className="h-12" />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
      </FieldGroup>
      <Button type="submit" size="lg" className="h-13 w-full text-base font-semibold" disabled={pending}>
        {pending ? "Salvando…" : "Salvar nova senha"}
      </Button>
    </form>
  )
}
