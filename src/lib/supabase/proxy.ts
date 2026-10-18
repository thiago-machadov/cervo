import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { supabaseCookieOptions, supabaseEnv } from "./env"

/**
 * Renova o token do Supabase a cada request (gravando os cookies na resposta)
 * e devolve se há usuário autenticado.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { url, key } = supabaseEnv()

  const supabase = createServerClient(url, key, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers).forEach(([header, value]) => response.headers.set(header, value))
      },
    },
  })

  // Não coloque código entre a criação do cliente e getClaims(): é aqui que a sessão é renovada.
  const { data } = await supabase.auth.getClaims()
  return { response, isAuthenticated: Boolean(data?.claims?.sub) }
}

/** Redireciona preservando os cookies de sessão que o Supabase acabou de gravar. */
export function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url)
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}
