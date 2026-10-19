"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"

/** Quantas telas a pessoa já abriu dentro do app nesta aba (fora do React para sobreviver às navegações). */
let inAppNavigations = 0

/** Conta as navegações internas; montado uma vez no layout raiz. */
export function NavigationTracker() {
  const pathname = usePathname()
  useEffect(() => {
    inAppNavigations += 1
  }, [pathname])
  return null
}

/**
 * Voltar que respeita o caminho da pessoa: se ela chegou navegando no app, volta para a
 * tela anterior (de onde veio); se abriu um link direto, vai para a tela pai (`fallback`).
 */
export function BackButton({ fallback }: { fallback: string }) {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      render={<Link href={fallback} />}
      nativeButton={false}
      onClick={(event) => {
        if (inAppNavigations > 1) {
          event.preventDefault()
          router.back()
        }
      }}
    >
      <CaretLeftIcon className="size-5" />
      <span className="sr-only">Voltar</span>
    </Button>
  )
}
