import type { Metadata } from "next"
import Link from "next/link"
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr"
import { AddBookDrawer } from "@/components/add-book-drawer"
import { BookCover } from "@/components/book-cover"
import { DoodleEmpty } from "@/components/doodle-empty"
import { BookDoodle, SpiralDoodle } from "@/components/doodles"
import { PageHeader } from "@/components/page-header"
import { PageSuspense } from "@/components/page-suspense"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/auth"
import { getLibrary } from "@/lib/queries"
import { STATUS_LABEL } from "@/lib/utils-text"

export const metadata: Metadata = { title: "Biblioteca" }

const sections = ["READING", "WANT", "DONE"] as const

/** Acima disso a estante ganha busca por título ou autor. */
const SEARCH_FROM = 12

export default function LibraryPage({ searchParams }: PageProps<"/biblioteca">) {
  return (
    <PageSuspense>
      <LibraryContent searchParams={searchParams} />
    </PageSuspense>
  )
}

async function LibraryContent({ searchParams }: Pick<PageProps<"/biblioteca">, "searchParams">) {
  const user = await getCurrentUser()
  const { q } = await searchParams
  const query = typeof q === "string" ? q.trim() : ""
  const allItems = await getLibrary(user.id)
  const needle = query.toLocaleLowerCase("pt-BR")
  const items = needle
    ? allItems.filter((item) => `${item.book.title} ${item.book.author}`.toLocaleLowerCase("pt-BR").includes(needle))
    : allItems
  const firstWithBooks = sections.find((status) => items.some((item) => item.status === status)) ?? "READING"

  return (
    <main>
      <PageHeader title="Biblioteca" subtitle={`${allItems.length} ${allItems.length === 1 ? "livro" : "livros"}`} action={<AddBookDrawer />} />

      {allItems.length > SEARCH_FROM && (
        <form role="search" className="mx-4 mb-4 flex gap-2">
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar por título ou autor"
            aria-label="Buscar na biblioteca"
            enterKeyHint="search"
            className="h-11"
          />
          {query && (
            <Button variant="ghost" className="h-11" render={<Link href="/biblioteca" />} nativeButton={false}>
              Limpar
            </Button>
          )}
        </form>
      )}

      {query && items.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">Nenhum livro com “{query}” na sua estante.</p>
      ) : allItems.length === 0 ? (
        <DoodleEmpty
          className="mt-2"
          doodle={<BookDoodle className="w-36" />}
          title="Estante vazia"
          description="Adicione o livro que você está lendo para começar a registrar seu progresso."
          action={<AddBookDrawer defaultStatus="READING" label="Adicionar o livro que estou lendo" />}
        />
      ) : (
        <Tabs defaultValue={firstWithBooks} className="gap-4">
          <TabsList variant="pill" className="mx-4 w-[calc(100%-2rem)]">
            {sections.map((status) => (
              <TabsTrigger key={status} value={status}>
                {STATUS_LABEL[status]}
                <span className="text-xs opacity-60 tabular-nums">{items.filter((item) => item.status === status).length}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map((status) => {
            const group = items.filter((item) => item.status === status)
            return (
              <TabsContent key={status} value={status}>
                {group.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-5 py-10 text-center text-sm text-muted-foreground">
                    <SpiralDoodle className="w-12 opacity-60" />
                    Nenhum livro aqui ainda.
                  </div>
                ) : (
                  <ul className="mx-4 divide-y divide-border/70 overflow-hidden rounded-2xl bg-card ring-1 ring-border/60 md:grid md:grid-cols-2 md:gap-3 md:divide-y-0 md:overflow-visible md:bg-transparent md:ring-0">
                    {group.map((item) => {
                      const percent = Math.round((item.currentPage / item.book.totalPages) * 100)
                      return (
                        <li key={item.id} className="md:overflow-hidden md:rounded-2xl md:bg-card md:ring-1 md:ring-border/60">
                          <Link href={`/biblioteca/${item.id}`} className="flex items-center gap-4 p-3 transition-colors active:bg-muted/60">
                            <BookCover title={item.book.title} coverUrl={item.book.coverUrl} className="w-16" />
                            <div className="min-w-0 flex-1 space-y-1">
                              <p className="truncate font-semibold">{item.book.title}</p>
                              <p className="truncate text-sm text-muted-foreground">{item.book.author}</p>
                              {status === "READING" ? (
                                <div className="flex items-center gap-2 pt-1">
                                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                    <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                                  </div>
                                  <Badge variant="secondary" className="tabular-nums">{percent}%</Badge>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">{item.book.totalPages} páginas</p>
                              )}
                            </div>
                            <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      )}
    </main>
  )
}
