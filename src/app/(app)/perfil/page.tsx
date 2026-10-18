import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { CaretRightIcon, ChatCircleDotsIcon, DeviceMobileIcon, SignOutIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react/lib"
import { SpiralDoodle, ThreadDoodle } from "@/components/doodles"
import { EditGoalDrawer } from "@/components/edit-goal-drawer"
import { SubmitButton } from "@/components/submit-button"
import { ThemeSelector } from "@/components/theme-selector"
import { PageHeader } from "@/components/page-header"
import { PageSkeleton } from "@/components/page-skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { signOut } from "@/app/actions/auth"
import { getCurrentUser } from "@/lib/auth"
import { getUserStats } from "@/lib/queries"

export const metadata: Metadata = { title: "Perfil" }

const LINKS: { href: string; icon: Icon; title: string; description: string }[] = [
  { href: "/amigos", icon: UsersThreeIcon, title: "Amigos", description: "Pedidos de amizade e seu link para convidar" },
  { href: "/feedback", icon: ChatCircleDotsIcon, title: "Mandar feedback", description: "Bugs, ideias e elogios sobre o app" },
  { href: "/instalar", icon: DeviceMobileIcon, title: "Instalar o app", description: "Passo a passo para iPhone e Android" },
]

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
    <main className="md:mx-auto md:max-w-2xl">
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

        <ThemeSelector />

        <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.label} className="rounded-2xl bg-card p-4 ring-1 ring-border/60">
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className="font-display text-3xl font-bold text-primary tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>

        <nav className="space-y-3">
          {LINKS.map(({ href, icon: LinkIcon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/60 transition-transform active:scale-[0.99]"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
                <LinkIcon className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{title}</span>
                <span className="block text-xs text-muted-foreground">{description}</span>
              </span>
              <CaretRightIcon className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </nav>

        <ThreadDoodle className="mx-auto w-56 opacity-60" />

        <form action={signOut}>
          <SubmitButton variant="outline" className="h-11 w-full" pendingText="Saindo…">
            <SignOutIcon /> Sair
          </SubmitButton>
        </form>
      </div>
    </main>
  )
}
