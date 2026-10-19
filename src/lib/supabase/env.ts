/**
 * O app só usa o Supabase no servidor (não há cliente de browser), então a sessão
 * pode ficar em cookie httpOnly, fora do alcance de JavaScript na página.
 */
export const supabaseCookieOptions = { httpOnly: true, sameSite: "lax", path: "/" } as const

/**
 * Lidas em tempo de execução (no Worker vêm de "vars" no wrangler.jsonc), para trocar de
 * projeto sem rebuild. NEXT_PUBLIC_* ficam como alternativa para o desenvolvimento local.
 */
export function supabaseEnv() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY não configuradas")
  return { url, key }
}
