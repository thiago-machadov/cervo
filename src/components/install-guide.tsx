"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import {
  CheckCircleIcon,
  CompassIcon,
  DotsThreeVerticalIcon,
  DownloadSimpleIcon,
  ExportIcon,
  PlusSquareIcon,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react/lib"
import { DeerDoodle } from "@/components/doodles"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { detectPlatform, isIosNonSafari, isStandalone, type BeforeInstallPromptEvent, type Platform } from "@/lib/install"

const noop = () => () => {}

type Step = { icon: Icon; title: string; detail: string }

const STEPS: Record<Exclude<Platform, "desktop">, Step[]> = {
  ios: [
    { icon: CompassIcon, title: "Abra no Safari", detail: "No iPhone, só o Safari instala apps da web. Abra cervobook.club nele." },
    { icon: ExportIcon, title: "Toque em Compartilhar", detail: "É o quadrado com a seta para cima, na barra de baixo (ou no topo, no iPad)." },
    { icon: PlusSquareIcon, title: "Adicionar à Tela de Início", detail: "Role a lista de opções e toque em “Adicionar à Tela de Início”." },
    { icon: CheckCircleIcon, title: "Confirme em Adicionar", detail: "O cervo aparece na sua tela inicial. Abra por ele para usar em tela cheia." },
  ],
  android: [
    { icon: CompassIcon, title: "Abra no Chrome", detail: "Funciona também no Samsung Internet e no Edge." },
    { icon: DotsThreeVerticalIcon, title: "Toque no menu", detail: "Os três pontinhos no canto superior direito." },
    { icon: DownloadSimpleIcon, title: "Instalar app", detail: "Toque em “Instalar app” (ou “Adicionar à tela inicial”)." },
    { icon: CheckCircleIcon, title: "Confirme", detail: "O cervo aparece na sua tela inicial e na lista de apps." },
  ],
}

export function InstallGuide() {
  // Lido só no navegador; no servidor fica null e mostramos o padrão.
  const userAgent = useSyncExternalStore(noop, () => navigator.userAgent, () => null)
  const installed = useSyncExternalStore(noop, isStandalone, () => false)
  const detected = userAgent ? detectPlatform(userAgent) : null
  const [choice, setChoice] = useState<"ios" | "android" | null>(null)
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    return () => window.removeEventListener("beforeinstallprompt", onPrompt)
  }, [])

  const platform = choice ?? (detected === "android" ? "android" : "ios")

  async function installNow() {
    if (!promptEvent) return
    await promptEvent.prompt()
    await promptEvent.userChoice
    setPromptEvent(null)
  }

  if (installed) {
    return (
      <div className="mx-4 flex flex-col items-center gap-3 rounded-3xl bg-card p-6 text-center ring-1 ring-border/60">
        <DeerDoodle className="w-24" />
        <h2 className="font-display text-2xl font-bold text-primary">Já instalado</h2>
        <p className="text-sm text-muted-foreground">Você está usando o Cervo pela tela inicial. Boa leitura!</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 px-4 pb-6">
      <div className="flex items-center gap-4 rounded-3xl bg-primary p-5 text-primary-foreground">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground">
          <DeerDoodle className="w-11" />
        </div>
        <div className="space-y-1">
          <p className="font-display text-lg font-bold">Cervo na tela inicial</p>
          <p className="text-sm opacity-85">Abre em tela cheia, como um app, e fica a um toque do seu check-in diário.</p>
        </div>
      </div>

      {promptEvent && (
        <Button size="lg" className="h-12 w-full text-base font-semibold" onClick={installNow}>
          <DownloadSimpleIcon className="size-5" /> Instalar agora
        </Button>
      )}

      {userAgent && isIosNonSafari(userAgent) && (
        <p className="rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
          Você está num navegador que não instala apps no iPhone. Copie o endereço <strong>cervobook.club</strong> e abra
          no <strong>Safari</strong>.
        </p>
      )}

      <Tabs value={platform} onValueChange={(value) => setChoice(value as "ios" | "android")}>
        <TabsList variant="pill" className="w-full">
          <TabsTrigger value="ios">iPhone</TabsTrigger>
          <TabsTrigger value="android">Android</TabsTrigger>
        </TabsList>
      </Tabs>

      <ol className="space-y-3">
        {STEPS[platform].map(({ icon: StepIcon, title, detail }, index) => (
          <li key={title} className="flex items-start gap-4 rounded-2xl bg-card p-4 ring-1 ring-border/60">
            <span className="font-display flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-bold text-primary">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="flex items-center gap-2 font-semibold">
                {title} <StepIcon className="size-5 text-primary" />
              </p>
              <p className="text-sm text-muted-foreground">{detail}</p>
            </div>
          </li>
        ))}
      </ol>

      {detected === "desktop" && (
        <p className="text-center text-xs text-muted-foreground">
          Você está no computador. Abra <strong>cervobook.club</strong> no celular para instalar.
        </p>
      )}
    </div>
  )
}
