"use client"

import { useSyncExternalStore } from "react"
import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react/dist/ssr"
import { useTheme } from "next-themes"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const noop = () => () => {}

/** Escolha de tema: claro, escuro ou seguir o sistema. */
export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  // O tema salvo só existe no navegador; antes de montar, mostra "Sistema".
  const mounted = useSyncExternalStore(noop, () => true, () => false)

  return (
    <div className="space-y-2 rounded-2xl bg-card p-4 ring-1 ring-border/60">
      <p className="text-xs text-muted-foreground">Aparência</p>
      <Tabs value={mounted ? (theme ?? "system") : "system"} onValueChange={(value) => setTheme(String(value))}>
        <TabsList variant="pill" className="w-full">
          <TabsTrigger value="light">
            <SunIcon /> Claro
          </TabsTrigger>
          <TabsTrigger value="dark">
            <MoonIcon /> Escuro
          </TabsTrigger>
          <TabsTrigger value="system">
            <DesktopIcon /> Sistema
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
