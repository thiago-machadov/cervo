import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { AuthHeader } from "@/components/auth-header"
import { getSessionUserId } from "@/lib/session"
import AuthLoading from "../loading"

export const metadata: Metadata = { title: "Entrar" }

export default function SignInPage({ searchParams }: PageProps<"/entrar">) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <Content searchParams={searchParams} />
    </Suspense>
  )
}

async function Content({ searchParams }: Pick<PageProps<"/entrar">, "searchParams">) {
  const { next, erro } = await searchParams
  if (await getSessionUserId()) redirect("/")

  const nextPath = typeof next === "string" ? next : undefined
  return (
    <>
      <AuthHeader title="Entrar" subtitle="Que bom te ver de novo. Bora manter a sequência?" next={nextPath} />
      <AuthForm
        mode="signin"
        next={nextPath}
        initialError={erro === "link" ? "Esse link de confirmação expirou ou já foi usado. Entre com seu e-mail e senha." : undefined}
      />
    </>
  )
}
