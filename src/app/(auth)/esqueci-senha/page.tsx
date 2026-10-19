import type { Metadata } from "next"
import { AuthHeader } from "@/components/auth-header"
import { RequestResetForm } from "@/components/password-reset-form"

export const metadata: Metadata = { title: "Esqueci minha senha" }

export default async function ForgotPasswordPage({ searchParams }: PageProps<"/esqueci-senha">) {
  const { next } = await searchParams
  const nextValue = typeof next === "string" ? next : undefined
  return (
    <>
      <AuthHeader
        title="Esqueci a senha"
        subtitle="Acontece. Informe seu e-mail e mandamos um link para criar uma nova."
        next={nextValue}
        backHref="/entrar"
      />
      <RequestResetForm next={nextValue} />
    </>
  )
}
