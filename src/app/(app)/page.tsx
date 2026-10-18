import { Suspense } from "react"
import Link from "next/link"
import { BookPlusIcon } from "lucide-react"
import { CheckInDrawer } from "@/components/check-in-drawer"
import { DoodleEmpty } from "@/components/doodle-empty"
import { BirdDoodle, CervoLogo, StarDoodle, SunDoodle } from "@/components/doodles"
import { ContinueReading } from "@/components/continue-reading"
import { FeedList } from "@/components/feed-item"
import { GoalCard } from "@/components/goal-card"
import { PageSkeleton } from "@/components/page-skeleton"
import { SectionHeader } from "@/components/section-header"
import { StreakCard } from "@/components/streak-card"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { APP_TIME_ZONE } from "@/lib/dates"
import { getCheckInOptions, getHomeFeed, getLibrary, getUserStats } from "@/lib/queries"

export default function TodayPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TodayContent />
    </Suspense>
  )
}

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hourCycle: "h23", timeZone: APP_TIME_ZONE }).format(new Date()))
  if (hour < 12) return { text: "Bom dia", night: false }
  if (hour < 18) return { text: "Boa tarde", night: false }
  return { text: "Boa noite", night: true }
}

async function TodayContent() {
  const user = await getCurrentUser()
  const [stats, options, feed, library] = await Promise.all([
    getUserStats(user.id),
    getCheckInOptions(user.id),
    getHomeFeed(user.id),
    getLibrary(user.id),
  ])
  const reading = library.filter((item) => item.status === "READING")
  const hello = greeting()

  return (
    <main className="space-y-6 pb-4">
      <header className="space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div className="flex items-center justify-between">
          <CervoLogo size="sm" />
          <Link href="/perfil" aria-label="Perfil">
            <UserAvatar name={user.name} className="size-10 ring-2 ring-card" />
          </Link>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight">
              {hello.text}, {user.name.split(" ")[0]}
            </h1>
            <p className="text-sm text-muted-foreground">Uma página por dia já conta.</p>
          </div>
          {hello.night ? <StarDoodle className="w-11" /> : <SunDoodle className="w-14" />}
        </div>
      </header>

      <div className="px-4">
        <StreakCard {...stats}>
          <CheckInDrawer
            options={options}
            goalType={user.goalType}
            trigger={
              <Button size="lg" className="relative h-12 w-full bg-primary-foreground text-base font-semibold text-primary hover:bg-primary-foreground/90">
                <BookPlusIcon className="size-5" /> Fazer check-in
              </Button>
            }
          />
        </StreakCard>
      </div>

      <div className="px-4">
        <GoalCard
          goalType={user.goalType}
          dailyGoal={user.dailyGoal}
          pagesToday={stats.pagesToday}
          minutesToday={stats.minutesToday}
        />
      </div>

      {reading.length > 0 && (
        <section>
          <SectionHeader title="Continue lendo" href="/biblioteca" />
          <ContinueReading items={reading} />
        </section>
      )}

      <section className="grid grid-cols-3 gap-3 px-4 text-center">
        <Stat label="Págs. na semana" value={stats.pagesThisWeek} />
        <Stat label="Dias lendo" value={stats.daysRead} />
        <Stat label="Livros lidos" value={stats.booksDone} />
      </section>

      <section>
        <SectionHeader title="Atividade dos seus clubes" href="/clubes" linkLabel="Clubes" />
        {feed.length === 0 ? (
          <DoodleEmpty
            doodle={<BirdDoodle className="w-40" />}
            title="Céu limpo por aqui"
            description="Faça um check-in ou entre num clube para ver a leitura dos seus amigos."
          />
        ) : (
          <FeedList items={feed} />
        )}
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
      <p className="font-display text-3xl font-bold text-primary tabular-nums">{value}</p>
      <p className="text-[0.7rem] leading-tight text-muted-foreground">{label}</p>
    </div>
  )
}
