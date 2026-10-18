/**
 * O app só usa o Supabase no servidor (não há cliente de browser), então a sessão
 * pode ficar em cookie httpOnly, fora do alcance de JavaScript na página.
 */
export const supabaseCookieOptions = { httpOnly: true, sameSite: "lax", path: "/" } as const

export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY não configuradas")
  return { url, key }
}
