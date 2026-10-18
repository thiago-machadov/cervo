"use client"

import { useActionState, useEffect, useState } from "react"
import { BookOpenIcon } from "lucide-react"
import { BookCover } from "@/components/book-cover"
import { BirdDoodle, BookDoodle, EnvelopeDoodle, FlockDoodle, SunDoodle } from "@/components/doodles"
import { GoalPicker } from "@/components/goal-picker"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signOut } from "@/app/actions/auth"
import { finishOnboarding, saveFirstBook, saveGoal } from "@/app/actions/onboarding"
import type { GoalType } from "@/lib/goals"
import { cn } from "@/lib/utils"

const STEPS = ["Meta", "Livro", "Clube"] as const

type Props = {
  initialStep: number
  firstName: string
  goal: { type: GoalType; value: number } | null
  book: { title: string; coverUrl: string | null } | null
  inviteLink?: string
  next: string
}

export function OnboardingWizard({ initialStep, firstName, goal, book, inviteLink, next }: Props) {
  const [step, setStep] = useState(initialStep)

  return (
    <div className="flex min-h-dvh flex-col px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
      <div className="space-y-2">
        <div className="flex gap-2" aria-hidden>
          {STEPS.map((label, index) => (
            <span key={label} className={cn("h-1.5 flex-1 rounded-full bg-border transition-colors", index <= step && "bg-primary")} />
          ))}
        </div>
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>
            Passo {step + 1} de {STEPS.length}
          </span>
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="text-primary">
              Voltar
            </button>
          ) : (
            <form action={signOut}>
              <button type="submit" className="text-muted-foreground">
                Sair
              </button>
            </form>
          )}
        </div>
      </div>

      {step === 0 && <GoalStep firstName={firstName} goal={goal} onDone={() => setStep(1)} />}
      {step === 1 && <BookStep onDone={() => setStep(2)} />}
      {step === 2 && <ClubStep book={book} inviteLink={inviteLink} next={next} />}
    </div>
  )
}

