import "server-only"
import { connection } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type SessionIdentity = { id: string; email: string; name: string | null }

/** Identidade verificada da sessão do Supabase (JWT validado), ou null. */
export async function getSessionIdentity(): Promise<SessionIdentity | null> {
  // A validação do token depende do horário atual e dos cookies: roda a cada request.
  await connection()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (error || !claims?.sub || !claims.email) return null

  const metadata = (claims.user_metadata ?? {}) as { name?: unknown }
  return {
    id: claims.sub,
    email: claims.email,
    name: typeof metadata.name === "string" ? metadata.name : null,
  }
}

export async function getSessionUserId() {
  return (await getSessionIdentity())?.id ?? null
}
