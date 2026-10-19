"use client"

import Link from "next/link"
import { useActionState } from "react"
import { EnvelopeDoodle } from "@/components/doodles"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/password-input"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
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
            <Input
              id="name"
              name="name"
              autoComplete="name"
              autoCapitalize="words"
              maxLength={60}
              defaultValue={state?.values?.name}
              required
              className="h-12"
            />
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
            autoCapitalize="none"
            spellCheck={false}
            defaultValue={state?.values?.email}
            required
            className="h-12"
          />
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            {mode === "signin" && (
              <Link href={`/esqueci-senha${nextQuery}`} className="-my-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
                Esqueci minha senha
              </Link>
            )}
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            minLength={mode === "signup" ? 8 : undefined}
            required
            className="h-12"
          />
          {mode === "signup" && <FieldDescription>Pelo menos 8 caracteres.</FieldDescription>}
        </Field>
        {error && <FieldError>{error}</FieldError>}
        {state?.unconfirmed && <ResendInline email={state.unconfirmed} />}
      </FieldGroup>

      <Button type="submit" size="lg" className="h-13 w-full text-base font-semibold" disabled={pending}>
        {pending ? (mode === "signin" ? "Entrando…" : "Criando conta…") : mode === "signin" ? "Entrar" : "Criar conta"}
      </Button>

      {mode === "signup" && (
        <p className="-mt-3 text-center text-xs text-muted-foreground">
          Ao criar a conta, você concorda com os{" "}
          <Link href="/termos" target="_blank" className="underline underline-offset-4">
            Termos de uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" target="_blank" className="underline underline-offset-4">
            Política de privacidade
          </Link>
          .
        </p>
      )}

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

/** Ao tentar entrar sem ter confirmado o e-mail: reenviar o link ali mesmo. */
function ResendInline({ email }: { email: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(resendConfirmation, undefined)
  return (
    <div className="space-y-1">
      <Button
        type="submit"
        formAction={action}
        variant="outline"
        className="h-11 w-full"
        // Dentro do formulário de login: usa o e-mail digitado e não exige a senha.
        formNoValidate
        disabled={pending || state?.resent}
        title={`Reenviar para ${email}`}
      >
        {pending ? "Reenviando…" : state?.resent ? "Link reenviado. Confira seu e-mail" : "Reenviar link de confirmação"}
      </Button>
      {state?.error && <FieldError>{state.error}</FieldError>}
    </div>
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
