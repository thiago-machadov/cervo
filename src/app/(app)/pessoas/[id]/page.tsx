import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { LockSimpleIcon } from "@phosphor-icons/react/dist/ssr"
import { SpiralDoodle } from "@/components/doodles"
import { FeedList } from "@/components/feed-item"
import { FriendButton } from "@/components/friend-button"
import { PageHeader } from "@/components/page-header"
import { PageSkeleton } from "@/components/page-skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { getCurrentUser } from "@/lib/auth"
import { getFriendState } from "@/lib/friends"
import { getPersonProfile } from "@/lib/queries"

export const metadata: Metadata = { title: "Leitor" }

export default function PersonPage({ params }: PageProps<"/pessoas/[id]">) {
  return (
    <main className="md:mx-auto md:max-w-2xl">
      <PageHeader title="Leitor" backHref="/amigos" />
      <Suspense fallback={<PageSkeleton />}>
        <PersonContent params={params} />
      </Suspense>
    </main>
  )
}

async function PersonContent({ params }: Pick<PageProps<"/pessoas/[id]">, "params">) {
  const { id } = await params
  const user = await getCurrentUser()
  const [profile, friendState] = await Promise.all([getPersonProfile(user.id, id), getFriendState(user.id, id)])
  if (!profile || !profile.person.onboardedAt) notFound()

  const { person, stats, checkIns, canSeeActivity } = profile
  const isSelf = friendState.kind === "self"
  const items = stats
    ? [
        { label: "Sequência", value: stats.current },
        { label: "Páginas", value: stats.totalPages.toLocaleString("pt-BR") },
        { label: "Livros lidos", value: stats.booksDone },
      ]
    : []

  return (
    <div className="space-y-6 pb-8">
      <div className="mx-4 space-y-4">
        <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl bg-card p-4 ring-1 ring-border/60">
          <SpiralDoodle seed={7} turns={7} className="pointer-events-none absolute -top-8 -right-8 w-32 opacity-15" />
          <UserAvatar name={person.name} className="size-16 text-lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{person.name}</p>
            <p className="text-sm text-muted-foreground">
              {isSelf
                ? "Este é você"
                : friendState.kind === "friends"
                  ? "Vocês são amigos"
                  : friendState.kind === "received"
                    ? "Quer ser seu amigo"
                    : friendState.kind === "sent"
                      ? "Pedido enviado"
                      : "Leitor do Cervo"}
            </p>
          </div>
        </div>

        <FriendButton targetId={person.id} state={friendState} className="w-full" />

        {items.length > 0 && (
          <dl className="grid grid-cols-3 gap-3">
            {items.map((item) => (
              <div key={item.label} className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
                <dt className="text-xs text-muted-foreground">{item.label}</dt>
                <dd className="font-display text-2xl font-bold text-primary tabular-nums">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {canSeeActivity ? (
        <section className="space-y-3">
          <h2 className="px-4 text-base font-bold">Leituras recentes</h2>
          {checkIns.length === 0 ? (
            <p className="px-4 text-sm text-muted-foreground">Nenhum check-in ainda.</p>
          ) : (
            <FeedList items={checkIns} viewerId={user.id} />
          )}
        </section>
      ) : (
        <p className="mx-4 flex items-center gap-2 rounded-2xl border border-dashed border-primary/30 p-4 text-sm text-muted-foreground">
          <LockSimpleIcon className="size-5 shrink-0" />
          As leituras de {person.name.split(" ")[0]} aparecem aqui e no seu feed quando vocês forem amigos.
        </p>
      )}
    </div>
  )
}
