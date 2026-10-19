import { Suspense, ViewTransition } from "react"
import { PageSkeleton } from "@/components/page-skeleton"

/**
 * Suspense padrão das telas, com animação: enquanto carrega mostra o esqueleto;
 * quando os dados chegam, o esqueleto sai rápido e o conteúdo sobe com um fade.
 * Ao navegar para outra tela, o conteúdo atual sai com um fade curto.
 */
export function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ViewTransition enter="content-in" exit="content-out" default="none">
        <div>{children}</div>
      </ViewTransition>
    </Suspense>
  )
}
