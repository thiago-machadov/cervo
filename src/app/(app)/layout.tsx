import { Suspense } from "react"
import { BottomNav, BottomNavItems } from "@/components/bottom-nav"

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh bg-background lg:pl-60">
      {/* Celular: coluna estreita. Tablet: mais largo, menu embaixo. Desktop: menu lateral. */}
      <div className="mx-auto w-full max-w-md pb-[calc(5rem+env(safe-area-inset-bottom))] md:max-w-3xl md:px-6 lg:max-w-5xl lg:pb-10">
        {children}
      </div>
      <Suspense fallback={<BottomNavItems />}>
        <BottomNav />
      </Suspense>
    </div>
  )
}
