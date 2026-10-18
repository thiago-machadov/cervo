import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { DownloadSimpleIcon, LockSimpleIcon, PencilSimpleIcon, TargetIcon, TrophyIcon, UsersIcon } from "@phosphor-icons/react/dist/ssr"
import { BookCover, ClubTile } from "@/components/book-cover"
import { BooksDoodle, EyeDoodle, FlameDoodle, StarDoodle } from "@/components/doodles"
import { CreateChallengeButton } from "@/components/challenge-form"
import { ClubChallenges } from "@/components/club-challenges"
import { FeedList } from "@/components/feed-item"
import { InviteButton } from "@/components/invite-button"
import { LeaveClubButton } from "@/components/leave-club-button"
import { PageHeader } from "@/components/page-header"
import { PageSkeleton } from "@/components/page-skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/auth"
import { canManageClub, clubMembersLabel, findClubHeir } from "@/lib/clubs"
import { getClubChallenges } from "@/lib/challenges"
import { dayKey, formatDate } from "@/lib/dates"
import { isPro } from "@/lib/plan"
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

  const { club, ranking, feed, freeReading, myWeekPages } = data
  const myRole = club.members.find((m) => m.userId === user.id)?.role ?? null
  const isOwner = myRole === "OWNER"
  const canManage = canManageClub(myRole)
  const [heir, ownerIsPro, challenges] = await Promise.all([
    isOwner ? findClubHeir(club.id, user.id) : null,
    isPro(club.ownerId),
    getClubChallenges(
      club.id,
      club.members.map((m) => ({ userId: m.userId, name: m.user.name }))
    ),
  ])
  const target = expectedPage(club)
  const me = ranking.find((r) => r.user.id === user.id)

  return (
    <main className="md:mx-auto md:max-w-2xl">
      <PageHeader
        title={club.name}
        subtitle={clubMembersLabel(club.members.length, club.maxMembers, club.visibility)}
        backHref="/clubes"
        action={
          canManage && (
            <Button variant="ghost" size="icon-lg" render={<Link href={`/clubes/${club.id}/editar`} />} nativeButton={false}>
              <PencilSimpleIcon />
              <span className="sr-only">Editar clube</span>
            </Button>
          )
        }
      />

      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <ClubTile name={club.name} className="w-14" />
          <p className="text-sm text-muted-foreground">{club.description ?? `${club.members.length} ${club.members.length === 1 ? "leitor" : "leitores"} no clube`}</p>
        </div>

        {freeReading ? (
          <div className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-border/60">
            <BooksDoodle className="w-16" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[0.7rem] font-semibold tracking-widest text-primary uppercase">Leitura livre</p>
              <p className="text-lg font-bold leading-snug">Cada um lê o seu livro</p>
              <p className="text-sm text-muted-foreground">O ranking soma as páginas de qualquer livro.</p>
            </div>
          </div>
        ) : club.book ? (
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
            {canManage && (
              <Link href={`/clubes/${club.id}/editar`} className="font-medium text-foreground underline underline-offset-4">
                Escolher livro
              </Link>
            )}
          </div>
        )}

        {freeReading && club.weeklyPages && (
          <div className="space-y-3 rounded-2xl bg-secondary p-4 text-secondary-foreground">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <TargetIcon className="size-4" /> Meta do clube
            </p>
            <p className="text-sm">{club.weeklyPages} páginas por semana, em qualquer livro</p>
            <div className="space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-card">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, (myWeekPages / club.weeklyPages) * 100)}%` }}
                />
              </div>
              <p className="text-xs">
                Você leu {myWeekPages} páginas nos últimos 7 dias
                {myWeekPages >= club.weeklyPages ? " — meta batida! ✅" : ` — faltam ${club.weeklyPages - myWeekPages}.`}
              </p>
            </div>
          </div>
        )}

        {!freeReading && club.book && (club.goalEndDate || club.weeklyPages) && (
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

        {(challenges.length > 0 || canManage) && (
          <section className="space-y-2">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <TrophyIcon className="size-5 text-primary" weight="fill" /> Desafios
            </h2>
            {challenges.length > 0 && <ClubChallenges challenges={challenges} viewerId={user.id} canManage={canManage} />}
            {canManage &&
              (ownerIsPro ? (
                <CreateChallengeButton clubId={club.id} today={dayKey()} />
              ) : (
                <Link
                  href="/assinatura"
                  className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/30 p-4 text-sm text-muted-foreground"
                >
                  <LockSimpleIcon className="size-5 shrink-0 text-primary" weight="fill" />
                  <span>
                    {isOwner
                      ? "Crie desafios para o clube (ex.: ler 25 dias em 30) com o Cervo Pro."
                      : "Desafios ficam disponíveis quando o dono do clube for Pro."}
                  </span>
                </Link>
              ))}
          </section>
        )}

        <div className="flex gap-2">
          {club.maxMembers !== null && club.members.length >= club.maxMembers ? (
            <p className="flex h-10 flex-1 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
              Clube lotado
            </p>
          ) : (
            <InviteButton clubId={club.id} clubName={club.name} />
          )}
          <Button variant="outline" className="h-10 flex-1" render={<Link href={`/clubes/${club.id}/membros`} />} nativeButton={false}>
            <UsersIcon /> Membros
          </Button>
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
                  <Link href={`/pessoas/${row.user.id}`} aria-label={`Perfil de ${row.user.name}`} className="shrink-0">
                    <UserAvatar name={row.user.name} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/pessoas/${row.user.id}`} className="block truncate text-sm font-medium">
                      {row.user.name}
                      {row.user.id === user.id && <span className="text-muted-foreground"> (você)</span>}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {row.days} {row.days === 1 ? "dia" : "dias"} de check-in
                      {freeReading
                        ? row.currentBook && ` · lendo ${row.currentBook}`
                        : club.book && ` · ${percent}% do livro`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold text-primary tabular-nums">{row.pages}</p>
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
            {freeReading
              ? "Páginas lidas em qualquer livro e dias com check-in desde que o clube entrou na leitura livre."
              : "Páginas lidas no livro do clube e dias com check-in desde que ele foi escolhido."}
          </p>
          {canManage && ownerIsPro && (
            <div className="px-4">
              {/* Download de arquivo: <a> normal, não <Link>. */}
              <Button variant="outline" className="h-10 w-full" render={<a href={`/clubes/${club.id}/ranking`} download />} nativeButton={false}>
                <DownloadSimpleIcon /> Exportar ranking (CSV)
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="feed">
          {feed.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-8 text-center text-sm text-muted-foreground">
              <EyeDoodle className="w-24" />
              {freeReading ? "Ninguém do clube fez check-in ainda. Seja o primeiro!" : "Ninguém fez check-in neste livro ainda. Seja o primeiro!"}
            </div>
          ) : (
            <FeedList items={feed} viewerId={user.id} />
          )}
        </TabsContent>
      </Tabs>

      <div className="p-4">
        <LeaveClubButton clubId={club.id} isOwner={isOwner} heirName={heir?.user.name ?? null} />
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
