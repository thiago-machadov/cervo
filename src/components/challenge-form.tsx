"use client"

import { useActionState, useEffect, useState } from "react"
import { TrophyIcon } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createChallenge } from "@/app/actions/clubs"

function addDays(day: string, days: number) {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Gaveta para o dono/admin criar um desafio no clube. */
export function CreateChallengeButton({ clubId, today }: { clubId: string; today: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
      <DrawerTrigger render={<Button variant="outline" className="h-10 w-full" />}>
        <TrophyIcon /> Criar desafio
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Novo desafio</DrawerTitle>
            <DrawerDescription>Ex.: ler em 25 dos próximos 30 dias. Conta qualquer check-in, de qualquer livro.</DrawerDescription>
          </DrawerHeader>
          {open && <ChallengeForm clubId={clubId} today={today} onDone={() => setOpen(false)} />}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function ChallengeForm({ clubId, today, onDone }: { clubId: string; today: string; onDone: () => void }) {
  const [state, action, pending] = useActionState(createChallenge, undefined)
  const v = state?.values

  useEffect(() => {
    if (state?.ok) {
      toast.success("Desafio criado! 🏆")
      onDone()
    }
  }, [state, onDone])

  return (
    <form action={action}>
      <input type="hidden" name="clubId" value={clubId} />
      <FieldGroup className="px-4">
        <Field>
          <FieldLabel htmlFor="challenge-title">Nome</FieldLabel>
          <Input id="challenge-title" name="title" defaultValue={v?.title ?? "Desafio de 30 dias"} maxLength={60} required className="h-11" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="challenge-start">Começa em</FieldLabel>
            <Input id="challenge-start" name="startsOn" type="date" defaultValue={v?.startsOn ?? today} required className="h-11" />
          </Field>
          <Field>
            <FieldLabel htmlFor="challenge-end">Termina em</FieldLabel>
            <Input id="challenge-end" name="endsOn" type="date" defaultValue={v?.endsOn ?? addDays(today, 29)} required className="h-11" />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="challenge-days">Meta: dias com leitura</FieldLabel>
          <Input id="challenge-days" name="targetDays" type="number" inputMode="numeric" min={1} max={366} defaultValue={v?.targetDays ?? 25} required className="h-11" />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
      </FieldGroup>
      <DrawerFooter>
        <Button type="submit" size="lg" className="h-11" disabled={pending}>
          {pending ? "Criando…" : "Criar desafio"}
        </Button>
      </DrawerFooter>
    </form>
  )
}
