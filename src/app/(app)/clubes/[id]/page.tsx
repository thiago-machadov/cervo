import type { Metadata } from "next"
import Link from "next/link"
import { DownloadSimpleIcon, PencilSimpleIcon, TargetIcon, TrophyIcon, UsersIcon } from "@phosphor-icons/react/dist/ssr"
import { BookCover, ClubTile } from "@/components/book-cover"
import { BooksDoodle, EyeDoodle, FlameDoodle, StarDoodle } from "@/components/doodles"
import { CreateChallengeButton } from "@/components/challenge-form"
import { ClubChallenges } from "@/components/club-challenges"
import { FeedList } from "@/components/feed-item"
import { InviteButton } from "@/components/invite-button"
import { WelcomeToast } from "@/components/welcome-toast"
import { JoinClubButton } from "@/components/join-club-button"
import { LeaveClubButton } from "@/components/leave-club-button"
import { PageHeader } from "@/components/page-header"
import { PageSuspense } from "@/components/page-suspense"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/auth"
import { canManageClub, clubMembersLabel, findClubHeir } from "@/lib/clubs"
import { getClubChallenges } from "@/lib/challenges"
import { dayKey, formatDate } from "@/lib/dates"
import { db } from "@/lib/db"
import { expectedPage, getClubDetail } from "@/lib/queries"
import { getSessionUserId } from "@/lib/session"
import { cn } from "@/lib/utils"

/** Título com o nome do clube, só para quem é membro (não vaza nomes de clubes privados). */
export async function generateMetadata({ params }: PageProps<"/clubes/[id]">): Promise<Metadata> {
  const { id } = await params
  const userId = await getSessionUserId()
  const club = userId ? await db.club.findFirst({ where: { id, members: { some: { userId } } }, select: { name: true } }) : null
  return { title: club?.name ?? "Clube" }
}

export default function ClubPage({ params, searchParams }: PageProps<"/clubes/[id]">) {
  return (
    <PageSuspense>
      <ClubContent params={params} searchParams={searchParams} />
    </PageSuspense>
  )
}

async function ClubContent({ params, searchParams }: PageProps<"/clubes/[id]">) {
  const { id } = await params
  const { convidar, bemvindo } = await searchParams
  const user = await getCurrentUser()
  const data = await getClubDetail(id, user.id)
  if (!data) return <ClubOutside clubId={id} />

  const { club, ranking, feed, freeReading, myWeekPages } = data
  const myRole = club.members.find((m) => m.userId === user.id)?.role ?? null
  const isOwner = myRole === "OWNER"
  const canManage = canManageClub(myRole)
  const [heir, challenges] = await Promise.all([
    isOwner ? findClubHeir(club.id, user.id) : null,
    getClubChallenges(
      club.id,
      club.members.map((m) => ({ userId: m.userId, name: m.user.name }))
    ),
  ])
  const target = expectedPage(club)
  const me = ranking.find((r) => r.user.id === user.id)

  return (
    <main className="md:mx-auto md:max-w-2xl lg:max-w-none">
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

      {/* Desktop: informações e ações à esquerda, ranking e feed à direita. */}
      {bemvindo === "1" && <WelcomeToast title={`Você entrou no ${club.name}!`} description="Faça um check-in para aparecer no ranking." />}
      {club.members.length === 1 && canManage && convidar !== "1" && (
        <div className="mx-4 mt-2 space-y-3 rounded-2xl bg-secondary p-4 text-secondary-foreground">
          <p className="font-semibold">Clube pronto! Agora convide quem vai ler com você.</p>
          <p className="text-sm">Clube do livro fica melhor com companhia: mande o link no grupo dos amigos.</p>
          <InviteButton clubId={club.id} clubName={club.name} />
        </div>
      )}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start lg:gap-4">
        <div>
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-3">
              <ClubTile name={club.name} className="w-14" />
              <p className="text-sm text-muted-foreground">
                {club.description ?? `${club.members.length} ${club.members.length === 1 ? "leitor" : "leitores"} no clube`}
              </p>
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
                  <div
                    className="h-2 overflow-hidden rounded-full bg-card"
                    role="progressbar"
                    aria-label="Progresso na meta semanal do clube"
                    aria-valuemin={0}
                    aria-valuemax={club.weeklyPages}
                    aria-valuenow={Math.min(myWeekPages, club.weeklyPages)}
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.min(100, (myWeekPages / club.weeklyPages) * 100)}%`,
                      }}
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
                {target !== null && me && <GoalProgress current={me.currentPage} target={target} total={club.book.totalPages} />}
              </div>
            )}

            {(challenges.length > 0 || canManage) && (
              <section className="space-y-2">
                <h2 className="flex items-center gap-2 text-base font-bold">
                  <TrophyIcon className="size-5 text-primary" weight="fill" /> Desafios
                </h2>
                {challenges.length > 0 && <ClubChallenges challenges={challenges} viewerId={user.id} canManage={canManage} />}
                {canManage && <CreateChallengeButton clubId={club.id} today={dayKey()} />}
              </section>
            )}

            <div className="flex gap-2">
              {club.maxMembers !== null && club.members.length >= club.maxMembers ? (
                <p className="flex h-10 flex-1 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                  Clube lotado
                </p>
              ) : (
                <InviteButton clubId={club.id} clubName={club.name} defaultOpen={convidar === "1"} />
              )}
              <Button variant="outline" className="h-10 flex-1" render={<Link href={`/clubes/${club.id}/membros`} />} nativeButton={false}>
                <UsersIcon /> Membros
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:pt-4">
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
                          {freeReading ? row.currentBook && ` · lendo ${row.currentBook}` : club.book && ` · ${percent}% do livro`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl font-bold text-primary tabular-nums">{row.pages}</p>
                        <p className="text-[0.65rem] text-muted-foreground">págs.</p>
                      </div>
                      {row.streak > 0 && (
                        <span
                          aria-label={`Sequência de ${row.streak} ${row.streak === 1 ? "dia" : "dias"}`}
                          className="flex items-center gap-0.5 rounded-full bg-secondary px-1.5 py-0.5 text-xs font-semibold text-primary"
                        >
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
              {canManage && (
                <div className="px-4">
                  {/* Download de arquivo: <a> normal, não <Link>. */}
                  <Button
                    variant="outline"
                    className="h-10 w-full"
                    render={<a href={`/clubes/${club.id}/ranking`} download />}
                    nativeButton={false}
                  >
                    <DownloadSimpleIcon /> Exportar ranking (CSV)
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="feed">
              {feed.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-4 py-8 text-center text-sm text-muted-foreground">
                  <EyeDoodle className="w-24" />
                  {freeReading
                    ? "Ninguém do clube fez check-in ainda. Seja o primeiro!"
                    : "Ninguém fez check-in neste livro ainda. Seja o primeiro!"}
                </div>
              ) : (
                <FeedList items={feed} viewerId={user.id} />
              )}
            </TabsContent>
          </Tabs>
          {/* Sair fica no fim, longe das ações do dia a dia (evita toque acidental ao rolar). */}
          <div className="p-4">
            <LeaveClubButton clubId={club.id} isOwner={isOwner} heirName={heir?.user.name ?? null} />
          </div>
        </div>
      </div>
    </main>
  )
}

function GoalProgress({ current, target, total }: { current: number; target: number; total: number }) {
  const diff = current - target
  return (
    <div className="space-y-2">
      <div
        className="relative h-2 rounded-full bg-card"
        role="progressbar"
        aria-label="Progresso no livro do clube"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${(current / total) * 100}%` }} />
        <div className="absolute -top-1 h-4 w-1 rounded-full bg-foreground" style={{ left: `${(target / total) * 100}%` }} aria-hidden />
      </div>
      <p className="text-xs">
        Você está na pág. {current}. O ritmo da meta pede a pág. {target} hoje
        {diff >= 0 ? " — você está em dia! ✅" : ` — faltam ${-diff} páginas.`}
      </p>
    </div>
  )
}

