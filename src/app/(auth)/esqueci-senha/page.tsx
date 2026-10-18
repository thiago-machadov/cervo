import type { Metadata } from "next"
import { AuthHeader } from "@/components/auth-header"
import { RequestResetForm } from "@/components/password-reset-form"

export const metadata: Metadata = { title: "Esqueci minha senha" }

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader title="Esqueci a senha" subtitle="Acontece. Informe seu e-mail e mandamos um link para criar uma nova." />
      <RequestResetForm />
    </>
  )
}
