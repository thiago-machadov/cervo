"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr"
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
import { Textarea } from "@/components/ui/textarea"
import { deleteCheckIn, updateCheckIn } from "@/app/actions/checkins"

type EditableCheckIn = {
  id: string
  fromPage: number
  toPage: number
  totalPages: number
  minutes: number | null
  note: string | null
  photoUrl: string | null
}

/** Editar e apagar um check-in (só aparece para o autor). */
export function CheckInActions({ checkIn, isLatest }: { checkIn: EditableCheckIn; isLatest: boolean }) {
  const [open, setOpen] = useState(false)
  const [deleting, startDelete] = useTransition()

  function remove() {
    const message = isLatest
      ? `Apagar este check-in? Seu progresso no livro volta para a página ${checkIn.fromPage}. Comentários e reações também somem.`
      : "Apagar este check-in? Comentários e reações também somem."
    if (confirm(message)) startDelete(() => deleteCheckIn(checkIn.id))
  }

  return (
    <div className="flex gap-2">
      <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
        <DrawerTrigger render={<Button variant="outline" className="h-10 flex-1" />}>
          <PencilSimpleIcon /> Editar
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle>Editar check-in</DrawerTitle>
              <DrawerDescription>Corrija a página, os minutos, a nota ou a foto.</DrawerDescription>
            </DrawerHeader>
            {open && <EditForm checkIn={checkIn} isLatest={isLatest} onDone={() => setOpen(false)} />}
          </div>
        </DrawerContent>
      </Drawer>
      <Button variant="outline" className="h-10 flex-1 text-destructive" disabled={deleting} onClick={remove}>
        <TrashIcon /> {deleting ? "Apagando…" : "Apagar"}
      </Button>
    </div>
  )
}

function EditForm({ checkIn, isLatest, onDone }: { checkIn: EditableCheckIn; isLatest: boolean; onDone: () => void }) {
  const [state, action, pending] = useActionState(updateCheckIn, undefined)

  useEffect(() => {
    if (state?.ok) {
      toast.success("Check-in atualizado")
      onDone()
    }
  }, [state, onDone])

  return (
    <form action={action}>
      <input type="hidden" name="checkInId" value={checkIn.id} />
      <FieldGroup className="px-4">
        <Field>
          <FieldLabel htmlFor="edit-toPage">Parei na página</FieldLabel>
          <Input
            id="edit-toPage"
            name="toPage"
            type="number"
            inputMode="numeric"
            min={checkIn.fromPage + 1}
            max={checkIn.totalPages}
            defaultValue={checkIn.toPage}
            disabled={!isLatest}
            required={isLatest}
            className="h-11 text-lg"
          />
          <FieldDescription>
            {isLatest
              ? `Começou na página ${checkIn.fromPage}, de ${checkIn.totalPages}.`
              : "Você já fez check-ins depois deste no mesmo livro, então a página não pode mudar."}
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="edit-minutes">Minutos lidos</FieldLabel>
          <Input
            id="edit-minutes"
            name="minutes"
            type="number"
            inputMode="numeric"
            min={1}
            max={1440}
            defaultValue={checkIn.minutes ?? ""}
            className="h-11"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="edit-note">Nota</FieldLabel>
          <Textarea id="edit-note" name="note" defaultValue={checkIn.note ?? ""} rows={3} maxLength={1000} />
        </Field>
        <Field>
          <FieldLabel>{checkIn.photoUrl ? "Trocar foto" : "Foto (opcional)"}</FieldLabel>
          {checkIn.photoUrl && (
            <label className="flex items-center gap-3 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={checkIn.photoUrl} alt="Foto atual" className="size-12 rounded-lg object-cover ring-1 ring-border" />
              <input type="checkbox" name="removePhoto" className="size-4 accent-primary" />
              Remover a foto atual
            </label>
          )}
          <CoverPicker name="photoFile" variant="photo" />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
      </FieldGroup>
      <DrawerFooter>
        <Button type="submit" size="lg" className="h-11" disabled={pending}>
          {pending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </DrawerFooter>
    </form>
  )
}