function StepTitle({
  eyebrow,
  title,
  description,
  doodle,
}: {
  eyebrow: string
  title: string
  description: string
  doodle: React.ReactNode
}) {
  return (
    <div className="relative mt-6 mb-8 space-y-3">
      <div className="flex h-20 items-end">{doodle}</div>
      <p className="text-xs font-bold tracking-widest text-primary uppercase">{eyebrow}</p>
      <h1 className="font-display text-6xl font-bold text-primary">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function useStepAction(action: typeof saveGoal, onDone: () => void) {
  const [state, formAction, pending] = useActionState(action, undefined)
  useEffect(() => {
    if (state?.ok) onDone()
  }, [state, onDone])
  return [state, formAction, pending] as const
}

function GoalStep({ firstName, goal, onDone }: { firstName: string; goal: Props["goal"]; onDone: () => void }) {
  const [state, action, pending] = useStepAction(saveGoal, onDone)
  return (
    <form action={action} className="flex flex-1 flex-col">
      <StepTitle
        eyebrow={`Oi, ${firstName}!`}
        title="Qual sua meta diária?"
        description="Escolha um ritmo que caiba no seu dia. Dá para mudar depois no perfil."
        doodle={<SunDoodle className="w-20" />}
      />
      <GoalPicker defaultType={goal?.type} defaultValue={goal?.value} />
      {state?.error && <FieldError className="mt-4">{state.error}</FieldError>}
      <StepButton pending={pending}>Continuar</StepButton>
    </form>
  )
}

function BookStep({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useStepAction(saveFirstBook, onDone)
  return (
    <form action={action} className="flex flex-1 flex-col">
      <StepTitle
        eyebrow="Sua estante"
        title="O que você está lendo?"
        description="Comece pelo livro de agora. Os outros você adiciona depois na biblioteca."
        doodle={<BookDoodle className="w-28" />}
      />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Título</FieldLabel>
          <Input id="title" name="title" required className="h-12" />
        </Field>
        <Field>
          <FieldLabel htmlFor="author">Autor</FieldLabel>
          <Input id="author" name="author" required className="h-12" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="totalPages">Total de páginas</FieldLabel>
            <Input id="totalPages" name="totalPages" type="number" inputMode="numeric" min={1} required className="h-12" />
          </Field>
          <Field>
            <FieldLabel htmlFor="currentPage">Estou na página</FieldLabel>
            <Input id="currentPage" name="currentPage" type="number" inputMode="numeric" min={0} placeholder="0" className="h-12" />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="coverUrl">URL da capa (opcional)</FieldLabel>
          <Input id="coverUrl" name="coverUrl" type="url" inputMode="url" placeholder="https://…" className="h-12" />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
      </FieldGroup>
      <StepButton pending={pending}>Adicionar livro</StepButton>
    </form>
  )
}

type ClubMode = "create" | "join" | "skip"

function ClubStep({ book, inviteLink, next }: { book: Props["book"]; inviteLink?: string; next: string }) {
  const [state, action, pending] = useActionState(finishOnboarding, undefined)
  const [mode, setMode] = useState<ClubMode>(inviteLink ? "join" : "create")

  const options: { value: ClubMode; doodle: React.ReactNode; title: string; description: string }[] = [
    { value: "create", doodle: <FlockDoodle className="w-9" />, title: "Criar um clube", description: "Com o seu livro atual. Depois é só convidar." },
    { value: "join", doodle: <EnvelopeDoodle className="w-8" />, title: "Tenho um convite", description: "Cole o link que te mandaram." },
    { value: "skip", doodle: <BirdDoodle className="w-10" />, title: "Agora não", description: "Começar lendo sozinho." },
  ]

  return (
    <form action={action} className="flex flex-1 flex-col">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="next" value={next} />
      <StepTitle
        eyebrow="Último passo"
        title="Leia junto"
        description="Amigos no mesmo livro, check-ins no feed e ranking da semana."
        doodle={<FlockDoodle className="w-32" />}
      />

      <div className="space-y-3" role="radiogroup" aria-label="Clube">
        {options.map(({ value, doodle, title, description }) => {
          const selected = mode === value
          return (
            <div key={value} className={cn("rounded-2xl bg-card ring-1 ring-border transition-all", selected && "ring-2 ring-primary")}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setMode(value)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary [&_svg]:text-primary",
                    selected && "bg-primary [&_svg]:text-primary-foreground"
                  )}
                >
                  {doodle}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-xs text-muted-foreground">{description}</span>
                </span>
              </button>

              {selected && value === "create" && (
                <div className="space-y-3 px-4 pb-4">
                  {book && (
                    <div className="flex items-center gap-3 rounded-xl bg-muted/70 p-2">
                      <BookCover title={book.title} coverUrl={book.coverUrl} className="w-8" />
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BookOpenIcon className="size-3.5" /> {book.title}
                      </p>
                    </div>
                  )}
                  <Input name="clubName" placeholder="Nome do clube" aria-label="Nome do clube" required className="h-12" />
                </div>
              )}
              {selected && value === "join" && (
                <Field className="px-4 pb-4">
                  <Input
                    name="invite"
                    defaultValue={inviteLink}
                    placeholder="https://…/convite/…"
                    aria-label="Link do convite"
                    required
                    className="h-12"
                  />
                  {inviteLink && <FieldDescription>Preenchemos com o convite que você abriu.</FieldDescription>}
                </Field>
              )}
            </div>
          )
        })}
      </div>

      {state?.error && <FieldError className="mt-4">{state.error}</FieldError>}
      <StepButton pending={pending}>{mode === "skip" ? "Começar a ler" : mode === "join" ? "Entrar no clube" : "Criar clube"}</StepButton>
    </form>
  )
}

function StepButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <div className="mt-auto pt-8">
      <Button type="submit" size="lg" className="h-13 w-full text-base font-semibold" disabled={pending}>
        {pending ? "Salvando…" : children}
      </Button>
    </div>
  )
}
