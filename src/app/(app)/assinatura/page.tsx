import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { CheckIcon, MinusIcon, SparkleIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr"
import { DeerDoodle, StarDoodle } from "@/components/doodles"
import { ManageSubscriptionButton } from "@/components/manage-subscription-button"
import { PageHeader } from "@/components/page-header"
import { PageSuspense } from "@/components/page-suspense"
import { PlanPicker } from "@/components/plan-picker"
import { ProBadge } from "@/components/pro-badge"
import { getCurrentUser } from "@/lib/auth"
import { formatDate } from "@/lib/dates"
import { db } from "@/lib/db"
import { FREE_CLUB_LIMIT, getPlan, syncStripeCustomer } from "@/lib/plan"
import { PRO_PRICES, isStripeConfigured } from "@/lib/stripe"

export const metadata: Metadata = { title: "Cervo Pro" }

export default function SubscriptionPage({ searchParams }: PageProps<"/assinatura">) {
  return (
    <main className="md:mx-auto md:max-w-2xl">
      <PageHeader title="Cervo Pro" backHref="/perfil" />
      <PageSuspense>
        <SubscriptionContent searchParams={searchParams} />
      </PageSuspense>
    </main>
  )
}

const FEATURES: { label: string; free: string | boolean; pro: string | boolean }[] = [
  { label: "Biblioteca, check-ins, sequência e metas", free: true, pro: true },
  { label: "Fotos nos check-ins", free: true, pro: true },
  { label: "Feed, amigos, reações e comentários", free: true, pro: true },
  { label: "Clubes", free: `até ${FREE_CLUB_LIMIT}`, pro: "ilimitados" },
  { label: "Estatísticas e retrospectiva do ano", free: false, pro: true },
  { label: "Desafios no clube (para o dono)", free: false, pro: true },
  { label: "Exportar ranking do clube", free: false, pro: true },
  { label: "Selo Pro no perfil", free: false, pro: true },
  { label: "Sem anúncios", free: true, pro: true },
]

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "string") return <span className="text-xs font-semibold">{value}</span>
  return value ? (
    <CheckIcon className="mx-auto size-4 text-primary" weight="bold" aria-label="Incluído" />
  ) : (
    <MinusIcon className="mx-auto size-4 text-muted-foreground" aria-label="Não incluído" />
  )
}

async function SubscriptionContent({ searchParams }: Pick<PageProps<"/assinatura">, "searchParams">) {
  const user = await getCurrentUser()
  // Na volta do portal (cancelou, trocou de plano...), busca o estado no Stripe sem esperar o webhook.
  if ((await searchParams).portal && isStripeConfigured()) {
    const customer = await db.subscription.findUnique({ where: { userId: user.id }, select: { stripeCustomerId: true } })
    if (customer) await syncStripeCustomer(customer.stripeCustomerId).catch(() => null)
    // Recarrega sem o parâmetro: o plano é lido de novo num request novo (getPlan tem cache por request).
    redirect("/assinatura")
  }
  const plan = await getPlan(user.id)
  const sub = plan.subscription
  const founderUntil = plan.source === "founder" && plan.proUntil ? formatDate(plan.proUntil) : undefined

  return (
    <div className="space-y-6 px-4 pt-2 pb-8">
      <section className="relative overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground">
        <StarDoodle className="absolute top-3 right-4 w-8 opacity-80" />
        <DeerDoodle className="absolute -right-4 -bottom-6 w-28 opacity-25" />
        <p className="font-display text-3xl font-bold uppercase">Leia mais junto</p>
        <p className="mt-1 max-w-[16rem] text-sm opacity-90">
          Clubes ilimitados, estatísticas e retrospectiva do seu ano de leitura e desafios para o clube.
        </p>
      </section>

      {plan.source === "stripe" && sub && (
        <section className="space-y-3 rounded-2xl bg-card p-4 ring-1 ring-border/60">
          <p className="flex items-center gap-2 font-semibold">
            Você é <ProBadge />
          </p>
          <p className="text-sm text-muted-foreground">
            Plano {sub.interval === "month" ? "mensal" : "anual"}
            {sub.currentPeriodEnd &&
              (sub.cancelAtPeriodEnd
                ? ` · cancelado, o acesso vai até ${formatDate(sub.currentPeriodEnd)}`
                : sub.status === "trialing"
                  ? ` · primeira cobrança em ${formatDate(sub.currentPeriodEnd)}`
                  : ` · renova em ${formatDate(sub.currentPeriodEnd)}`)}
          </p>
          {sub.status === "past_due" && (
            <p className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              <WarningIcon className="mt-0.5 size-4 shrink-0" weight="fill" />
              Não conseguimos cobrar seu cartão. Atualize o pagamento para não perder o Pro.
            </p>
          )}
          <ManageSubscriptionButton label={sub.cancelAtPeriodEnd ? "Reativar ou gerenciar" : "Gerenciar assinatura"} />
        </section>
      )}

      {plan.source === "founder" && (
        <section className="space-y-1 rounded-2xl bg-secondary p-4 text-secondary-foreground">
          <p className="flex items-center gap-2 font-semibold">
            <SparkleIcon className="size-5 text-primary" weight="fill" /> Você é fundador do Cervo
          </p>
          <p className="text-sm">
            Obrigado por chegar cedo! Seu Pro é por nossa conta até {founderUntil}. Se quiser continuar depois, assine
            agora: a cobrança só começa quando a cortesia acabar.
          </p>
        </section>
      )}

      {plan.source !== "stripe" && <PlanPicker prices={PRO_PRICES} founderUntil={founderUntil} />}

      <section className="space-y-2">
        <h2 className="text-base font-bold">O que vem em cada plano</h2>
        <table className="w-full overflow-hidden rounded-2xl bg-card text-sm ring-1 ring-border/60">
          <thead>
            <tr className="border-b border-border/70 text-xs text-muted-foreground">
              <th className="px-4 py-2 text-left font-medium">Recurso</th>
              <th className="w-20 px-2 py-2 font-medium">Grátis</th>
              <th className="w-20 px-2 py-2 font-medium text-primary">Pro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {FEATURES.map((feature) => (
              <tr key={feature.label}>
                <td className="px-4 py-2.5">{feature.label}</td>
                <td className="px-2 py-2.5 text-center">
                  <Cell value={feature.free} />
                </td>
                <td className="px-2 py-2.5 text-center">
                  <Cell value={feature.pro} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-base font-bold">Perguntas frequentes</h2>
        {[
          ["Posso cancelar quando quiser?", "Sim. Em “Gerenciar assinatura” você cancela em dois toques e continua Pro até o fim do período já pago."],
          [
            "E se eu cancelar estando em mais de 2 clubes?",
            "Você continua em todos os clubes. Só não entra em clubes novos enquanto estiver acima do limite do plano grátis.",
          ],
          ["Como é o pagamento?", "Pelo Stripe, com cartão de crédito, Apple Pay ou Google Pay. O Cervo não vê nem guarda os dados do seu cartão."],
          ["O plano grátis vai acabar?", "Não. Check-ins, sequência, metas, amigos e clubes continuam grátis, e sem anúncios."],
        ].map(([q, a]) => (
          <details key={q} className="rounded-2xl bg-card p-4 ring-1 ring-border/60">
            <summary className="cursor-pointer font-semibold">{q}</summary>
            <p className="mt-2 text-muted-foreground">{a}</p>
          </details>
        ))}
      </section>
    </div>
  )
}
