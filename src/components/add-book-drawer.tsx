"use client"

import { useActionState, useEffect, useState } from "react"
import { PlusIcon } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addBook } from "@/app/actions/library"
import { STATUS_LABEL } from "@/lib/utils-text"

const statusItems = Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))

export function AddBookDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
      <DrawerTrigger render={<Button size="sm" />}>
        <PlusIcon /> Livro
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Adicionar livro</DrawerTitle>
          </DrawerHeader>
          {open && <AddBookForm onDone={() => setOpen(false)} />}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function AddBookForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(addBook, undefined)

  useEffect(() => {
    if (state?.ok) {
      toast.success("Livro adicionado à biblioteca")
      onDone()
    }
  }, [state, onDone])

  return (
    <form action={action}>
      <FieldGroup className="px-4">
        <Field>
          <FieldLabel htmlFor="title">Título</FieldLabel>
          <Input id="title" name="title" required className="h-11" />
        </Field>
        <Field>
          <FieldLabel htmlFor="author">Autor</FieldLabel>
          <Input id="author" name="author" required className="h-11" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="totalPages">Páginas</FieldLabel>
            <Input id="totalPages" name="totalPages" type="number" inputMode="numeric" min={1} required className="h-11" />
          </Field>
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select name="status" defaultValue="WANT" items={statusItems}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusItems.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="coverUrl">URL da capa (opcional)</FieldLabel>
          <Input id="coverUrl" name="coverUrl" type="url" inputMode="url" placeholder="https://…" className="h-11" />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
      </FieldGroup>
      <DrawerFooter>
        <Button type="submit" size="lg" className="h-11" disabled={pending}>
          {pending ? "Salvando…" : "Adicionar"}
        </Button>
      </DrawerFooter>
    </form>
  )
}
