import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { DoodleEmpty } from "@/components/doodle-empty"
import { BirdDoodle } from "@/components/doodles"
import { FeedList } from "@/components/feed-item"
import { PageHeader } from "@/components/page-header"
import { PageSkeleton } from "@/components/page-skeleton"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { getHomeFeed, getUserClubs } from "@/lib/queries"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Feed" }

export default function FeedPage({ searchParams }: PageProps<"/feed">) {
  return (
    <main>
      <PageHeader title="Feed" subtitle="O que seus clubes estão lendo" />
      <Suspense fallback={<PageSkeleton />}>
        <FeedContent searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function FeedContent({ searchParams }: Pick<PageProps<"/feed">, "searchParams">) {
  const { clube } = await searchParams
  const user = await getCurrentUser()
  const clubs = await getUserClubs(user.id)
  const clubId = typeof clube === "string" && clubs.some((c) => c.id === clube) ? clube : undefined
  const feed = await getHomeFeed(user.id, clubId)

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
              ? "Entre num clube para ver a leitura dos seus amigos aqui."
              : "Ninguém fez check-in ainda. Que tal ser o primeiro?"
          }
          action={
            clubs.length === 0 ? (
              <Button render={<Link href="/clubes/explorar" />} nativeButton={false}>
                Explorar clubes
              </Button>
            ) : undefined
          }
        />
      ) : (
        <FeedList items={feed} viewerId={user.id} />
      )}
    </div>
  )
}
