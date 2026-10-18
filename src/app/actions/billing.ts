"use server"

import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth"
import { ensureStripeCustomer, getPlan } from "@/lib/plan"
import { siteOrigin } from "@/lib/site"
import { PRICE_LOOKUP_KEYS, isStripeConfigured, stripe, type BillingInterval } from "@/lib/stripe"
import type { ActionState } from "@/lib/utils-text"

/** Abre o checkout do Stripe para assinar o Pro (mensal ou anual). */
export async function startCheckout(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser()
  if (!user) redirect("/entrar?next=/assinatura")
  if (!isStripeConfigured()) return { error: "Pagamentos indisponíveis no momento. Tente mais tarde." }

  const interval: BillingInterval = formData.get("interval") === "month" ? "month" : "year"
  const plan = await getPlan(user.id)
  // Quem já paga gerencia a assinatura (trocar plano, cancelar) pelo portal.
  if (plan.source === "stripe") return openPortal()

  const client = stripe()
  const [customerId, prices] = await Promise.all([
    ensureStripeCustomer(user),
    client.prices.list({ lookup_keys: [PRICE_LOOKUP_KEYS[interval]], active: true, limit: 1 }),
  ])
  const price = prices.data[0]
  if (!price) return { error: "Plano indisponível no momento. Tente mais tarde." }

  // Fundador que assina antes do fim da cortesia só começa a pagar quando ela acabar.
  const trialEnd =
    plan.source === "founder" && plan.proUntil && plan.proUntil.getTime() > Date.now() + 48 * 60 * 60 * 1000
      ? Math.floor(plan.proUntil.getTime() / 1000)
      : undefined

  const origin = await siteOrigin()
  const session = await client.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: price.id, quantity: 1 }],
    subscription_data: { metadata: { userId: user.id }, ...(trialEnd ? { trial_end: trialEnd } : {}) },
    allow_promotion_codes: true,
    locale: "pt-BR",
    success_url: `${origin}/assinatura/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/assinatura`,
  })
  if (!session.url) return { error: "Não foi possível abrir o pagamento. Tente de novo." }
  redirect(session.url)
}

/** Portal do Stripe: trocar cartão, mudar de plano, ver faturas e cancelar. */
export async function openPortal(): Promise<ActionState> {
  const user = await getSessionUser()
  if (!user) redirect("/entrar?next=/assinatura")
  if (!isStripeConfigured()) return { error: "Pagamentos indisponíveis no momento. Tente mais tarde." }

  const customerId = await ensureStripeCustomer(user)
  const session = await stripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${await siteOrigin()}/assinatura?portal=1`,
    locale: "pt-BR",
  })
  redirect(session.url)
}
