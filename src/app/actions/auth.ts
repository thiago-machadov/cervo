"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ACCENT_COOKIE } from "@/lib/accents"
import { siteOrigin } from "@/lib/site"
import { z } from "zod"
import { ensureProfile } from "@/lib/auth"
import { safeNext, withNext } from "@/lib/redirects"
import { createSupabaseServerClient } from "@/lib/supabase/server"

/** `values` devolve o que a pessoa digitou, já que o React limpa o formulário após a action. */
export type AuthState =
  | { error?: string; confirmEmail?: string; resent?: boolean; values?: { name?: string; email?: string } }
  | undefined

/** Mensagens do Supabase Auth traduzidas para o usuário. */
function authErrorMessage(code: string | undefined, fallback: string) {
  switch (code) {
    case "invalid_credentials":
      return "E-mail ou senha incorretos"
    case "email_not_confirmed":
      return "Confirme seu e-mail antes de entrar. Procure o link na sua caixa de entrada."
    case "user_already_exists":
    case "email_exists":
      return "Já existe uma conta com esse e-mail"
    case "same_password":
      return "A nova senha precisa ser diferente da atual"
    case "weak_password":
      return "Senha fraca. Use pelo menos 8 caracteres, misturando letras e números."
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Muitas tentativas. Espere um pouco e tente de novo."
    default:
      return fallback
  }
}


const signUpSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(60),
  email: z.email("E-mail inválido").trim().toLowerCase(),
  password: z.string().min(8, "A senha precisa de pelo menos 8 caracteres").max(72),
})

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const values = { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? "") }
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, values }

  const { name, email, password } = parsed.data
  const afterConfirm = withNext("/onboarding", safeNext(formData.get("next")))
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=${encodeURIComponent(afterConfirm)}`,
    },
  })
  if (error) return { error: authErrorMessage(error.code, "Não foi possível criar a conta. Tente de novo."), values }

  // Com confirmação de e-mail desligada no Supabase, a sessão já vem pronta.
  if (data.session && data.user) {
    await ensureProfile({ id: data.user.id, email, name })
    redirect(afterConfirm)
  }

  return { confirmEmail: email }
}

const signInSchema = z.object({
  email: z.string().trim().toLowerCase(),
  password: z.string(),
})

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = signInSchema.parse(Object.fromEntries(formData))
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    return { error: authErrorMessage(error?.code, "Não foi possível entrar. Tente de novo."), values: { email } }
  }

  const metadata = (data.user.user_metadata ?? {}) as { name?: unknown }
  const profile = await ensureProfile({
    id: data.user.id,
    email: data.user.email ?? email,
    name: typeof metadata.name === "string" ? metadata.name : null,
  })

  const next = safeNext(formData.get("next"))
  redirect(profile.onboardedAt ? next : withNext("/onboarding", next))
}

export async function resendConfirmation(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
  const afterConfirm = withNext("/onboarding", safeNext(formData.get("next")))
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=${encodeURIComponent(afterConfirm)}` },
  })
  if (error) return { confirmEmail: email, error: authErrorMessage(error.code, "Não foi possível reenviar agora.") }
  return { confirmEmail: email, resent: true }
}

export type ResetState = { error?: string; sent?: boolean; email?: string } | undefined

/**
 * Envia o e-mail de redefinição de senha. A resposta é sempre a mesma, exista ou não
 * conta com esse e-mail, para não revelar quem está cadastrado.
 */
export async function requestPasswordReset(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const parsed = z.email("E-mail inválido").trim().toLowerCase().safeParse(formData.get("email"))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${await siteOrigin()}/auth/confirm?next=${encodeURIComponent("/nova-senha")}`,
  })
  if (error?.code === "over_email_send_rate_limit" || error?.code === "over_request_rate_limit") {
    return { error: authErrorMessage(error.code, ""), email: parsed.data }
  }
  return { sent: true, email: parsed.data }
}

const newPasswordSchema = z
  .object({
    password: z.string().min(8, "A senha precisa de pelo menos 8 caracteres").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "As senhas não são iguais", path: ["confirm"] })

/** Define a nova senha. Só funciona com a sessão criada pelo link do e-mail (ou já logado). */
export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = newPasswordSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return { error: authErrorMessage(error.code, "Não foi possível trocar a senha. Peça um novo link.") }

  redirect("/?senha=nova")
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  // A cor do app é da conta: ao sair, volta ao cobalto.
  ;(await cookies()).delete(ACCENT_COOKIE)
  redirect("/boas-vindas")
}
