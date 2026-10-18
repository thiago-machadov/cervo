"use client"

import { useEffect, useState, useTransition } from "react"
import { CheckIcon, CopyIcon, ShareNetworkIcon, UserPlusIcon, WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"
import { EnvelopeDoodle } from "@/components/doodles"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { createInvite } from "@/app/actions/clubs"

/** Botão "Convidar": abre uma gaveta com o link do convite e opções de compartilhamento. */
export function InviteButton({ clubId, clubName }: { clubId: string; clubName: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
      <DrawerTrigger render={<Button variant="outline" className="h-10 flex-1" />}>
        <UserPlusIcon /> Convidar
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md overflow-y-auto">
          <DrawerHeader className="items-center text-center">
            <EnvelopeDoodle className="w-20" />
            <DrawerTitle>Convidar para {clubName}</DrawerTitle>
            <DrawerDescription>Quem abrir o link entra direto no clube. O link vale por 7 dias.</DrawerDescription>
          </DrawerHeader>
          {open && <InviteLink clubId={clubId} clubName={clubName} />}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function InviteLink({ clubId, clubName }: { clubId: string; clubName: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const result = await createInvite(clubId)
      if (result.code) setUrl(`${window.location.origin}/convite/${result.code}`)
      else setError(result.error ?? "Não foi possível gerar o convite")
    })
  }, [clubId])

  const message = `Bora ler junto no clube "${clubName}" no Cervo?`
  // Este componente só renderiza no navegador (depois de abrir a gaveta), então dá para checar aqui.
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function"

  async function copy() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Não foi possível copiar. Selecione o link e copie manualmente.")
    }
  }

  async function share() {
    if (!url) return
    try {
      await navigator.share({ title: clubName, text: message, url })
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) toast.error("Não foi possível compartilhar")
    }
  }

  if (error) return <p className="px-4 pb-6 text-center text-sm text-destructive">{error}</p>

  return (
    <div className="space-y-3 px-4 pb-6">
      <div className="flex items-center gap-2 rounded-2xl bg-muted p-2 pl-4">
        <input
          readOnly
          value={url ?? "Gerando link…"}
          aria-label="Link do convite"
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 truncate bg-transparent text-sm outline-none"
        />
        <Button size="sm" onClick={copy} disabled={!url} className="h-9 px-3">
          {copied ? <CheckIcon weight="bold" /> : <CopyIcon />} {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="h-11"
          disabled={!url}
          render={<a href={url ? `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}` : undefined} target="_blank" rel="noreferrer" />}
          nativeButton={false}
        >
          <WhatsappLogoIcon className="size-5" /> WhatsApp
        </Button>
        <Button variant="outline" className="h-11" onClick={share} disabled={!url || !canShare}>
          <ShareNetworkIcon className="size-5" /> Compartilhar
        </Button>
      </div>
    </div>
  )
}
