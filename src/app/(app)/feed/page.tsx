import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { DoodleEmpty } from "@/components/doodle-empty"
import { BirdDoodle } from "@/components/doodles"
import { FeedList } from "@/components/feed-item"
import { PageHeader } from "@/components/page-header"
import { PageSuspense } from "@/components/page-suspense"
import { Button } from "@/components/ui/button"
import { UsersThreeIcon } from "@phosphor-icons/react/dist/ssr"
import { getCurrentUser } from "@/lib/auth"
import { countPendingRequests } from "@/lib/friends"
import { getHomeFeed, getUserClubs } from "@/lib/queries"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Feed" }

export default function FeedPage({ searchParams }: PageProps<"/feed">) {
  return (
    <main>
      <PageHeader
        title="Feed"
        subtitle="O que seus clubes e amigos estão lendo"
        action={
          <Suspense fallback={<FriendsLink pending={0} />}>
            <FriendsLinkWithCount />
          </Suspense>
        }
      />
      <PageSuspense>
        <FeedContent searchParams={searchParams} />
      </PageSuspense>
    </main>
  )
}

function FriendsLink({ pending }: { pending: number }) {
  return (
    <Button
      variant="outline"
      size="icon-lg"
      className="relative size-11 rounded-full"
      render={<Link href="/amigos" aria-label={pending > 0 ? `Amigos (${pending} pedidos novos)` : "Amigos"} />}
      nativeButton={false}
    >
      <UsersThreeIcon className="size-5" />
      {pending > 0 && (
        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[0.65rem] font-bold text-primary-foreground">
          {pending > 9 ? "9+" : pending}
        </span>
      )}
    </Button>
  )
}

async function FriendsLinkWithCount() {
  const user = await getCurrentUser()
  return <FriendsLink pending={await countPendingRequests(user.id)} />
}

async function FeedContent({ searchParams }: Pick<PageProps<"/feed">, "searchParams">) {
  const { clube } = await searchParams
  const user = await getCurrentUser()
  // Em paralelo: o getHomeFeed já só devolve check-ins de clubes de que o usuário participa.
  const requested = typeof clube === "string" ? clube : undefined
  const [clubs, feed] = await Promise.all([getUserClubs(user.id), getHomeFeed(user.id, requested)])
  const clubId = requested && clubs.some((c) => c.id === requested) ? requested : undefined

  const chips = [{ id: undefined, name: "Todos" }, ...clubs.map((c) => ({ id: c.id, name: c.name }))]

  return (
    <div className="space-y-4 pb-4">
      {clubs.length > 0 && (
        <nav aria-label="Filtrar por clube" className="no-scrollbar flex gap-2 overflow-x-auto px-4">
          {chips.map((chip) => {
            const active = chip.id === clubId
            return (
              <Link
                key={chip.id ?? "todos"}
                href={chip.id ? `/feed?clube=${chip.id}` : "/feed"}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "max-w-[12rem] shrink-0 truncate rounded-full bg-card px-4 py-2 text-sm font-medium ring-1 ring-border transition-colors",
                  active && "bg-primary text-primary-foreground ring-primary"
                )}
              >
                {chip.name}
              </Link>
            )
          })}
        </nav>
      )}

      {feed.length === 0 ? (
        <DoodleEmpty
          doodle={<BirdDoodle className="w-40" />}
          title="Céu limpo por aqui"
          description={
            clubs.length === 0
              ? "Entre num clube ou adicione amigos para ver a leitura deles aqui."
              : "Ninguém fez check-in ainda. Que tal ser o primeiro?"
          }
          action={
            clubs.length === 0 ? (
              <div className="flex flex-wrap justify-center gap-2">
                <Button render={<Link href="/clubes/explorar" />} nativeButton={false}>
                  Explorar clubes
                </Button>
                <Button variant="outline" render={<Link href="/amigos" />} nativeButton={false}>
                  Adicionar amigos
                </Button>
              </div>
            ) : undefined
          }
        />
      ) : (
        <FeedList items={feed} viewerId={user.id} />
      )}
    </div>
  )
}
