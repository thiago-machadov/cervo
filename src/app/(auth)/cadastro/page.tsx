import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { AuthHeader } from "@/components/auth-header"
import { getSessionUserId } from "@/lib/session"
import AuthLoading from "../loading"

export const metadata: Metadata = { title: "Criar conta" }

export default function SignUpPage({ searchParams }: PageProps<"/cadastro">) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <Content searchParams={searchParams} />
    </Suspense>
  )
}

async function Content({ searchParams }: Pick<PageProps<"/cadastro">, "searchParams">) {
  const { next } = await searchParams
  if (await getSessionUserId()) redirect("/")

  const nextPath = typeof next === "string" ? next : undefined
  return (
    <>
      <AuthHeader title="Criar conta" subtitle="Leva menos de um minuto. Depois a gente monta sua meta." next={nextPath} />
      <AuthForm mode="signup" next={nextPath} />
    </>
  )
}
