import { Suspense } from "react"
import { BottomNav, BottomNavItems } from "@/components/bottom-nav"

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-background pb-[calc(5rem+env(safe-area-inset-bottom))]">
      {children}
      <Suspense fallback={<BottomNavItems />}>
        <BottomNav />
      </Suspense>
    </div>
  )
}
