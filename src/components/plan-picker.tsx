"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { startCheckout } from "@/app/actions/billing"
import { cn } from "@/lib/utils"

const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

/**
 * Escolha mensal/anual e botão que leva ao checkout do Stripe.
 * `trialEnd`: data da primeira cobrança quando há teste grátis (ou cortesia de fundador).
 */
export function PlanPicker({
  prices,
  trialDays,
  trialEnd,
  founder = false,
}: {
  prices: { month: number; year: number }
  trialDays: number | null
  trialEnd: string | null
  founder?: boolean
}) {
  const [interval, setInterval] = useState<"month" | "year">("year")
  const [state, action, pending] = useActionState(startCheckout, undefined)
  const savings = Math.round((1 - prices.year / (prices.month * 12)) * 100)

  const options = [
    {
      value: "year" as const,
      title: "Anual",
      price: brl(prices.year / 12),
      unit: "/mês",
      hint: `cobrado ${brl(prices.year)} por ano · economize ${savings}%`,
    },
    { value: "month" as const, title: "Mensal", price: brl(prices.month), unit: "/mês", hint: "cobrado todo mês" },
  ]

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="interval" value={interval} />
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Plano">
        {options.map((option) => {
          const selected = option.value === interval
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setInterval(option.value)}
              className={cn(
                "relative flex flex-col items-start gap-1 rounded-2xl bg-card p-4 text-left ring-1 ring-border transition-all",
                selected && "ring-2 ring-primary"
              )}
            >
              {option.value === "year" && (
                <span className="absolute -top-2 right-3 rounded-full bg-primary px-2 py-0.5 text-[0.6rem] font-bold text-primary-foreground uppercase">
                  Mais escolhido
                </span>
              )}
              <span className="text-sm font-semibold">{option.title}</span>
              <span className="font-display text-2xl font-bold text-primary">
                {option.price}
                <span className="text-sm font-normal text-muted-foreground">{option.unit}</span>
              </span>
              <span className="text-xs text-muted-foreground">{option.hint}</span>
            </button>
          )
        })}
      </div>
      {state?.error && <FieldError>{state.error}</FieldError>}
      <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold" disabled={pending}>
        {pending ? "Abrindo o pagamento…" : trialDays && !founder ? `Começar ${trialDays} dias grátis` : "Assinar"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {trialEnd
          ? `Hoje você não paga nada. A primeira cobrança é em ${trialEnd}; cancele antes e não paga nada.`
          : "Pagamento seguro pelo Stripe (cartão, Apple Pay ou Google Pay). Cancele quando quiser."}
      </p>
    </form>
  )
}
