import "server-only"
import { cache } from "react"
import type Stripe from "stripe"
import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"

/** Dias de teste grátis (com cartão) na primeira assinatura. */
export const TRIAL_DAYS = 14

/** Data da primeira cobrança para quem começa o teste agora. */
export function trialEndsAt(from = new Date()) {
  return new Date(from.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
}

/** Status do Stripe que dão acesso. past_due mantém o acesso enquanto o Stripe tenta cobrar de novo. */
const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"])

export type Plan = {
  /** Pode usar o app: assinatura ativa, teste em andamento ou cortesia de fundador. */
  hasAccess: boolean
  /** De onde vem o acesso: assinatura (ou teste) no Stripe, cortesia de fundador ou nenhum. */
  source: "stripe" | "founder" | null
  proUntil: Date | null
  /** Ainda não usou o teste grátis (nunca teve assinatura no Stripe). */
  canTrial: boolean
  subscription: {
    status: string
    interval: string | null
    currentPeriodEnd: Date | null
    cancelAtPeriodEnd: boolean
  } | null
}

/** Plano do usuário (uma consulta por request). */
export const getPlan = cache(async (userId: string): Promise<Plan> => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { proUntil: true, subscription: true },
  })
  const sub = user?.subscription ?? null
  const now = new Date()
  const paid = Boolean(sub && ACTIVE_STATUSES.has(sub.status) && (!sub.currentPeriodEnd || sub.currentPeriodEnd > now))
  const founder = Boolean(user?.proUntil && user.proUntil > now)

  return {
    hasAccess: paid || founder,
    source: paid ? "stripe" : founder ? "founder" : null,
    proUntil: user?.proUntil ?? null,
    canTrial: !sub?.stripeSubscriptionId,
    subscription: sub
      ? {
          status: sub.status,
          interval: sub.interval,
          currentPeriodEnd: sub.currentPeriodEnd,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        }
      : null,
  }
})

export async function hasAccess(userId: string) {
  return (await getPlan(userId)).hasAccess
}

/** Cliente do Stripe do usuário; cria na primeira vez e guarda o id. */
export async function ensureStripeCustomer(user: { id: string; email: string; name: string }) {
  const existing = await db.subscription.findUnique({ where: { userId: user.id }, select: { stripeCustomerId: true } })
  if (existing) return existing.stripeCustomerId

  const customer = await stripe().customers.create(
    { email: user.email, name: user.name, metadata: { userId: user.id } },
    // Evita dois clientes se o botão for clicado duas vezes.
    { idempotencyKey: `customer-${user.id}` }
  )
  await db.subscription.upsert({
    where: { userId: user.id },
    create: { userId: user.id, stripeCustomerId: customer.id, status: "none" },
    update: {},
  })
  return customer.id
}

function periodEnd(subscription: Stripe.Subscription) {
  // Nas versões recentes da API, o período fica nos itens da assinatura.
  const ends = subscription.items.data.map((item) => item.current_period_end).filter(Boolean)
  return ends.length > 0 ? new Date(Math.max(...ends) * 1000) : null
}

/**
 * Copia do Stripe para o banco a assinatura mais recente de um cliente. Chamado pelo
 * webhook e na volta do checkout, então funciona mesmo se um dos dois atrasar.
 */
export async function syncStripeCustomer(customerId: string) {
  const client = stripe()
  const { data } = await client.subscriptions.list({ customer: customerId, status: "all", limit: 1 })
  const subscription = data[0]

  let userId = (await db.subscription.findUnique({ where: { stripeCustomerId: customerId }, select: { userId: true } }))?.userId
  if (!userId) {
    const customer = await client.customers.retrieve(customerId)
    userId = "deleted" in customer && customer.deleted ? undefined : customer.metadata?.userId
  }
  if (!userId || !(await db.user.findUnique({ where: { id: userId }, select: { id: true } }))) return null

  const values = subscription
    ? {
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        interval: subscription.items.data[0]?.price.recurring?.interval ?? null,
        currentPeriodEnd: periodEnd(subscription),
        cancelAtPeriodEnd: subscription.cancel_at_period_end || Boolean(subscription.cancel_at),
      }
    : { stripeSubscriptionId: null, status: "none", interval: null, currentPeriodEnd: null, cancelAtPeriodEnd: false }

  await db.subscription.upsert({
    where: { userId },
    create: { userId, stripeCustomerId: customerId, ...values },
    update: { stripeCustomerId: customerId, ...values },
  })
  return userId
}
