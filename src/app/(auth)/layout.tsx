import type { Metadata } from "next"
import { SpiralClusterDoodle } from "@/components/doodles"

// Login, cadastro e senha: o Google pode seguir os links, mas não lista estas telas.
export const metadata: Metadata = { robots: { index: false, follow: true } }

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden bg-background px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      <SpiralClusterDoodle className="pointer-events-none absolute -right-20 -bottom-24 w-60 rotate-12 opacity-[0.1]" />
      <div className="relative flex flex-1 flex-col">{children}</div>
    </main>
  )
}
