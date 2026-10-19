"use client"

import { createContext, useCallback, useContext, useRef, useState } from "react"
import { AlertDialog } from "@base-ui/react/alert-dialog"
import { WarningIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"

type ConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Ação que apaga ou desfaz algo: botão vermelho e ícone de alerta. */
  destructive?: boolean
}

type Confirm = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<Confirm | null>(null)

/**
 * Pergunta "tem certeza?" no visual do app (substitui o confirm() do navegador).
 * Uso: const confirm = useConfirm(); if (await confirm({ title: "Apagar?" })) ...
 */
export function useConfirm() {
  const confirm = useContext(ConfirmContext)
  if (!confirm) throw new Error("useConfirm precisa estar dentro de <ConfirmProvider>")
  return confirm
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [open, setOpen] = useState(false)
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<Confirm>((next) => {
    resolver.current?.(false)
    setOptions(next)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  function finish(value: boolean) {
    resolver.current?.(value)
    resolver.current = null
    setOpen(false)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog.Root open={open} onOpenChange={(next) => !next && finish(false)}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/20 transition-opacity duration-150 supports-backdrop-filter:backdrop-blur-xs data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <AlertDialog.Popup className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 space-y-4 rounded-2xl bg-popover p-5 text-popover-foreground shadow-xl ring-1 ring-foreground/10 transition-[opacity,transform] duration-200 outline-none data-ending-style:translate-y-2 data-ending-style:opacity-0 data-starting-style:translate-y-2 data-starting-style:opacity-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2">
            <div className="flex gap-3">
              {options?.destructive && (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <WarningIcon className="size-5" weight="fill" />
                </span>
              )}
              <div className="space-y-1">
                <AlertDialog.Title className="text-base font-semibold">{options?.title}</AlertDialog.Title>
                {options?.description && (
                  <AlertDialog.Description className="text-sm text-muted-foreground">{options.description}</AlertDialog.Description>
                )}
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {/* Foco inicial no botão seguro: Enter não apaga nada sem querer. */}
              <AlertDialog.Close render={<Button variant="outline" className="h-11 sm:h-10" autoFocus />}>
                {options?.cancelLabel ?? "Cancelar"}
              </AlertDialog.Close>
              <Button
                variant={options?.destructive ? "destructive" : "default"}
                className="h-11 sm:h-10"
                onClick={() => finish(true)}
              >
                {options?.confirmLabel ?? "Confirmar"}
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  )
}
