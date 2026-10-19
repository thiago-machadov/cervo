"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { CoverPicker } from "@/components/cover-picker"
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AddBookDrawer } from "@/components/add-book-drawer"
import { createCheckIn } from "@/app/actions/checkins"
import type { CheckInOption } from "@/lib/queries"

export function CheckInDrawer({
  options,
  defaultItemId,
  goalType,
  trigger,
}: {
  options: CheckInOption[]
  defaultItemId?: string
  goalType?: string | null
  trigger: React.ReactElement
}) {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
      <DrawerTrigger render={trigger} />
      <DrawerContent>
        <div className="mx-auto w-full max-w-md overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Check-in de leitura</DrawerTitle>
            <DrawerDescription>Em que página você parou hoje?</DrawerDescription>
          </DrawerHeader>
          {options.length === 0 ? (
            <div className="space-y-4 p-4 pt-0 text-sm text-muted-foreground">
              <p>Adicione um livro à sua biblioteca para registrar a leitura.</p>
              <AddBookDrawer defaultStatus="READING" label="Adicionar o livro que estou lendo" full />
            </div>
          ) : (
            // Montar só quando aberto reinicia o formulário (e o estado da action) a cada abertura.
            open && (
              <CheckInForm options={options} defaultItemId={defaultItemId} goalType={goalType} onDone={() => setOpen(false)} />
            )
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function CheckInForm({
  options,
  defaultItemId,
  goalType,
  onDone,
}: {
  options: CheckInOption[]
  defaultItemId?: string
  goalType?: string | null
  onDone: () => void
}) {
  const minutesRequired = goalType === "MINUTES"
  const [state, action, pending] = useActionState(createCheckIn, undefined)
  const [itemId, setItemId] = useState(defaultItemId ?? options[0]!.id)
  const selected = options.find((o) => o.id === itemId) ?? options[0]!

  useEffect(() => {
    if (!state?.ok) return
    const c = state.celebrate
    if (c?.finished) {
      toast.success("Livro terminado! 🎉", { description: "Mais um para a estante. Que tal escolher o próximo?" })
    } else if (c) {
      const unit = c.goal?.type === "MINUTES" ? "min" : "págs."
      const goalText = !c.goal
        ? "Leitura registrada."
        : c.goal.done >= c.goal.target
          ? "Meta de hoje batida! ✅"
          : `Faltam ${c.goal.target - c.goal.done} ${unit} para a meta de hoje.`
      toast.success(c.streak > 1 ? `${c.streak} dias seguidos! 🔥` : "Sequência começou! 🔥", { description: goalText })
    } else {
      toast.success("Check-in registrado! 🔥")
    }
    onDone()
  }, [state, onDone])

  return (
    <form action={action}>
      <FieldGroup className="px-4">
        <Field>
          <FieldLabel>Livro</FieldLabel>
          <Select
            name="itemId"
            value={itemId}
            onValueChange={(value) => value && setItemId(value)}
            items={options.map((o) => ({ value: o.id, label: o.title }))}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="toPage">Parei na página</FieldLabel>
          <Input
            key={selected.id}
            id="toPage"
            name="toPage"
            type="number"
            inputMode="numeric"
            min={selected.currentPage + 1}
            max={selected.totalPages}
            placeholder={`ex.: ${Math.min(selected.currentPage + 10, selected.totalPages)}`}
            required
            className="h-11 text-lg"
          />
          <FieldDescription>
            Você estava na página {selected.currentPage} de {selected.totalPages}.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="minutes">{minutesRequired ? "Quantos minutos você leu?" : "Minutos lidos (opcional)"}</FieldLabel>
          <Input
            id="minutes"
            name="minutes"
            type="number"
            inputMode="numeric"
            min={1}
            max={1440}
            placeholder="30"
            required={minutesRequired}
            className="h-11"
          />
          {minutesRequired && <FieldDescription>Sua meta diária é em minutos.</FieldDescription>}
        </Field>
        <Field>
          <FieldLabel htmlFor="note">Nota (opcional)</FieldLabel>
          <Textarea id="note" name="note" placeholder="O que achou da leitura de hoje?" rows={3} maxLength={1000} />
        </Field>
        <Field>
          <FieldLabel>Foto (opcional)</FieldLabel>
          <CoverPicker name="photoFile" variant="photo" />
          <FieldDescription>Um trecho, o cantinho de leitura, o café… Aparece no feed.</FieldDescription>
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
      </FieldGroup>
      <DrawerFooter>
        <Button type="submit" size="lg" className="h-11" disabled={pending}>
          {pending ? "Salvando…" : "Registrar leitura"}
        </Button>
      </DrawerFooter>
    </form>
  )
}
