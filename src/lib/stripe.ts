import "server-only"
import Stripe from "stripe"

/** Preços do Cervo Pro no Stripe, achados pelo lookup_key (sem IDs no código). */
export const PRICE_LOOKUP_KEYS = { month: "cervo_pro_monthly", year: "cervo_pro_yearly" } as const
export type BillingInterval = keyof typeof PRICE_LOOKUP_KEYS

/** Valores exibidos nas telas (os preços reais moram no Stripe; manter em sincronia). */
export const PRO_PRICES = { month: 9.9, year: 79.9 } as const

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

/** Cliente do Stripe. Usa fetch (funciona no Cloudflare Workers e no Node). */
export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY não configurada")
  return new Stripe(key, { httpClient: Stripe.createFetchHttpClient(), maxNetworkRetries: 1 })
}

export const webhookCrypto = Stripe.createSubtleCryptoProvider()
