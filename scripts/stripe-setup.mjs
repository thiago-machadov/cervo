// Configura o Stripe para o Cervo Pro (pode rodar mais de uma vez: reaproveita o que já existe).
//   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs https://cervobook.club [--webhook]
// Cria: produto "Cervo Pro", preços mensal/anual (lookup keys) e configuração do portal.
// Com --webhook, cria também o endpoint de webhook e grava o segredo whsec_ no arquivo
// indicado em WEBHOOK_SECRET_FILE (nunca imprime o segredo).
import Stripe from "stripe"

const key = process.env.STRIPE_SECRET_KEY
if (!key) {
  console.error("Defina STRIPE_SECRET_KEY")
  process.exit(1)
}
const stripe = new Stripe(key)
const siteUrl = process.argv[2]?.replace(/\/$/, "")
const withWebhook = process.argv.includes("--webhook")
if (!siteUrl || !/^https?:\/\/[a-z0-9.-]+(:\d+)?$/i.test(siteUrl)) {
  console.error("Informe a URL do site, ex.: https://cervobook.club")
  process.exit(1)
}
const mode = key.startsWith("sk_live") ? "PRODUÇÃO (live)" : "teste"
console.log(`Stripe em modo ${mode}`)

const PRICES = [
  { lookup_key: "cervo_pro_monthly", unit_amount: 1799, interval: "month", nickname: "Cervo mensal" },
  { lookup_key: "cervo_pro_yearly", unit_amount: 14496, interval: "year", nickname: "Cervo anual (R$ 12,08/mês)" },
]

// Produto: primeiro pelo preço já criado (a busca do Stripe demora a indexar produtos novos).
const known = await stripe.prices.list({ lookup_keys: PRICES.map((p) => p.lookup_key), active: true, expand: ["data.product"] })
const products = known.data[0] ? { data: [known.data[0].product] } : await stripe.products.search({ query: "metadata['app']:'cervo' AND active:'true'" })
const product =
  products.data[0] ??
  (await stripe.products.create({
    name: "Assinatura Cervo",
    description: "Check-ins, metas, clubes do livro, amigos, estatísticas e desafios. 14 dias grátis.",
    metadata: { app: "cervo" },
  }))
// Mantém nome e descrição do produto em dia (o produto já pode existir de uma versão anterior).
await stripe.products.update(product.id, {
  name: "Assinatura Cervo",
  description: "Check-ins, metas, clubes do livro, amigos, estatísticas e desafios. 14 dias grátis.",
})
console.log(`Produto: ${product.id}`)

// Preços
const existing = await stripe.prices.list({ lookup_keys: PRICES.map((p) => p.lookup_key), active: true })
for (const price of PRICES) {
  const found = existing.data.find((p) => p.lookup_key === price.lookup_key)
  if (found && found.unit_amount === price.unit_amount && found.recurring?.interval === price.interval) {
    console.log(`Preço ${price.lookup_key}: ${found.id} (já existia)`)
    continue
  }
  // transfer_lookup_key move a lookup key para o preço novo se o valor mudou.
  const created = await stripe.prices.create({
    product: product.id,
    currency: "brl",
    unit_amount: price.unit_amount,
    recurring: { interval: price.interval },
    lookup_key: price.lookup_key,
    transfer_lookup_key: true,
    nickname: price.nickname,
    tax_behavior: "inclusive",
  })
  console.log(`Preço ${price.lookup_key}: ${created.id} (criado)`)
}

// Portal do cliente
const prices = await stripe.prices.list({ lookup_keys: PRICES.map((p) => p.lookup_key), active: true })
const portalFeatures = {
  customer_update: { enabled: true, allowed_updates: ["email", "name"] },
  invoice_history: { enabled: true },
  payment_method_update: { enabled: true },
  subscription_cancel: {
    enabled: true,
    mode: "at_period_end",
    cancellation_reason: {
      enabled: true,
      options: ["too_expensive", "missing_features", "unused", "switched_service", "other"],
    },
  },
  subscription_update: {
    enabled: true,
    default_allowed_updates: ["price"],
    proration_behavior: "create_prorations",
    products: [{ product: product.id, prices: prices.data.map((p) => p.id) }],
  },
}
const configs = await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 })
const business_profile = { headline: "Assinatura Cervo", privacy_policy_url: `${siteUrl}/privacidade`, terms_of_service_url: `${siteUrl}/termos` }
if (configs.data[0]) {
  await stripe.billingPortal.configurations.update(configs.data[0].id, { features: portalFeatures, business_profile })
  console.log(`Portal: ${configs.data[0].id} (atualizado)`)
} else {
  const config = await stripe.billingPortal.configurations.create({ features: portalFeatures, business_profile })
  console.log(`Portal: ${config.id} (criado)`)
}

// Webhook
if (withWebhook) {
  const url = `${siteUrl}/api/stripe/webhook`
  const events = [
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
  ]
  const hooks = await stripe.webhookEndpoints.list({ limit: 100 })
  const hook = hooks.data.find((h) => h.url === url)
  if (hook) {
    await stripe.webhookEndpoints.update(hook.id, { enabled_events: events })
    console.log(`Webhook: ${hook.id} (já existia; o segredo whsec_ está no painel do Stripe)`)
  } else {
    const created = await stripe.webhookEndpoints.create({ url, enabled_events: events, description: "Cervo Pro" })
    console.log(`Webhook: ${created.id} (criado)`)
    const file = process.env.WEBHOOK_SECRET_FILE
    if (file) {
      const { writeFileSync } = await import("node:fs")
      writeFileSync(file, created.secret, { mode: 0o600 })
      console.log(`Segredo do webhook gravado em ${file}`)
    } else {
      console.log("Defina WEBHOOK_SECRET_FILE para gravar o segredo; ou copie-o no painel do Stripe.")
    }
  }
}
console.log("Pronto.")

// Remove webhooks do Cervo que apontam para outra URL (ex.: criados por engano).
if (withWebhook) {
  const hooks = await stripe.webhookEndpoints.list({ limit: 100 })
  for (const hook of hooks.data) {
    if (hook.description === "Cervo Pro" && hook.url !== `${siteUrl}/api/stripe/webhook`) {
      await stripe.webhookEndpoints.del(hook.id)
      console.log(`Webhook antigo removido: ${hook.url}`)
    }
  }
}
