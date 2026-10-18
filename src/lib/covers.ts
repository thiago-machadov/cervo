import "server-only"
import { randomUUID } from "node:crypto"
import { getCloudflareContext } from "@opennextjs/cloudflare"

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}
/** A foto chega reduzida pelo navegador (~200 KB); o limite cobre casos sem redução. */
const MAX_BYTES = 3 * 1024 * 1024

export type CoverResult = { path: string } | { error: string } | null

function bucket() {
  return getCloudflareContext().env.COVERS
}

/**
 * Salva a foto de capa no R2 e devolve o caminho público (/capas/...).
 * Devolve null quando nenhum arquivo foi enviado.
 */
export async function saveCover(userId: string, file: FormDataEntryValue | null): Promise<CoverResult> {
  if (!(file instanceof File) || file.size === 0) return null

  const extension = ALLOWED_TYPES[file.type]
  if (!extension) return { error: "A capa precisa ser uma foto (JPG, PNG ou WebP)" }
  if (file.size > MAX_BYTES) return { error: "Foto grande demais. Tente outra." }

  const key = `${userId}/${randomUUID()}.${extension}`
  await bucket().put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
  })
  return { path: `/capas/${key}` }
}

/** Lê uma capa do R2 (usado pela rota /capas/...). */
export function readCover(key: string) {
  return bucket().get(key)
}
