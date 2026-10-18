"use client"

import { useActionState, useState } from "react"
import { BugIcon, ChatTextIcon, HeartIcon, LightbulbIcon } from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react/lib"
import { FlockDoodle } from "@/components/doodles"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { sendFeedback } from "@/app/actions/feedback"
import { cn } from "@/lib/utils"

type Kind = "BUG" | "IDEA" | "PRAISE" | "OTHER"

const KINDS: { value: Kind; icon: Icon; label: string; placeholder: string }[] = [
  { value: "BUG", icon: BugIcon, label: "Algo deu errado", placeholder: "O que aconteceu? Em qual tela? O que você esperava?" },
  { value: "IDEA", icon: LightbulbIcon, label: "Ideia", placeholder: "O que deixaria o Cervo melhor para você?" },
  { value: "PRAISE", icon: HeartIcon, label: "Elogio", placeholder: "O que você mais gosta no app?" },
  { value: "OTHER", icon: ChatTextIcon, label: "Outro assunto", placeholder: "Pode falar à vontade." },
]

export function FeedbackForm() {
  const [state, action, pending] = useActionState(sendFeedback, undefined)
  const [kind, setKind] = useState<Kind>("IDEA")
  const current = KINDS.find((k) => k.value === kind)!

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-6 text-center ring-1 ring-border/60">
        <FlockDoodle className="w-40" />
        <p className="font-display text-2xl font-bold text-primary uppercase">Valeu!</p>
        <p className="text-sm text-muted-foreground">Recebemos seu feedback. Cada mensagem é lida.</p>
        <Button variant="outline" className="h-11" onClick={() => window.location.reload()}>
          Mandar outro
        </Button>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="kind" value={kind} />
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo de feedback">
        {KINDS.map(({ value, icon: KindIcon, label }) => {
          const selected = value === kind
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setKind(value)}
              className={cn(
                "flex items-center gap-2 rounded-2xl bg-card p-3 text-left text-sm font-semibold ring-1 ring-border transition-all",
                selected && "ring-2 ring-primary"
              )}
            >
              <KindIcon className={cn("size-5 shrink-0 text-muted-foreground", selected && "text-primary")} weight={selected ? "fill" : "regular"} />
              {label}
            </button>
          )
        })}
      </div>
      <Field>
        <FieldLabel htmlFor="message">Sua mensagem</FieldLabel>
        <Textarea id="message" name="message" placeholder={current.placeholder} rows={6} minLength={5} maxLength={2000} required />
      </Field>
      {state?.error && <FieldError>{state.error}</FieldError>}
      <Button type="submit" size="lg" className="h-11 w-full" disabled={pending}>
        {pending ? "Enviando…" : "Enviar feedback"}
      </Button>
    </form>
  )
}
