import Link from "next/link"
import { ChatCircleIcon } from "@phosphor-icons/react/dist/ssr"
import { BookCover } from "@/components/book-cover"
import { ReactionBar } from "@/components/reaction-bar"
import { UserAvatar } from "@/components/user-avatar"
import { timeAgo } from "@/lib/dates"
import type { FeedCheckIn } from "@/lib/queries"
import { summarizeReactions } from "@/lib/reactions"

export function FeedItem({
  checkIn,
  viewerId,
  linkToDetail = true,
}: {
  checkIn: FeedCheckIn
  viewerId: string
  linkToDetail?: boolean
}) {
  const { user, book } = checkIn
  const finished = checkIn.toPage === book.totalPages
  const percent = Math.round((checkIn.toPage / book.totalPages) * 100)

  const content = (
    <div className="space-y-2">
      <p className="text-sm leading-snug">
        <span className="font-semibold">{user.name}</span>{" "}
        {finished ? "terminou" : `leu ${checkIn.pagesRead} ${checkIn.pagesRead === 1 ? "página" : "páginas"} de`}{" "}
        <span className="font-medium">{book.title}</span>
        {finished && " 🎉"}
      </p>
      {checkIn.note && <p className="text-sm whitespace-pre-line text-muted-foreground">{checkIn.note}</p>}
      {checkIn.photoUrl && (
        // Foto do R2 servida pela rota /fotos (com login); next/image não otimiza no Workers.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={checkIn.photoUrl}
          alt={`Foto da leitura de ${user.name}`}
          loading="lazy"
          className="max-h-96 w-full rounded-xl bg-muted object-cover ring-1 ring-border/60"
        />
      )}
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
          <ChatCircleIcon className="size-3.5" />
          {checkIn._count.comments}
        </span>
      </div>
    </div>
  )

  return (
    <article className="flex gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/60">
      <Link href={`/pessoas/${user.id}`} aria-label={`Perfil de ${user.name}`} className="h-fit shrink-0">
        <UserAvatar name={user.name} />
      </Link>
      <div className="min-w-0 flex-1 space-y-3">
        {linkToDetail ? (
          <Link href={`/checkin/${checkIn.id}`} className="block transition-opacity active:opacity-70">
            {content}
          </Link>
        ) : (
          content
        )}
        {/* Fora do link: botões não podem ficar dentro de <a>. */}
        <ReactionBar checkInId={checkIn.id} reactions={summarizeReactions(checkIn.reactions, viewerId)} />
      </div>
    </article>
  )
}

export function FeedList({ items, viewerId }: { items: FeedCheckIn[]; viewerId: string }) {
  return (
    <div className="mx-auto max-w-2xl space-y-3 px-4">
      {items.map((checkIn) => (
        <FeedItem key={checkIn.id} checkIn={checkIn} viewerId={viewerId} />
      ))}
    </div>
  )
}
