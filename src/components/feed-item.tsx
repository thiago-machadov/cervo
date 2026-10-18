import Link from "next/link"
import { MessageCircleIcon } from "lucide-react"
import { BookCover } from "@/components/book-cover"
import { UserAvatar } from "@/components/user-avatar"
import { timeAgo } from "@/lib/dates"
import type { FeedCheckIn } from "@/lib/queries"

export function FeedItem({ checkIn, linkToDetail = true }: { checkIn: FeedCheckIn; linkToDetail?: boolean }) {
  const { user, book } = checkIn
  const finished = checkIn.toPage === book.totalPages
  const percent = Math.round((checkIn.toPage / book.totalPages) * 100)

  const body = (
    <article className="flex gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/60">
      <UserAvatar name={user.name} />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm leading-snug">
          <span className="font-semibold">{user.name}</span>{" "}
          {finished ? "terminou" : `leu ${checkIn.pagesRead} ${checkIn.pagesRead === 1 ? "página" : "páginas"} de`}{" "}
          <span className="font-medium">{book.title}</span>
          {finished && " 🎉"}
        </p>
        {checkIn.note && <p className="text-sm whitespace-pre-line text-muted-foreground">{checkIn.note}</p>}
        <div className="flex items-center gap-3 rounded-xl bg-muted/70 p-2">
          <BookCover title={book.title} coverUrl={book.coverUrl} className="w-8" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">
              pág. {checkIn.fromPage} → {checkIn.toPage} de {book.totalPages}
            </p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-card">
              <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
            </div>
          </div>
          <span className="text-xs font-semibold text-primary tabular-nums">{percent}%</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <time dateTime={checkIn.createdAt.toISOString()}>{timeAgo(checkIn.createdAt)}</time>
          {checkIn.minutes && <span>{checkIn.minutes} min</span>}
          <span className="flex items-center gap-1">
            <MessageCircleIcon className="size-3.5" />
            {checkIn._count.comments}
          </span>
        </div>
      </div>
    </article>
  )

  return linkToDetail ? (
    <Link href={`/checkin/${checkIn.id}`} className="block rounded-2xl transition-transform active:scale-[0.99]">
      {body}
    </Link>
  ) : (
    body
  )
}

export function FeedList({ items }: { items: FeedCheckIn[] }) {
  return (
    <div className="space-y-3 px-4">
      {items.map((checkIn) => (
        <FeedItem key={checkIn.id} checkIn={checkIn} />
      ))}
    </div>
  )
}
