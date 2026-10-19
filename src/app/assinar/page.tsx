import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr"
import { DeerDoodle, StarDoodle } from "@/components/doodles"
import { PlanPicker } from "@/components/plan-picker"
import { SubmitButton } from "@/components/submit-button"
import { signOut } from "@/app/actions/auth"
import { getCurrentUser } from "@/lib/auth"
import { formatDate } from "@/lib/dates"
import { TRIAL_DAYS, getPlan, trialEndsAt } from "@/lib/plan"
import { PRO_PRICES } from "@/lib/stripe"

export const metadata: Metadata = { title: "Assinar", robots: { index: false } }

const INCLUDED = [
  "Check-ins, sequência e metas diárias",
  "Clubes do livro ilimitados, com ranking e desafios",
  "Amigos, feed, reações e comentários",
  "Estatísticas e retrospectiva do seu ano",
  "Sem anúncios",
]

/**
 * Paywall depois do onboarding: quem ainda não tem acesso começa o teste (com cartão) ou
 * reassina. Fica fora do layout do app para não oferecer abas que levariam de volta aqui.
 */
export default async function SubscribePage() {
  const user = await getCurrentUser({ requireAccess: false })
  const plan = await getPlan(user.id)
  if (plan.hasAccess) redirect("/")

  const trialEnd = plan.canTrial ? formatDate(trialEndsAt()).replace(/\.$/, "") : null
  const firstName = user.name.split(" ")[0]

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
      <section className="relative space-y-2 overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground">
        <StarDoodle className="absolute top-4 right-4 w-8 text-primary-foreground opacity-80" />
        <DeerDoodle className="absolute -right-4 -bottom-6 w-28 text-primary-foreground opacity-25" />
        <p className="text-xs font-bold tracking-widest uppercase opacity-80">Tudo pronto, {firstName}!</p>
        <h1 className="font-display text-3xl leading-tight font-bold uppercase">
          {plan.canTrial ? `Leia ${TRIAL_DAYS} dias grátis` : "Volte a ler com a gente"}
        </h1>
        <p className="max-w-[16rem] text-sm opacity-90">
          {plan.canTrial
            ? "Experimente tudo. Se não for para você, cancele antes do fim do teste e não paga nada."
            : "Sua assinatura terminou. Assine de novo para continuar sua sequência e seus clubes."}
        </p>
      </section>

      <PlanPicker prices={PRO_PRICES} trialDays={plan.canTrial ? TRIAL_DAYS : null} trialEnd={trialEnd} />

      <ul className="space-y-2 rounded-2xl bg-card p-4 text-sm ring-1 ring-border/60">
        {INCLUDED.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <CheckCircleIcon className="size-5 shrink-0 text-primary" weight="fill" /> {item}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between gap-3 text-sm">
        <Link href="/conta" className="inline-flex min-h-11 items-center text-muted-foreground underline underline-offset-4">
          Privacidade e conta
        </Link>
        <form action={signOut}>
          <SubmitButton variant="ghost" className="min-h-11 text-muted-foreground" pendingText="Saindo…">
            Sair da conta
          </SubmitButton>
        </form>
      </div>
    </main>
  )
}
