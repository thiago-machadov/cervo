import { NextResponse, type NextRequest } from "next/server"
import { redirectWithCookies, updateSession } from "@/lib/supabase/proxy"

const PUBLIC_PATHS = ["/boas-vindas", "/entrar", "/cadastro", "/esqueci-senha", "/instalar", "/termos", "/privacidade", "/auth/"]

/** Renova a sessão do Supabase e faz a checagem otimista de login. A validação real acontece no servidor. */
export async function proxy(request: NextRequest) {
  const { response, isAuthenticated } = await updateSession(request)
  const { pathname, search } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  // Visitante na raiz: mostra a landing no próprio "/" (sem redirecionar), melhor para o Google.
  if (!isAuthenticated && pathname === "/") {
    const rewrite = NextResponse.rewrite(new URL("/boas-vindas", request.url), { request })
    response.cookies.getAll().forEach((cookie) => rewrite.cookies.set(cookie))
    return rewrite
  }

  if (!isAuthenticated && !isPublic) {
    const url = new URL("/boas-vindas", request.url)
    if (pathname !== "/") url.searchParams.set("next", pathname + search)
    return redirectWithCookies(url, response)
  }

  return response
}

export const config = {
  // /capas fica de fora: imagens públicas, sem necessidade de checar a sessão (economiza CPU no Worker).
  // /api/stripe também: o webhook vem do Stripe, sem cookies de login. robots, sitemap e a imagem
  // de compartilhamento são públicos e precisam responder sem redirecionar para o login.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon|apple-icon|capas/|api/stripe/|robots.txt|sitemap.xml|opengraph-image|.*\\.(?:png|svg|ico|webp)$).*)"],
}
