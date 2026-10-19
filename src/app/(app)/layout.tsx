import type { Metadata } from "next"
import { Suspense } from "react"
import { BottomNav, BottomNavItems } from "@/components/bottom-nav"

// Telas da conta: não entram no Google (exceto /instalar, que libera na própria página).
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh bg-background md:pl-20 lg:pl-60">
      {/* Celular: coluna estreita e menu embaixo. Tablet: trilho lateral compacto. Desktop: menu lateral completo. */}
      <div className="mx-auto w-full max-w-md pb-[calc(5rem+env(safe-area-inset-bottom))] md:max-w-3xl md:px-6 md:pb-10 lg:max-w-5xl xl:max-w-6xl">
        {children}
      </div>
      <Suspense fallback={<BottomNavItems />}>
        <BottomNav />
      </Suspense>
    </div>
  )
}

