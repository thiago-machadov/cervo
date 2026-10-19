"use client"

import Link from "next/link"
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/ssr"
import { BirdDoodle } from "@/components/doodles"
import { Button } from "@/components/ui/button"

/**
 * Erro inesperado numa tela do app: explica em linguagem simples, oferece tentar de novo
 * (resolve falhas passageiras de rede) e uma saída para o início. O menu continua visível.
 */
export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error && "digest" in error ? String(error.digest ?? "") : ""
  return (
    <main className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <BirdDoodle className="w-32" />
      <h1 className="font-display text-3xl font-bold text-primary uppercase">Algo saiu do lugar</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Não conseguimos carregar esta tela agora. Pode ser a conexão; tente de novo em instantes. Nenhum dado seu foi perdido.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button size="lg" className="h-11" onClick={() => retry()}>
          <ArrowClockwiseIcon /> Tentar de novo
        </Button>
        <Button variant="ghost" size="lg" className="h-11" render={<Link href="/" />} nativeButton={false}>
          Voltar para o início
        </Button>
      </div>
      {digest && <p className="text-[0.65rem] text-muted-foreground/70">Código para o suporte: {digest}</p>}
    </main>
  )
}
