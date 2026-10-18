"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { DeviceMobileIcon, XIcon } from "@phosphor-icons/react/dist/ssr"
import { isStandalone } from "@/lib/install"

const STORAGE_KEY = "cervo:install-banner-dismissed"
const noop = () => () => {}

function readDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

/** Convite para instalar o app; some se já estiver instalado ou se a pessoa dispensar. */
export function InstallBanner() {
  const installed = useSyncExternalStore(noop, isStandalone, () => true)
  const storedDismissed = useSyncExternalStore(noop, readDismissed, () => true)
  const [dismissed, setDismissed] = useState(false)

  if (installed || storedDismissed || dismissed) return null

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEY, "1")
    } catch {
      // Sem storage (aba anônima etc.): só esconde nesta visita.
    }
  }

  return (
    <div className="mx-4 flex items-center gap-3 rounded-2xl bg-secondary p-3 pl-4 text-secondary-foreground">
      <DeviceMobileIcon className="size-6 shrink-0" />
      <Link href="/instalar" className="min-w-0 flex-1 text-sm">
        <span className="font-semibold">Instale o Cervo no celular</span>
        <span className="block text-xs opacity-80">Abra direto da tela inicial, como um app.</span>
      </Link>
      <button type="button" onClick={dismiss} aria-label="Dispensar" className="rounded-full p-1.5 hover:bg-card/60">
        <XIcon className="size-4" />
      </button>
    </div>
  )
}
