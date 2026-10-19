"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

/** Mostra um aviso uma vez (ex.: "Você entrou no clube") e tira o parâmetro da URL. */
export function WelcomeToast({ title, description }: { title: string; description?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  useEffect(() => {
    toast.success(title, { description })
    router.replace(pathname, { scroll: false })
  }, [title, description, router, pathname])
  return null
}
