import type { Metadata } from "next"
import Link from "next/link"
import { CheckIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"
import { ClubTile } from "@/components/book-cover"
import { DoodleEmpty } from "@/components/doodle-empty"
import { EyeDoodle } from "@/components/doodles"
import { JoinClubButton } from "@/components/join-club-button"
import { PageHeader } from "@/components/page-header"
import { PageSuspense } from "@/components/page-suspense"
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
      <PageSuspense>
        <ExploreContent searchParams={searchParams} />
      </PageSuspense>
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

  const sorts = [
    { label: "Mais membros", active: filters.ordem === "membros", href: hrefWith(filters, { ordem: "membros" }) },
    { label: "Mais recentes", active: filters.ordem === "recentes", href: hrefWith(filters, { ordem: "recentes" }) },
  ]
  const hasFilters = Boolean(filters.q || filters.vagas)
  const chip = "inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full bg-card px-4 text-sm font-medium ring-1 ring-border transition-colors"

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

      {/* Ordenação (escolhe uma) separada do filtro (liga/desliga), com rótulos explícitos. */}
      <nav aria-label="Ordenar e filtrar" className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4">
        <span className="shrink-0 text-xs font-medium text-muted-foreground">Ordenar:</span>
        {sorts.map((sort) => (
          <Link
            key={sort.label}
            href={sort.href}
            aria-current={sort.active ? "true" : undefined}
            className={cn(chip, sort.active && "bg-primary text-primary-foreground ring-primary")}
          >
            {sort.label}
          </Link>
        ))}
        <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-border" />
        <Link
          href={hrefWith(filters, { vagas: !filters.vagas })}
          aria-pressed={Boolean(filters.vagas)}
          role="button"
          className={cn(chip, filters.vagas && "bg-secondary text-secondary-foreground ring-primary/40")}
        >
          {filters.vagas && <CheckIcon className="size-4" weight="bold" aria-hidden />} Só com vagas
        </Link>
      </nav>

      {clubs.length === 0 ? (
        <DoodleEmpty
          doodle={<EyeDoodle className="w-28" />}
          title="Nenhum clube encontrado"
          description={
            filters.q && filters.vagas
              ? `Nenhum clube com vagas para “${filters.q}”. Tente outro termo ou desligue “Só com vagas”.`
              : filters.q
                ? `Nenhum clube público para “${filters.q}”. Tente outro nome, livro ou autor.`
                : filters.vagas
                  ? "Nenhum clube público com vagas agora."
                  : "Ainda não há clubes públicos. Que tal criar o primeiro?"
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {hasFilters && (
                <Button variant="outline" render={<Link href="/clubes/explorar" />} nativeButton={false}>
                  Limpar filtros
                </Button>
              )}
              <Button render={<Link href="/clubes/novo" />} nativeButton={false}>
                Criar clube
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="grid gap-3 px-4 pb-4 md:grid-cols-2">
          {clubs.map((club) => (
            <li key={club.id} className="flex items-center gap-4 rounded-2xl bg-card p-3 ring-1 ring-border/60">
              <ClubTile name={club.name} className="w-14" decorative />
              <Link href={`/clubes/${club.id}`} className="min-w-0 flex-1 space-y-0.5">
                <p className="font-display line-clamp-2 text-base font-bold text-primary">{club.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {club.readingMode === "FREE" ? "Leitura livre: cada um lê o seu" : club.book ? `Lendo ${club.book.title}` : "Sem livro definido"}
                </p>
                {club.description && <p className="line-clamp-2 text-xs text-muted-foreground">{club.description}</p>}
                <p className="text-xs text-muted-foreground">{clubMembersLabel(club.memberCount, club.maxMembers)}</p>
              </Link>
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
