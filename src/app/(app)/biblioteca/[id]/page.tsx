import { notFound } from "next/navigation"
import { BookOpenTextIcon } from "@phosphor-icons/react/dist/ssr"
import { BookCover } from "@/components/book-cover"
import { CheckInDrawer } from "@/components/check-in-drawer"
import { FeedList } from "@/components/feed-item"
import { LibraryStatusTabs, RemoveFromLibraryButton } from "@/components/library-item-actions"
import { PageHeader } from "@/components/page-header"
import { PageSuspense } from "@/components/page-suspense"
import { SectionHeader } from "@/components/section-header"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { getLibraryItem } from "@/lib/queries"

export default function LibraryItemPage({ params }: PageProps<"/biblioteca/[id]">) {
  return (
    <PageSuspense>
      <LibraryItemContent params={params} />
    </PageSuspense>
  )
}

async function LibraryItemContent({ params }: Pick<PageProps<"/biblioteca/[id]">, "params">) {
  const { id } = await params
  const user = await getCurrentUser()
  const data = await getLibraryItem(id, user.id)
  if (!data) notFound()

  const { item, checkIns } = data
  const { book } = item
  const percent = Math.round((item.currentPage / book.totalPages) * 100)
  const canCheckIn = item.status !== "DONE"

  return (
    <main className="md:mx-auto md:max-w-2xl">
      <PageHeader title={book.title} backHref="/biblioteca" />
      <div className="space-y-6 p-4">
        <div className="flex flex-col items-center gap-4 pt-2 text-center">
          <BookCover title={book.title} coverUrl={book.coverUrl} className="w-40 rounded-xl" />
          <div className="space-y-1">
            <h2 className="text-xl font-bold leading-snug">{book.title}</h2>
            <p className="text-sm text-muted-foreground">
              {book.author} · {book.totalPages} páginas
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Página {item.currentPage} de {book.totalPages}
            </span>
            <span className="font-semibold text-primary tabular-nums">{percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <LibraryStatusTabs itemId={item.id} status={item.status} />

        {canCheckIn && (
          <CheckInDrawer
            options={[{ id: item.id, title: book.title, currentPage: item.currentPage, totalPages: book.totalPages }]}
            defaultItemId={item.id}
            goalType={user.goalType}
            trigger={
              <Button size="lg" className="h-12 w-full text-base">
                <BookOpenTextIcon className="size-5" /> Registrar leitura
              </Button>
            }
          />
        )}
      </div>

      <section>
        <SectionHeader title="Seus check-ins" />
        {checkIns.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">Nenhum check-in neste livro ainda.</p>
        ) : (
          <FeedList items={checkIns} viewerId={user.id} />
        )}
      </section>

      <div className="p-4">
        <RemoveFromLibraryButton itemId={item.id} />
      </div>
    </main>
  )
}
