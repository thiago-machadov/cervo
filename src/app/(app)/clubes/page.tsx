import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { ChevronRightIcon, PlusIcon } from "lucide-react"
import { BookCover } from "@/components/book-cover"
import { DoodleEmpty } from "@/components/doodle-empty"
import { FlockDoodle } from "@/components/doodles"
import { PageHeader } from "@/components/page-header"
import { PageSkeleton } from "@/components/page-skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { AvatarGroup } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { getUserClubs } from "@/lib/queries"

export const metadata: Metadata = { title: "Clubes" }

export default function ClubsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ClubsContent />
    </Suspense>
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
          <Button size="sm" render={<Link href="/clubes/novo" />} nativeButton={false}>
            <PlusIcon /> Novo
          </Button>
        }
      />

      {clubs.length === 0 ? (
        <DoodleEmpty
          className="mt-2"
          doodle={<FlockDoodle className="w-40" />}
          title="Ninguém voando junto"
          description="Crie um clube e convide amigos para ler junto, ou peça um link de convite."
          action={
            <Button size="lg" render={<Link href="/clubes/novo" />} nativeButton={false}>
              Criar clube
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3 px-4">
          {clubs.map((club) => (
            <li key={club.id}>
              <Link href={`/clubes/${club.id}`} className="flex items-center gap-4 rounded-2xl bg-card p-3 ring-1 ring-border/60 transition-transform active:scale-[0.99]">
                {club.book ? (
                  <BookCover title={club.book.title} coverUrl={club.book.coverUrl} className="w-16" />
                ) : (
                  <div className="halftone aspect-[2/3] w-16 shrink-0 rounded-lg bg-secondary text-primary/30" />
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-display truncate text-2xl font-bold text-primary">{club.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {club.book ? `Lendo ${club.book.title}` : "Sem livro definido"}
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
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
