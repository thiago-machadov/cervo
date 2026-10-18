import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PencilIcon, TargetIcon } from "lucide-react"
import { BookCover } from "@/components/book-cover"
import { EyeDoodle, FlameDoodle, StarDoodle } from "@/components/doodles"
import { FeedList } from "@/components/feed-item"
import { InviteButton } from "@/components/invite-button"
import { LeaveClubButton } from "@/components/leave-club-button"
import { PageHeader } from "@/components/page-header"
import { PageSkeleton } from "@/components/page-skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/auth"
import { formatDate } from "@/lib/dates"
import { expectedPage, getClubDetail } from "@/lib/queries"
import { cn } from "@/lib/utils"

export default function ClubPage({ params }: PageProps<"/clubes/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ClubContent params={params} />
    </Suspense>
  )
}

async function ClubContent({ params }: Pick<PageProps<"/clubes/[id]">, "params">) {
  const { id } = await params
  const user = await getCurrentUser()
  const data = await getClubDetail(id, user.id)
  if (!data) notFound()

  const { club, ranking, feed } = data
  const isOwner = club.ownerId === user.id
  const target = expectedPage(club)
  const me = ranking.find((r) => r.user.id === user.id)

  return (
    <main>
      <PageHeader
        title={club.name}
        subtitle={`${club.members.length} ${club.members.length === 1 ? "membro" : "membros"}`}
        backHref="/clubes"
        action={
          isOwner && (
            <Button variant="ghost" size="icon-lg" render={<Link href={`/clubes/${club.id}/editar`} />} nativeButton={false}>
              <PencilIcon />
              <span className="sr-only">Editar clube</span>
            </Button>
          )
        }
      />

      <div className="space-y-4 p-4">
        {club.description && <p className="text-sm text-muted-foreground">{club.description}</p>}

        {club.book ? (
          <div className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-border/60">
            <BookCover title={club.book.title} coverUrl={club.book.coverUrl} className="w-16" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[0.7rem] font-semibold tracking-widest text-primary uppercase">Lendo agora</p>
              <p className="text-lg font-bold leading-snug">{club.book.title}</p>
              <p className="text-sm text-muted-foreground">{club.book.author}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-primary/30 p-4 text-sm text-muted-foreground">
            Nenhum livro definido.{" "}
            {isOwner && (
              <Link href={`/clubes/${club.id}/editar`} className="font-medium text-foreground underline underline-offset-4">
                Escolher livro
              </Link>
            )}
          </div>
        )}

        {club.book && (club.goalEndDate || club.weeklyPages) && (
          <div className="space-y-3 rounded-2xl bg-secondary p-4 text-secondary-foreground">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <TargetIcon className="size-4" /> Meta do clube
            </p>
            <ul className="space-y-1 text-sm">
              {club.goalEndDate && <li>Terminar até {formatDate(club.goalEndDate)}</li>}
              {club.weeklyPages && <li>{club.weeklyPages} páginas por semana</li>}
            </ul>
            {target !== null && me && (
              <GoalProgress current={me.currentPage} target={target} total={club.book.totalPages} />
            )}
          </div>
        )}

        <div className="flex gap-2">
          <InviteButton clubId={club.id} clubName={club.name} />
        </div>
      </div>

      <Tabs defaultValue="ranking" className="gap-4">
        <TabsList variant="pill" className="mx-4 w-[calc(100%-2rem)]">
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="feed">Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="ranking">
          <ol className="mx-4 divide-y divide-border/70 overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
            {ranking.map((row, index) => {
              const percent = club.book ? Math.round((row.currentPage / club.book.totalPages) * 100) : 0
              return (
                <li key={row.user.id} className={cn("flex items-center gap-3 px-4 py-3", row.user.id === user.id && "bg-secondary/60")}>
                  <span className="w-5 text-center text-sm font-semibold tabular-nums text-muted-foreground">
                    {index === 0 && row.pages > 0 ? <StarDoodle className="w-5" label="Primeiro lugar" /> : index + 1}
                  </span>
                  <UserAvatar name={row.user.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {row.user.name}
                      {row.user.id === user.id && <span className="text-muted-foreground"> (você)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.days} {row.days === 1 ? "dia" : "dias"} de check-in
                      {club.book && ` · ${percent}% do livro`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-bold text-primary tabular-nums">{row.pages}</p>
                    <p className="text-[0.65rem] text-muted-foreground">págs.</p>
                  </div>
                  {row.streak > 0 && (
                    <span className="flex items-center gap-0.5 rounded-full bg-secondary px-1.5 py-0.5 text-xs font-semibold text-primary">
                      <FlameDoodle className="w-3" />
                      {row.streak}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
          <p className="px-5 py-3 text-xs text-muted-foreground">
            Páginas lidas no livro do clube e dias com check-in desde que ele foi escolhido.
          </p>
        </TabsContent>

        <TabsContent value="feed">
          {feed.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-8 text-center text-sm text-muted-foreground">
              <EyeDoodle className="w-24" />
              Ninguém fez check-in neste livro ainda. Seja o primeiro!
            </div>
          ) : (
            <FeedList items={feed} />
          )}
        </TabsContent>
      </Tabs>

      <div className="p-4">
        <LeaveClubButton clubId={club.id} isOwner={isOwner} />
      </div>
    </main>
  )
}

function GoalProgress({ current, target, total }: { current: number; target: number; total: number }) {
  const diff = current - target
  return (
    <div className="space-y-2">
      <div className="relative h-2 rounded-full bg-card">
        <div className="h-full rounded-full bg-primary" style={{ width: `${(current / total) * 100}%` }} />
        <div
          className="absolute -top-1 h-4 w-1 rounded-full bg-foreground"
          style={{ left: `${(target / total) * 100}%` }}
          aria-hidden
        />
      </div>
      <p className="text-xs">
        Você está na pág. {current}. O ritmo da meta pede a pág. {target} hoje
        {diff >= 0 ? " — você está em dia! ✅" : ` — faltam ${-diff} páginas.`}
      </p>
    </div>
  )
}
