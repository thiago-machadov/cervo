import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { AuthHeader } from "@/components/auth-header"
import { NewPasswordForm } from "@/components/password-reset-form"
import { getSessionIdentity } from "@/lib/session"
import AuthLoading from "../loading"

export const metadata: Metadata = { title: "Nova senha" }

export default function NewPasswordPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <Content />
    </Suspense>
  )
}

async function Content() {
  // Sem sessão o link expirou (ou foi aberto em outro navegador): volta para o login com aviso.
  if (!(await getSessionIdentity())) redirect("/entrar?erro=link")

  return (
    <>
      <AuthHeader title="Nova senha" subtitle="Escolha uma senha com pelo menos 8 caracteres." />
      <NewPasswordForm />
    </>
  )
}
