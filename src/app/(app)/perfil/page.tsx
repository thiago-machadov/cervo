import type { Metadata } from "next"
import { Suspense } from "react"
import { LogOutIcon } from "lucide-react"
import { SpiralDoodle, ThreadDoodle } from "@/components/doodles"
import { EditGoalDrawer } from "@/components/edit-goal-drawer"
import { PageHeader } from "@/components/page-header"
import { PageSkeleton } from "@/components/page-skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/actions/auth"
import { getCurrentUser } from "@/lib/auth"
import { getUserStats } from "@/lib/queries"

export const metadata: Metadata = { title: "Perfil" }

export default function ProfilePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProfileContent />
    </Suspense>
  )
}

async function ProfileContent() {
  const user = await getCurrentUser()
  const stats = await getUserStats(user.id)

  const items = [
    { label: "Sequência atual", value: `${stats.current} ${stats.current === 1 ? "dia" : "dias"}` },
    { label: "Maior sequência", value: `${stats.longest} ${stats.longest === 1 ? "dia" : "dias"}` },
    { label: "Páginas lidas", value: stats.totalPages.toLocaleString("pt-BR") },
    { label: "Dias lendo", value: stats.daysRead },
    { label: "Livros lidos", value: stats.booksDone },
    { label: "Páginas nos últimos 7 dias", value: stats.pagesThisWeek },
  ]

  return (
    <main>
      <PageHeader title="Perfil" />
      <div className="space-y-6 px-4">
        <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl bg-card p-4 ring-1 ring-border/60">
          <SpiralDoodle seed={5} turns={7} className="pointer-events-none absolute -top-8 -right-8 w-32 opacity-15" />
          <UserAvatar name={user.name} className="size-16 text-lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <EditGoalDrawer goalType={user.goalType} dailyGoal={user.dailyGoal} />

        <dl className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.label} className="rounded-2xl bg-card p-4 ring-1 ring-border/60">
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className="font-display text-4xl font-bold text-primary tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>

        <ThreadDoodle className="mx-auto w-56 opacity-60" />

        <form action={signOut}>
          <Button type="submit" variant="outline" className="h-11 w-full">
            <LogOutIcon /> Sair
          </Button>
        </form>
      </div>
    </main>
  )
}
