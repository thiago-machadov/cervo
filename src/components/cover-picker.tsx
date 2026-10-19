"use client"

import { useRef, useState } from "react"
import { CameraIcon, ImageIcon, XIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const QUALITY = 0.82

/** Reduz a foto no próprio navegador (lado maior até `maxSide` px, JPEG) antes do upload. */
async function shrink(file: File, maxSide: number): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY))
  if (!blob) throw new Error("Falha ao processar a foto")
  return new File([blob], "foto.jpg", { type: "image/jpeg" })
}

/**
 * Campo de foto: tirar foto (câmera traseira) ou escolher da galeria.
 * O arquivo final (já reduzido) vai no formulário com o nome `name`.
 * `variant="cover"` mostra a prévia em formato de capa (2:3); `"photo"`, quadrada.
 */
export function CoverPicker({
  name = "coverFile",
  variant = "cover",
}: {
  name?: string
  variant?: "cover" | "photo"
} = {}) {
  const maxSide = variant === "cover" ? 900 : 1280
  const formInput = useRef<HTMLInputElement>(null)
  const cameraInput = useRef<HTMLInputElement>(null)
  const galleryInput = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0]
    event.target.value = ""
    if (!picked || !formInput.current) return
    setBusy(true)
    setError(null)
    try {
      const file = await shrink(picked, maxSide).catch(() => picked)
      const transfer = new DataTransfer()
      transfer.items.add(file)
      formInput.current.files = transfer.files
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old)
        return URL.createObjectURL(file)
      })
    } catch {
      setError("Não foi possível usar essa foto. Tente outra.")
    } finally {
      setBusy(false)
    }
  }

  function clear() {
    if (formInput.current) formInput.current.value = ""
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old)
      return null
    })
  }

  return (
    <div className="space-y-2">
      <input ref={formInput} type="file" name={name} accept="image/*" hidden />
      <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={handlePick} />
      <input ref={galleryInput} type="file" accept="image/*" hidden onChange={handlePick} />

      <div className="flex items-center gap-3">
        <div className={cn("relative shrink-0", variant === "cover" ? "aspect-[2/3] w-16" : "aspect-square w-20", " overflow-hidden rounded-lg bg-muted ring-1 ring-border")}>
          {preview ? (
            <>
              {/* Pré-visualização local (blob:), por isso <img> e não next/image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Foto escolhida" className="size-full object-cover" />
              <button
                type="button"
                onClick={clear}
                aria-label="Remover foto"
                className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-foreground/70 text-background after:absolute after:-inset-3 after:content-['']"
              >
                <XIcon className="size-3" weight="bold" />
              </button>
            </>
          ) : (
            <CameraIcon className="absolute inset-0 m-auto size-6 text-muted-foreground" />
          )}
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2">
          <Button type="button" variant="outline" className="h-11" disabled={busy} onClick={() => cameraInput.current?.click()}>
            <CameraIcon className="size-5" /> {busy ? "…" : "Tirar foto"}
          </Button>
          <Button type="button" variant="outline" className="h-11" disabled={busy} onClick={() => galleryInput.current?.click()}>
            <ImageIcon className="size-5" /> Galeria
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
