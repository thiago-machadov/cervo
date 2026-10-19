import type { Metadata } from "next"
import { BookDoodle, DeerDoodle, SpiralClusterDoodle, StarDoodle } from "@/components/doodles"

// Login, cadastro e senha: o Google pode seguir os links, mas não lista estas telas.
export const metadata: Metadata = { robots: { index: false, follow: true } }

/**
 * Celular e tablet: coluna única centralizada. Desktop: painel da marca à esquerda e o
 * formulário à direita, para a tela larga não ficar vazia.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <DeerDoodle className="w-14 text-primary-foreground" label="Cervo" />
        <div className="relative space-y-4">
          <StarDoodle className="w-10 text-primary-foreground" />
          <p className="font-display max-w-sm text-5xl leading-[1.05] font-bold uppercase">Leia junto. Todo dia, um pouco.</p>
          <p className="max-w-sm text-base opacity-90">Check-ins, sequência, metas e clubes do livro com os amigos.</p>
        </div>
        <BookDoodle className="w-56 self-end text-primary-foreground opacity-90" />
        <SpiralClusterDoodle className="pointer-events-none absolute -top-16 -right-16 w-72 text-primary-foreground opacity-15" />
      </aside>
      <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)] lg:justify-center">
        <SpiralClusterDoodle className="pointer-events-none absolute -right-20 -bottom-24 w-60 rotate-12 opacity-[0.1] lg:hidden" />
        <div className="relative flex flex-1 flex-col lg:flex-none">{children}</div>
      </main>
    </div>
  )
}
