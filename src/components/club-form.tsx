"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { BookBookmarkIcon, BooksIcon, GlobeHemisphereWestIcon, LockSimpleIcon } from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react/lib"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClub, updateClub } from "@/app/actions/clubs"
import { cn } from "@/lib/utils"

type ClubDefaults = {
  id: string
  name: string
  description: string | null
  bookId: string | null
  goalEndDate: string | null
  weeklyPages: number | null
  visibility: "PRIVATE" | "PUBLIC"
  maxMembers: number | null
  readingMode: "FIXED" | "FREE"
}

type Option<T extends string> = { value: T; icon: Icon; title: string; description: string }

/** Grupo de opções em cards (radio), com valor enviado por input oculto. */
function OptionCards<T extends string>({
  name,
  label,
  value,
  onChange,
  options,
}: {
  name: string
  label: string
  value: T
  onChange: (value: T) => void
  options: readonly Option<T>[]
}) {
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={label}>
        {options.map(({ value: optionValue, icon: OptionIcon, title, description }) => {
          const selected = value === optionValue
          return (
            <button
              key={optionValue}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(optionValue)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl bg-card p-3 text-left ring-1 ring-border transition-all",
                selected && "ring-2 ring-primary"
              )}
            >
              <OptionIcon
                className={cn("size-6 text-muted-foreground", selected && "text-primary")}
                weight={selected ? "fill" : "regular"}
              />
              <span className="text-sm font-semibold">{title}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

const READING_OPTIONS = [
  { value: "FIXED", icon: BookBookmarkIcon, title: "Um livro para todos", description: "O clube lê o mesmo livro, com meta e ranking" },
  { value: "FREE", icon: BooksIcon, title: "Cada um escolhe", description: "Cada membro lê o livro que quiser" },
] as const

const VISIBILITY_OPTIONS = [
  { value: "PRIVATE", icon: LockSimpleIcon, title: "Privado", description: "Só com link de convite" },
  { value: "PUBLIC", icon: GlobeHemisphereWestIcon, title: "Público", description: "Aparece na busca; qualquer leitor entra" },
] as const

const NO_BOOK = ""

/** No cadastro, opções avançadas ficam recolhidas (menos decisões de uma vez); na edição, abertas. */
function AdvancedOptions({ open, children }: { open: boolean; children: React.ReactNode }) {
  if (open) return <div className="space-y-6">{children}</div>
  return (
    <details className="group space-y-6 rounded-2xl ring-1 ring-border/60 [&[open]]:p-4">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-2xl px-4 text-sm font-semibold group-open:-mx-4 group-open:-mt-4 marker:hidden">
        Mais opções (limite de membros e meta)
        <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-180">
          ⌄
        </span>
      </summary>
      {children}
    </details>
  )
}

export function ClubForm({ books, club }: { books: { id: string; title: string }[]; club?: ClubDefaults }) {
  const [state, action, pending] = useActionState(club ? updateClub : createClub, undefined)
  const [visibility, setVisibility] = useState<"PRIVATE" | "PUBLIC">(club?.visibility ?? "PRIVATE")
  const [readingMode, setReadingMode] = useState<"FIXED" | "FREE">(club?.readingMode ?? "FIXED")
  const fixedBook = readingMode === "FIXED"
  // Depois de um erro do servidor, os campos voltam com o que a pessoa tinha digitado.
  const v = state?.values
  const bookItems = [{ value: NO_BOOK, label: "Escolher depois" }, ...books.map((b) => ({ value: b.id, label: b.title }))]

  return (
    <form action={action} className="space-y-6">
      {club && <input type="hidden" name="clubId" value={club.id} />}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Nome do clube</FieldLabel>
          <Input
            id="name"
            name="name"
            defaultValue={v?.name ?? club?.name}
            placeholder="Ex.: Leitores da firma"
            required
            className="h-11"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Descrição (opcional)</FieldLabel>
          <Textarea id="description" name="description" defaultValue={v?.description ?? club?.description ?? ""} rows={2} maxLength={500} />
        </Field>
      </FieldGroup>

      <FieldSet>
        <FieldLegend>O que o clube lê</FieldLegend>
        <OptionCards name="readingMode" label="Modo de leitura" value={readingMode} onChange={setReadingMode} options={READING_OPTIONS} />
        {fixedBook && (
          <Field>
            <FieldLabel htmlFor="bookId">Livro do clube</FieldLabel>
            <Select name="bookId" defaultValue={v?.bookId ?? club?.bookId ?? NO_BOOK} items={bookItems}>
              <SelectTrigger id="bookId" className="h-11 w-full">
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
              {books.length === 0 ? (
                <>
                  Sua biblioteca está vazia. <Link href="/biblioteca">Adicione um livro</Link> para escolher o livro do clube (ou escolha
                  depois).
                </>
              ) : (
                "O livro entra na biblioteca de todos os membros."
              )}
            </FieldDescription>
          </Field>
        )}
      </FieldSet>

      <FieldSet>
        <FieldLegend>Quem pode entrar</FieldLegend>
        <OptionCards
          name="visibility"
          label="Visibilidade do clube"
          value={visibility}
          onChange={setVisibility}
          options={VISIBILITY_OPTIONS}
        />
      </FieldSet>

      <AdvancedOptions open={Boolean(club)}>
        <FieldSet>
          <FieldLegend>Limite de membros</FieldLegend>
          <Field>
            <FieldLabel htmlFor="maxMembers">Máximo de pessoas (opcional)</FieldLabel>
            <Input
              id="maxMembers"
              name="maxMembers"
              type="number"
              inputMode="numeric"
              min={2}
              max={1000}
              placeholder="Sem limite"
              defaultValue={v?.maxMembers ?? club?.maxMembers ?? ""}
              className="h-11"
            />
            <FieldDescription>Quando lotar, ninguém mais entra, nem por convite.</FieldDescription>
          </Field>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Meta de leitura</FieldLegend>
          <FieldDescription>
            {fixedBook
              ? "Opcional. Use uma data final, um ritmo semanal, ou os dois."
              : "Opcional. Quantas páginas cada membro deve ler por semana, em qualquer livro."}
          </FieldDescription>
          <FieldGroup className="grid grid-cols-2 gap-4">
            {fixedBook && (
              <Field>
                <FieldLabel htmlFor="goalEndDate">Terminar até</FieldLabel>
                <Input
                  id="goalEndDate"
                  name="goalEndDate"
                  type="date"
                  defaultValue={v?.goalEndDate ?? club?.goalEndDate ?? ""}
                  className="h-11"
                />
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="weeklyPages">Págs. por semana</FieldLabel>
              <Input
                id="weeklyPages"
                name="weeklyPages"
                type="number"
                inputMode="numeric"
                min={1}
                defaultValue={v?.weeklyPages ?? club?.weeklyPages ?? ""}
                className="h-11"
              />
            </Field>
          </FieldGroup>
        </FieldSet>
      </AdvancedOptions>

      {state?.error && <FieldError>{state.error}</FieldError>}

      <Button type="submit" size="lg" className="h-11 w-full" disabled={pending}>
        {pending ? "Salvando…" : club ? "Salvar alterações" : "Criar clube"}
      </Button>
    </form>
  )
}