/**
 * Quem não é membro: clube público mostra uma prévia com "Entrar"; privado (ou apagado)
 * explica o motivo e oferece caminhos, em vez de uma "página perdida" genérica.
 */
async function ClubOutside({ clubId }: { clubId: string }) {
  const club = await db.club.findUnique({
    where: { id: clubId },
    select: {
      id: true,
      name: true,
      description: true,
      visibility: true,
      maxMembers: true,
      readingMode: true,
      book: { select: { title: true, author: true, coverUrl: true } },
      _count: { select: { members: true } },
    },
  })

  if (club?.visibility === "PUBLIC") {
    const full = club.maxMembers !== null && club._count.members >= club.maxMembers
    return (
      <main className="md:mx-auto md:max-w-2xl">
        <PageHeader
          title={club.name}
          subtitle={clubMembersLabel(club._count.members, club.maxMembers, club.visibility)}
          backHref="/clubes/explorar"
        />
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-3">
            <ClubTile name={club.name} className="w-14" />
            <p className="text-sm text-muted-foreground">{club.description ?? "Clube público do Cervo."}</p>
          </div>
          {club.readingMode === "FREE" ? (
            <p className="rounded-2xl bg-card p-4 text-sm ring-1 ring-border/60">Leitura livre: cada um lê o livro que quiser.</p>
          ) : club.book ? (
            <div className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-border/60">
              <BookCover title={club.book.title} coverUrl={club.book.coverUrl} className="w-14" />
              <div className="min-w-0">
                <p className="text-[0.7rem] font-semibold tracking-widest text-primary uppercase">Lendo agora</p>
                <p className="font-bold">{club.book.title}</p>
                <p className="text-sm text-muted-foreground">{club.book.author}</p>
              </div>
            </div>
          ) : null}
          {full ? (
            <p className="rounded-2xl bg-muted p-4 text-center text-sm text-muted-foreground">Este clube está lotado.</p>
          ) : (
            <div className="flex justify-center">
              <JoinClubButton clubId={club.id} />
            </div>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <EyeDoodle className="w-28" />
      <h1 className="font-display text-3xl font-bold text-primary uppercase">Clube fora do seu alcance</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Você não faz parte deste clube, ou ele foi apagado. Clubes privados só aceitam quem tem um link de convite.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button className="h-11" render={<Link href="/clubes" />} nativeButton={false}>
          Ver meus clubes
        </Button>
        <Button variant="ghost" className="h-11" render={<Link href="/clubes/explorar" />} nativeButton={false}>
          Explorar clubes públicos
        </Button>
      </div>
    </main>
  )
}
