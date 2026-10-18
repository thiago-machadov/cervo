import Link from "next/link"
import { BookCover } from "@/components/book-cover"

type Item = {
  id: string
  currentPage: number
  book: { title: string; author: string; totalPages: number; coverUrl: string | null }
}

/** Carrossel horizontal com os livros em leitura. */
export function ContinueReading({ items }: { items: Item[] }) {
  return (
    <ul className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2">
      {items.map((item) => {
        const percent = Math.round((item.currentPage / item.book.totalPages) * 100)
        const left = item.book.totalPages - item.currentPage
        return (
          <li key={item.id} className="w-32 shrink-0 snap-start">
            <Link href={`/biblioteca/${item.id}`} className="block space-y-2 transition-transform active:scale-[0.98]">
              <BookCover title={item.book.title} coverUrl={item.book.coverUrl} className="w-32" />
              <div>
                <p className="truncate text-sm font-semibold">{item.book.title}</p>
                <p className="truncate text-xs text-muted-foreground">{item.book.author}</p>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
              </div>
              <p className="text-right text-[0.7rem] text-muted-foreground">
                {left} {left === 1 ? "pág. restante" : "págs. restantes"}
              </p>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
