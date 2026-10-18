"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClub, updateClub } from "@/app/actions/clubs"

type ClubDefaults = {
  id: string
  name: string
  description: string | null
  bookId: string | null
  goalEndDate: string | null
  weeklyPages: number | null
}

const NO_BOOK = ""

export function ClubForm({
  books,
  club,
}: {
  books: { id: string; title: string }[]
  club?: ClubDefaults
}) {
  const [state, action, pending] = useActionState(club ? updateClub : createClub, undefined)
  const bookItems = [{ value: NO_BOOK, label: "Escolher depois" }, ...books.map((b) => ({ value: b.id, label: b.title }))]

  return (
    <form action={action} className="space-y-6">
      {club && <input type="hidden" name="clubId" value={club.id} />}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Nome do clube</FieldLabel>
          <Input id="name" name="name" defaultValue={club?.name} placeholder="Ex.: Leitores da firma" required className="h-11" />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Descrição (opcional)</FieldLabel>
          <Textarea id="description" name="description" defaultValue={club?.description ?? ""} rows={2} maxLength={500} />
        </Field>
        <Field>
          <FieldLabel>Livro atual</FieldLabel>
          <Select name="bookId" defaultValue={club?.bookId ?? NO_BOOK} items={bookItems}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bookItems.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            {books.length === 0
              ? "Adicione livros à sua biblioteca para escolher o livro do clube."
              : "O livro entra na biblioteca de todos os membros."}
          </FieldDescription>
        </Field>
      </FieldGroup>

      <FieldSet>
        <FieldLegend>Meta de leitura</FieldLegend>
        <FieldDescription>Opcional. Use uma data final, um ritmo semanal, ou os dois.</FieldDescription>
        <FieldGroup className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="goalEndDate">Terminar até</FieldLabel>
            <Input id="goalEndDate" name="goalEndDate" type="date" defaultValue={club?.goalEndDate ?? ""} className="h-11" />
          </Field>
          <Field>
            <FieldLabel htmlFor="weeklyPages">Págs. por semana</FieldLabel>
            <Input
              id="weeklyPages"
              name="weeklyPages"
              type="number"
              inputMode="numeric"
              min={1}
              defaultValue={club?.weeklyPages ?? ""}
              className="h-11"
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      {state?.error && <FieldError>{state.error}</FieldError>}

      <Button type="submit" size="lg" className="h-11 w-full" disabled={pending}>
        {pending ? "Salvando…" : club ? "Salvar alterações" : "Criar clube"}
      </Button>
    </form>
  )
}
