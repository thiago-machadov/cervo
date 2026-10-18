import "server-only"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { supabaseCookieOptions, supabaseEnv } from "./env"

/** Cliente Supabase por request, lendo/gravando a sessão nos cookies. Usado só para Auth. */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const { url, key } = supabaseEnv()

  return createServerClient(url, key, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Components não podem gravar cookies; o proxy renova a sessão nesses casos.
        }
      },
    },
  })
}
