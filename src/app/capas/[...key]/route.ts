import { isImageKey, readCover } from "@/lib/covers"

/** Serve as fotos de capa guardadas no R2. Cada arquivo tem nome único, então pode ficar em cache para sempre. */
export async function GET(_request: Request, { params }: RouteContext<"/capas/[...key]">) {
  const { key } = await params
  const path = key.join("/")
  if (!isImageKey(path)) return new Response("Not found", { status: 404 })

  const object = await readCover(path)
  if (!object) return new Response("Not found", { status: 404 })

  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "image/jpeg",
      "cache-control": "public, max-age=31536000, immutable",
      etag: object.httpEtag,
    },
  })
}
