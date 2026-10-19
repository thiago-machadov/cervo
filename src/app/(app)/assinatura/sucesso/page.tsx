import type { Metadata } from "next"
import Link from "next/link"
import { FlockDoodle } from "@/components/doodles"
import { PageSuspense } from "@/components/page-suspense"
import { AutoRefresh } from "@/components/auto-refresh"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { syncStripeCustomer } from "@/lib/plan"
import { isStripeConfigured, stripe } from "@/lib/stripe"

export const metadata: Metadata = { title: "Bem-vindo ao Pro" }

export default function SuccessPage({ searchParams }: PageProps<"/assinatura/sucesso">) {
  return (
    <PageSuspense>
      <SuccessContent searchParams={searchParams} />
    </PageSuspense>
  )
}

/**
 * Volta do checkout. Sincroniza a assinatura na hora (sem esperar o webhook),
 * conferindo que a sessão de pagamento é mesmo deste usuário.
 */
async function SuccessContent({ searchParams }: Pick<PageProps<"/assinatura/sucesso">, "searchParams">) {
  const { session_id } = await searchParams
  const user = await getCurrentUser()

  let confirmed = false
  if (typeof session_id === "string" && isStripeConfigured()) {
    const session = await stripe().checkout.sessions.retrieve(session_id).catch(() => null)
    const customerId = typeof session?.customer === "string" ? session.customer : session?.customer?.id
    if (session && session.client_reference_id === user.id && customerId) {
      await syncStripeCustomer(customerId)
      confirmed = session.status === "complete"
    }
  }

  return (
    <main className="flex min-h-[80dvh] flex-col items-center justify-center gap-4 p-6 text-center">
      <FlockDoodle className="w-48" />
      <h1 className="font-display text-4xl font-bold text-primary uppercase">{confirmed ? "Bem-vindo ao Pro!" : "Quase lá"}</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        {confirmed
          ? "Sua assinatura está ativa. Clubes ilimitados, estatísticas e desafios já estão liberados."
          : "Estamos confirmando seu pagamento com o Stripe. Isso costuma levar poucos segundos e esta tela se atualiza sozinha."}
      </p>
      {!confirmed && <AutoRefresh />}
      <div className="flex w-full max-w-xs flex-col gap-2">
        {confirmed ? (
          <Button className="h-11" render={<Link href="/estatisticas" />} nativeButton={false}>
            Ver minhas estatísticas
          </Button>
        ) : (
          <Button className="h-11" render={<Link href={`/assinatura/sucesso?session_id=${session_id ?? ""}`} />} nativeButton={false}>
            Verificar de novo
          </Button>
        )}
        <Button variant="ghost" className="h-11" render={<Link href="/assinatura" />} nativeButton={false}>
          Ver minha assinatura
        </Button>
      </div>
    </main>
  )
}
