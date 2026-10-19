import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { CheckCircleIcon, SparkleIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr"
import { ManageSubscriptionButton } from "@/components/manage-subscription-button"
import { PageHeader } from "@/components/page-header"
import { PageSuspense } from "@/components/page-suspense"
import { PlanPicker } from "@/components/plan-picker"
import { getCurrentUser } from "@/lib/auth"
import { formatDate } from "@/lib/dates"
import { db } from "@/lib/db"
import { getPlan, syncStripeCustomer } from "@/lib/plan"
import { PRO_PRICES, isStripeConfigured } from "@/lib/stripe"

export const metadata: Metadata = { title: "Assinatura" }

export default function SubscriptionPage({ searchParams }: PageProps<"/assinatura">) {
  return (
    <main className="md:mx-auto md:max-w-2xl">
      <PageHeader title="Assinatura" backHref="/perfil" />
      <PageSuspense>
        <SubscriptionContent searchParams={searchParams} />
      </PageSuspense>
    </main>
  )
}

const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const day = (date: Date) => formatDate(date).replace(/\.$/, "")

const FAQ: [string, string][] = [
  ["Posso cancelar quando quiser?", "Sim. Em “Gerenciar assinatura” você cancela em dois toques e continua com acesso até o fim do período já pago (ou do teste)."],
  ["Quando sou cobrado?", "No fim do teste grátis e, depois, a cada mês ou ano, conforme o plano. O Stripe envia o recibo por e-mail."],
  ["Como é o pagamento?", "Pelo Stripe, com cartão de crédito, Apple Pay ou Google Pay. O Cervo não vê nem guarda os dados do seu cartão."],
  ["O que acontece com meus dados se eu cancelar?", "Ficam guardados. Se voltar a assinar, sua biblioteca, sequências e clubes estão lá. Para apagar tudo, use Privacidade e conta."],
]

async function SubscriptionContent({ searchParams }: Pick<PageProps<"/assinatura">, "searchParams">) {
  const user = await getCurrentUser({ requireAccess: false })
  // Na volta do portal (cancelou, trocou de plano...), busca o estado no Stripe sem esperar o webhook.
  if ((await searchParams).portal && isStripeConfigured()) {
    const customer = await db.subscription.findUnique({ where: { userId: user.id }, select: { stripeCustomerId: true } })
    if (customer) await syncStripeCustomer(customer.stripeCustomerId).catch(() => null)
    // Recarrega sem o parâmetro: o plano é lido de novo num request novo (getPlan tem cache por request).
    redirect("/assinatura")
  }
  const plan = await getPlan(user.id)
  if (!plan.hasAccess) redirect("/assinar")
  const sub = plan.subscription
  const price = sub?.interval === "month" ? `${brl(PRO_PRICES.month)} por mês` : `${brl(PRO_PRICES.year)} por ano`

  return (
    <div className="space-y-6 px-4 pt-2 pb-8">
      {plan.source === "stripe" && sub && (
        <section className="space-y-3 rounded-2xl bg-card p-4 ring-1 ring-border/60">
          <p className="flex items-center gap-2 font-semibold">
            <SparkleIcon className="size-5 text-primary" weight="fill" />
            {sub.status === "trialing" ? "Teste grátis ativo" : "Assinatura ativa"}
          </p>
          <p className="text-sm text-muted-foreground">
            Plano {sub.interval === "month" ? "mensal" : "anual"} · {price}
            {sub.currentPeriodEnd &&
              (sub.cancelAtPeriodEnd
                ? `. Cancelada: o acesso vai até ${day(sub.currentPeriodEnd)}.`
                : sub.status === "trialing"
                  ? `. A primeira cobrança é em ${day(sub.currentPeriodEnd)}; cancele antes e não paga nada.`
                  : `. Renova em ${day(sub.currentPeriodEnd)}.`)}
          </p>
          {sub.status === "past_due" && (
            <p className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              <WarningIcon className="mt-0.5 size-4 shrink-0" weight="fill" />
              Não conseguimos cobrar seu cartão. Atualize o pagamento para não perder o acesso.
            </p>
          )}
          <ManageSubscriptionButton label={sub.cancelAtPeriodEnd ? "Reativar ou gerenciar" : "Gerenciar assinatura"} />
        </section>
      )}

      {plan.source === "founder" && plan.proUntil && (
        <>
          <section className="space-y-1 rounded-2xl bg-secondary p-4 text-secondary-foreground">
            <p className="flex items-center gap-2 font-semibold">
              <SparkleIcon className="size-5 text-primary" weight="fill" /> Você é fundador do Cervo
            </p>
            <p className="text-sm">
              Obrigado por chegar cedo! Seu acesso é por nossa conta até {day(plan.proUntil)}. Para continuar depois, assine agora: a
              cobrança só começa quando a cortesia acabar.
            </p>
          </section>
          <PlanPicker prices={PRO_PRICES} trialDays={null} trialEnd={day(plan.proUntil)} founder />
        </>
      )}

      <section className="space-y-2">
        <h2 className="text-base font-bold">O que está incluído</h2>
        <ul className="space-y-2 rounded-2xl bg-card p-4 text-sm ring-1 ring-border/60">
          {[
            "Check-ins, sequência e metas diárias",
            "Clubes do livro ilimitados, com ranking, desafios e exportação do ranking",
            "Amigos, feed, reações e comentários",
            "Estatísticas e retrospectiva do seu ano",
            "Sem anúncios",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircleIcon className="size-5 shrink-0 text-primary" weight="fill" /> {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-base font-bold">Perguntas frequentes</h2>
        {FAQ.map(([q, a]) => (
          <details key={q} className="group rounded-2xl bg-card p-4 ring-1 ring-border/60">
            <summary className="flex min-h-11 cursor-pointer list-none items-center font-semibold marker:hidden">{q}</summary>
            <p className="mt-2 text-muted-foreground">{a}</p>
          </details>
        ))}
      </section>
    </div>
  )
}
