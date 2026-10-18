import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { ensureProfile } from "@/lib/auth"
import { safeNext } from "@/lib/redirects"
import { createSupabaseServerClient } from "@/lib/supabase/server"

/**
 * Destino do link de confirmação de e-mail.
 * Aceita o fluxo PKCE padrão (`?code=`) e o template com `token_hash` (funciona em outro dispositivo).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const next = safeNext(searchParams.get("next") ?? "/onboarding")
  const supabase = await createSupabaseServerClient()

  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null

  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { data: { user: null }, error: new Error("Link inválido") }

  if (error || !data.user?.email) {
    return NextResponse.redirect(new URL("/entrar?erro=link", origin))
  }

  const metadata = (data.user.user_metadata ?? {}) as { name?: unknown }
  await ensureProfile({
    id: data.user.id,
    email: data.user.email,
    name: typeof metadata.name === "string" ? metadata.name : null,
  })

  return NextResponse.redirect(new URL(next, origin))
}
