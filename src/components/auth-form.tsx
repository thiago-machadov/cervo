"use client"

import Link from "next/link"
import { useActionState } from "react"
import { EnvelopeDoodle } from "@/components/doodles"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { resendConfirmation, signIn, signUp, type AuthState } from "@/app/actions/auth"

export function AuthForm({ mode, next, initialError }: { mode: "signin" | "signup"; next?: string; initialError?: string }) {
  const [state, action, pending] = useActionState(mode === "signin" ? signIn : signUp, undefined)
  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : ""

  if (state?.confirmEmail) return <CheckEmail email={state.confirmEmail} next={next} />

  const error = state?.error ?? initialError

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="next" value={next ?? ""} />
      <FieldGroup>
        {mode === "signup" && (
          <Field>
            <FieldLabel htmlFor="name">Nome</FieldLabel>
            <Input id="name" name="name" autoComplete="name" defaultValue={state?.values?.name} required className="h-12" />
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            defaultValue={state?.values?.email}
            required
            className="h-12"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            minLength={mode === "signup" ? 8 : undefined}
            required
            className="h-12"
          />
        </Field>
        {error && <FieldError>{error}</FieldError>}
      </FieldGroup>

      <Button type="submit" size="lg" className="h-13 w-full text-base font-semibold" disabled={pending}>
        {pending ? "Aguarde…" : mode === "signin" ? "Entrar" : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "signin" ? (
          <>
            Ainda não tem conta?{" "}
            <Link href={`/cadastro${nextQuery}`} className="font-semibold text-primary">
              Criar conta
            </Link>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <Link href={`/entrar${nextQuery}`} className="font-semibold text-primary">
              Entrar
            </Link>
          </>
        )}
      </p>
    </form>
  )
}

/** Mostrado depois do cadastro quando o Supabase exige confirmação de e-mail. */
function CheckEmail({ email, next }: { email: string; next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(resendConfirmation, undefined)

  return (
    <div className="space-y-6 rounded-3xl bg-card p-6 text-center ring-1 ring-border/60">
      <EnvelopeDoodle className="mx-auto w-28" />
      <div className="space-y-2">
        <h2 className="font-display text-3xl font-bold text-primary">Confira seu e-mail</h2>
        <p className="text-sm text-muted-foreground">
          Mandamos um link de confirmação para <span className="font-semibold text-foreground">{email}</span>. Abra o
          link para ativar sua conta e montar sua meta.
        </p>
      </div>
      <form action={action} className="space-y-2">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next ?? ""} />
        <Button type="submit" variant="outline" className="h-11 w-full" disabled={pending || state?.resent}>
          {pending ? "Reenviando…" : state?.resent ? "E-mail reenviado" : "Reenviar e-mail"}
        </Button>
        {state?.error && <FieldError>{state.error}</FieldError>}
      </form>
    </div>
  )
}
