import { isImageKey, readCheckInPhoto } from "@/lib/covers"

/**
 * Serve as fotos dos check-ins guardadas no R2. A rota passa pelo proxy, então só quem
 * está logado acessa; o nome do arquivo é aleatório, o que impede adivinhar fotos alheias.
 */
export async function GET(_request: Request, { params }: RouteContext<"/fotos/[...key]">) {
  const { key } = await params
  const path = key.join("/")
  if (!isImageKey(path)) return new Response("Not found", { status: 404 })

  const object = await readCheckInPhoto(path)
  if (!object) return new Response("Not found", { status: 404 })

  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "image/jpeg",
      // private: navegador guarda, CDN não (a foto só aparece para quem está logado).
      "cache-control": "private, max-age=31536000, immutable",
      etag: object.httpEtag,
    },
  })
}
