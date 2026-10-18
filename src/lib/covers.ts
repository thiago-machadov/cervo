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

/** Valida e grava uma imagem no R2 em `<prefix><userId>/<uuid>.<ext>`; devolve a chave sem o prefixo. */
async function saveImage(
  prefix: string,
  userId: string,
  file: FormDataEntryValue | null,
  label: string
): Promise<{ key: string } | { error: string } | null> {
  if (!(file instanceof File) || file.size === 0) return null

  const extension = ALLOWED_TYPES[file.type]
  if (!extension) return { error: `${label} precisa ser uma imagem (JPG, PNG ou WebP)` }
  if (file.size > MAX_BYTES) return { error: "Foto grande demais. Tente outra." }

  const key = `${userId}/${randomUUID()}.${extension}`
  await bucket().put(prefix + key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
  })
  return { key }
}

/** Só aceita o formato que nós mesmos geramos: <userId>/<uuid>.<ext> */
export function isImageKey(key: string) {
  return /^[\w-]+\/[\w-]+\.(jpg|png|webp)$/.test(key)
}

/**
 * Salva a foto de capa no R2 e devolve o caminho público (/capas/...).
 * Devolve null quando nenhum arquivo foi enviado.
 */
export async function saveCover(userId: string, file: FormDataEntryValue | null): Promise<CoverResult> {
  const result = await saveImage("", userId, file, "A capa")
  if (!result || "error" in result) return result
  return { path: `/capas/${result.key}` }
}

/** Lê uma capa do R2 (usado pela rota /capas/...). */
export function readCover(key: string) {
  return bucket().get(key)
}

/**
 * Salva a foto de um check-in no R2 (prefixo `fotos/`) e devolve o caminho (/fotos/...).
 * Diferente das capas, /fotos exige login (passa pelo proxy).
 */
export async function saveCheckInPhoto(userId: string, file: FormDataEntryValue | null): Promise<CoverResult> {
  const result = await saveImage("fotos/", userId, file, "A foto")
  if (!result || "error" in result) return result
  return { path: `/fotos/${result.key}` }
}

/** Lê a foto de um check-in do R2 (usado pela rota /fotos/...). */
export function readCheckInPhoto(key: string) {
  return bucket().get(`fotos/${key}`)
}

/** Chave no R2 de um caminho salvo no banco (/capas/... ou /fotos/...); null se não for nosso. */
function storageKey(path: string | null | undefined) {
  const match = path?.match(/^\/(capas|fotos)\/(.+)$/)
  if (!match || !isImageKey(match[2]!)) return null
  return match[1] === "fotos" ? `fotos/${match[2]}` : match[2]!
}

/** Apaga do R2 as imagens destes caminhos (ignora vazios e caminhos externos). */
export async function deleteImages(paths: (string | null | undefined)[]) {
  const keys = paths.map(storageKey).filter((key): key is string => key !== null)
  if (keys.length > 0) await bucket().delete(keys)
}

/** Apaga todas as fotos de check-in de um usuário (exclusão de conta). */
export async function deleteAllCheckInPhotos(userId: string) {
  let cursor: string | undefined
  do {
    const page = await bucket().list({ prefix: `fotos/${userId}/`, cursor })
    if (page.objects.length > 0) await bucket().delete(page.objects.map((o) => o.key))
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)
}
