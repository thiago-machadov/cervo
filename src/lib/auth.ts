import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { hasAccess } from "@/lib/plan"
import { getSessionIdentity, type SessionIdentity } from "@/lib/session"

const userSelect = {
  id: true,
  name: true,
  email: true,
  goalType: true,
  dailyGoal: true,
  onboardedAt: true,
} as const

/** Cria (na primeira vez) o perfil do app para um usuário do Supabase Auth. */
export function ensureProfile(identity: SessionIdentity) {
  return db.user.upsert({
    where: { id: identity.id },
    update: {},
    create: { id: identity.id, email: identity.email, name: identity.name ?? identity.email.split("@")[0]! },
    select: userSelect,
  })
}

/** Usuário da sessão, sem exigir onboarding concluído (deduplicado por request). */
export const getSessionUser = cache(async () => {
  const identity = await getSessionIdentity()
  if (!identity) redirect("/boas-vindas")

  return (await db.user.findUnique({ where: { id: identity.id }, select: userSelect })) ?? ensureProfile(identity)
})

export type CurrentUser = Awaited<ReturnType<typeof getSessionUser>>

/**
 * Usuário logado, com onboarding concluído e com acesso (assinatura, teste ou fundador);
 * senão, redireciona. `requireAccess: false` nas telas que precisam abrir sem assinatura
 * (assinar, conta/LGPD, feedback).
 */
export async function getCurrentUser({ requireAccess = true }: { requireAccess?: boolean } = {}): Promise<CurrentUser> {
  const user = await getSessionUser()
  if (!user.onboardedAt) redirect("/onboarding")
  if (requireAccess && !(await hasAccess(user.id))) redirect("/assinar")
  return user
}

/** Para Server Actions: revalida a sessão no servidor em vez de confiar no cliente. */
export async function requireUserId(): Promise<string> {
  const identity = await getSessionIdentity()
  if (!identity) redirect("/boas-vindas")
  return identity.id
}
