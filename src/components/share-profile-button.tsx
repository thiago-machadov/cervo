"use client"

import { useState } from "react"
import { CheckIcon, CopyIcon, ShareNetworkIcon, UserPlusIcon, WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"
import { EnvelopeDoodle } from "@/components/doodles"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"

/** Gaveta com o link do perfil do usuário, para alguém abrir e mandar pedido de amizade. */
export function ShareProfileButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
      <DrawerTrigger render={<Button className="h-11 w-full" />}>
        <UserPlusIcon /> Convidar amigos
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md overflow-y-auto">
          <DrawerHeader className="items-center text-center">
            <EnvelopeDoodle className="w-20" />
            <DrawerTitle>Seu link de amizade</DrawerTitle>
            <DrawerDescription>Quem abrir o link vê seu perfil e pode te mandar um pedido. Você aceita se quiser.</DrawerDescription>
          </DrawerHeader>
          {open && <ProfileLink userId={userId} />}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function ProfileLink({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false)
  // Só renderiza no navegador (depois de abrir a gaveta).
  const url = `${window.location.origin}/pessoas/${userId}`
  const message = "Me adiciona no Cervo pra gente acompanhar a leitura um do outro!"
  const canShare = typeof navigator.share === "function"

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Não foi possível copiar. Selecione o link e copie manualmente.")
    }
  }

  async function share() {
    try {
      await navigator.share({ title: "Cervo", text: message, url })
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) toast.error("Não foi possível compartilhar")
    }
  }

  return (
    <div className="space-y-3 px-4 pb-6">
      <div className="flex items-center gap-2 rounded-2xl bg-muted p-2 pl-4">
        <input
          readOnly
          value={url}
          aria-label="Link do seu perfil"
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 truncate bg-transparent text-sm outline-none"
        />
        <Button size="sm" onClick={copy} className="h-9 px-3">
          {copied ? <CheckIcon weight="bold" /> : <CopyIcon />} {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="h-11"
          render={<a href={`https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`} target="_blank" rel="noreferrer" />}
          nativeButton={false}
        >
          <WhatsappLogoIcon className="size-5" /> WhatsApp
        </Button>
        <Button variant="outline" className="h-11" onClick={share} disabled={!canShare}>
          <ShareNetworkIcon className="size-5" /> Compartilhar
        </Button>
      </div>
    </div>
  )
}
