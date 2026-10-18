import "server-only"
import { headers } from "next/headers"

/** Origem do site (https://cervobook.club em produção) a partir do request atual. */
export async function siteOrigin() {
  const h = await headers()
  const origin = h.get("origin")
  if (origin) return origin
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "http"
  return `${proto}://${host}`
}
