import { Suspense } from "react"
import { AccentSync } from "@/components/accent-sync"
import { BottomNav, BottomNavItems } from "@/components/bottom-nav"
import { isAccent } from "@/lib/accents"
import { getSessionUserId } from "@/lib/session"
import { db } from "@/lib/db"
import { isPro } from "@/lib/plan"

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
      <Suspense>
        <UserAccent />
      </Suspense>
    </div>
  )
}

/** Cor do app da conta (só vale enquanto for Pro). */
async function UserAccent() {
  const userId = await getSessionUserId()
  if (!userId) return null
  const user = await db.user.findUnique({ where: { id: userId }, select: { accent: true } })
  const accent = user?.accent && isAccent(user.accent) && (await isPro(userId)) ? user.accent : null
  return <AccentSync accent={accent} />
}
