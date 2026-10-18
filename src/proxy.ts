import type { NextRequest } from "next/server"
import { redirectWithCookies, updateSession } from "@/lib/supabase/proxy"

const PUBLIC_PATHS = ["/boas-vindas", "/entrar", "/cadastro", "/esqueci-senha", "/auth/"]

/** Renova a sessão do Supabase e faz a checagem otimista de login. A validação real acontece no servidor. */
export async function proxy(request: NextRequest) {
  const { response, isAuthenticated } = await updateSession(request)
  const { pathname, search } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  if (!isAuthenticated && !isPublic) {
    const url = new URL("/boas-vindas", request.url)
    if (pathname !== "/") url.searchParams.set("next", pathname + search)
    return redirectWithCookies(url, response)
  }

  return response
}

export const config = {
  // /capas fica de fora: imagens públicas, sem necessidade de checar a sessão (economiza CPU no Worker).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon|apple-icon|capas/|.*\\.(?:png|svg|ico|webp)$).*)"],
}
