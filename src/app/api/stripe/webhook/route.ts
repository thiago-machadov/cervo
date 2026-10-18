import type Stripe from "stripe"
import { syncStripeCustomer } from "@/lib/plan"
import { stripe, webhookCrypto } from "@/lib/stripe"

/** Eventos que mudam a assinatura; para todos, buscamos o estado atual no Stripe e salvamos. */
const RELEVANT = new Set<Stripe.Event.Type>([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_succeeded",
])

function customerOf(event: Stripe.Event) {
  const object = event.data.object as { customer?: string | { id: string } | null }
  return typeof object.customer === "string" ? object.customer : (object.customer?.id ?? null)
}

/** Webhook do Stripe (não passa pelo proxy de login; a assinatura do Stripe garante a origem). */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get("stripe-signature")
  if (!secret || !signature) return new Response("Webhook não configurado", { status: 400 })

  let event: Stripe.Event
  try {
    event = await stripe().webhooks.constructEventAsync(await request.text(), signature, secret, undefined, webhookCrypto)
  } catch {
    return new Response("Assinatura inválida", { status: 400 })
  }

  if (RELEVANT.has(event.type)) {
    const customerId = customerOf(event)
    if (customerId) await syncStripeCustomer(customerId)
  }
  return Response.json({ received: true })
}
