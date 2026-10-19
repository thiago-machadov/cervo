import type { Metadata } from "next"
import Link from "next/link"
import { CaretRightIcon, MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr"
import { ClubTile } from "@/components/book-cover"
import { DoodleEmpty } from "@/components/doodle-empty"
import { FlockDoodle } from "@/components/doodles"
import { PageHeader } from "@/components/page-header"
import { PageSuspense } from "@/components/page-suspense"
import { UserAvatar } from "@/components/user-avatar"
import { AvatarGroup } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { getUserClubs } from "@/lib/queries"

export const metadata: Metadata = { title: "Clubes" }

export default function ClubsPage() {
  return (
    <PageSuspense>
      <ClubsContent />
    </PageSuspense>
  )
}

async function ClubsContent() {
  const user = await getCurrentUser()
  const clubs = await getUserClubs(user.id)

  return (
    <main>
      <PageHeader
        title="Clubes"
        action={
          <div className="flex gap-2">
            <Button size="icon-sm" variant="outline" render={<Link href="/clubes/explorar" />} nativeButton={false}>
              <MagnifyingGlassIcon />
              <span className="sr-only">Explorar clubes públicos</span>
            </Button>
            <Button size="sm" render={<Link href="/clubes/novo" />} nativeButton={false}>
              <PlusIcon /> Novo
            </Button>
          </div>
        }
      />

      {clubs.length === 0 ? (
        <DoodleEmpty
          className="mt-2"
          doodle={<FlockDoodle className="w-40" />}
          title="Ninguém voando junto"
          description="Crie um clube, encontre um público para entrar ou peça um link de convite."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="lg" render={<Link href="/clubes/novo" />} nativeButton={false}>
                Criar clube
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/clubes/explorar" />} nativeButton={false}>
                Explorar públicos
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="grid gap-3 px-4 md:grid-cols-2">
          {clubs.map((club) => (
            <li key={club.id}>
              <Link href={`/clubes/${club.id}`} className="flex items-center gap-4 rounded-2xl bg-card p-3 ring-1 ring-border/60 transition-transform active:scale-[0.99]">
                <ClubTile name={club.name} className="w-16" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-display line-clamp-2 text-lg font-bold text-primary">{club.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {club.readingMode === "FREE" ? "Leitura livre" : club.book ? `Lendo ${club.book.title}` : "Sem livro definido"}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <AvatarGroup>
                      {club.members.map((m) => (
                        <UserAvatar key={m.user.id} name={m.user.name} className="size-6 text-[0.6rem]" />
                      ))}
                    </AvatarGroup>
                    <span className="text-xs text-muted-foreground">
                      {club._count.members} {club._count.members === 1 ? "membro" : "membros"}
                    </span>
                  </div>
                </div>
                <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
