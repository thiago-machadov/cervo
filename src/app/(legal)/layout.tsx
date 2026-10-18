import Link from "next/link"
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr"
import { DeerDoodle } from "@/components/doodles"

/** Páginas legais: abrem logado ou não, sem a navegação do app. */
export default function LegalLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-background px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-[calc(env(safe-area-inset-bottom)+3rem)]">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 text-sm font-medium text-primary">
          <CaretLeftIcon className="size-4" /> Voltar ao app
        </Link>
        <DeerDoodle className="w-10" label="Cervo" />
      </header>
      {children}
    </main>
  )
}
