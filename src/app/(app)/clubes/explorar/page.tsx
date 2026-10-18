import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"
import { ClubTile } from "@/components/book-cover"
import { DoodleEmpty } from "@/components/doodle-empty"
import { EyeDoodle } from "@/components/doodles"
import { JoinClubButton } from "@/components/join-club-button"
import { PageHeader } from "@/components/page-header"
import { PageSkeleton } from "@/components/page-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCurrentUser } from "@/lib/auth"
import { clubMembersLabel } from "@/lib/clubs"
import { searchPublicClubs, type ClubSearch } from "@/lib/queries"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Explorar clubes" }

export default function ExploreClubsPage({ searchParams }: PageProps<"/clubes/explorar">) {
  return (
    <main>
      <PageHeader title="Explorar clubes" backHref="/clubes" />
      <Suspense fallback={<PageSkeleton />}>
        <ExploreContent searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

/** Monta a URL preservando os filtros atuais e trocando só o que mudou. */
function hrefWith(current: ClubSearch, change: Partial<ClubSearch>) {
  const next = { ...current, ...change }
  const params = new URLSearchParams()
  if (next.q) params.set("q", next.q)
  if (next.vagas) params.set("vagas", "1")
  if (next.ordem && next.ordem !== "membros") params.set("ordem", next.ordem)
  const query = params.toString()
  return `/clubes/explorar${query ? `?${query}` : ""}`
}

async function ExploreContent({ searchParams }: Pick<PageProps<"/clubes/explorar">, "searchParams">) {
  const params = await searchParams
  const filters: ClubSearch = {
    q: first(params.q)?.slice(0, 80),
    vagas: first(params.vagas) === "1",
    ordem: first(params.ordem) === "recentes" ? "recentes" : "membros",
  }
  const user = await getCurrentUser()
  const clubs = await searchPublicClubs(filters, user.id)

  const chips = [
    { label: "Mais membros", active: filters.ordem === "membros", href: hrefWith(filters, { ordem: "membros" }) },
    { label: "Mais recentes", active: filters.ordem === "recentes", href: hrefWith(filters, { ordem: "recentes" }) },
    { label: "Com vagas", active: Boolean(filters.vagas), href: hrefWith(filters, { vagas: !filters.vagas }) },
  ]

  return (
    <div className="space-y-4 pt-2">
      <form action="/clubes/explorar" className="px-4">
        {filters.vagas && <input type="hidden" name="vagas" value="1" />}
        {filters.ordem === "recentes" && <input type="hidden" name="ordem" value="recentes" />}
        <label className="flex items-center gap-2 rounded-full bg-card pr-1 pl-4 ring-1 ring-border focus-within:ring-2 focus-within:ring-primary">
          <MagnifyingGlassIcon className="size-5 text-muted-foreground" />
          <Input
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Clube, livro ou autor"
            aria-label="Buscar clubes"
            className="h-12 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <Button type="submit" size="sm" className="h-10 px-4">
            Buscar
          </Button>
        </label>
      </form>

      <nav aria-label="Filtros" className="no-scrollbar flex gap-2 overflow-x-auto px-4">
        {chips.map((chip) => (
          <Link
            key={chip.label}
            href={chip.href}
            aria-current={chip.active ? "true" : undefined}
            className={cn(
              "shrink-0 rounded-full bg-card px-4 py-2 text-sm font-medium ring-1 ring-border transition-colors",
              chip.active && "bg-primary text-primary-foreground ring-primary"
            )}
          >
            {chip.label}
          </Link>
        ))}
      </nav>

      {clubs.length === 0 ? (
        <DoodleEmpty
          doodle={<EyeDoodle className="w-28" />}
          title="Nenhum clube encontrado"
          description={
            filters.q
              ? "Tente outro nome, livro ou autor, ou tire o filtro de vagas."
              : "Ainda não há clubes públicos. Que tal criar o primeiro?"
          }
          action={
            <Button render={<Link href="/clubes/novo" />} nativeButton={false}>
              Criar clube
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3 px-4 pb-4">
          {clubs.map((club) => (
            <li key={club.id} className="flex items-center gap-4 rounded-2xl bg-card p-3 ring-1 ring-border/60">
              <ClubTile name={club.name} className="w-14" />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-display line-clamp-2 text-base font-bold text-primary">{club.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {club.readingMode === "FREE"
                    ? "Leitura livre: cada um lê o seu"
                    : club.book
                      ? `Lendo ${club.book.title}`
                      : (club.description ?? "Sem livro definido")}
                </p>
                <p className="text-xs text-muted-foreground">{clubMembersLabel(club.memberCount, club.maxMembers)}</p>
              </div>
              {club.isMember ? (
                <Button size="sm" variant="outline" render={<Link href={`/clubes/${club.id}`} />} nativeButton={false}>
                  Abrir
                </Button>
              ) : club.isFull ? (
                <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">Lotado</span>
              ) : (
                <JoinClubButton clubId={club.id} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
