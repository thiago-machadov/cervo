import { Suspense } from "react"
import { notFound } from "next/navigation"
import { CommentForm } from "@/components/comment-form"
import { EyeDoodle } from "@/components/doodles"
import { FeedItem } from "@/components/feed-item"
import { PageHeader } from "@/components/page-header"
import { PageSkeleton } from "@/components/page-skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { getCurrentUser } from "@/lib/auth"
import { timeAgo } from "@/lib/dates"
import { getCheckInDetail } from "@/lib/queries"

export default function CheckInPage({ params }: PageProps<"/checkin/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CheckInContent params={params} />
    </Suspense>
  )
}

async function CheckInContent({ params }: Pick<PageProps<"/checkin/[id]">, "params">) {
  const { id } = await params
  const user = await getCurrentUser()
  const checkIn = await getCheckInDetail(id, user.id)
  if (!checkIn) notFound()

  return (
    <main className="md:mx-auto md:max-w-2xl">
      <PageHeader title="Check-in" backHref="/feed" />
      <div className="px-4 pt-2">
        <FeedItem checkIn={checkIn} viewerId={user.id} linkToDetail={false} />
      </div>

      <section className="space-y-4 px-4 py-6">
        <h2 className="text-base font-bold">
          {checkIn.comments.length === 0 ? "Comentários" : `${checkIn.comments.length} ${checkIn.comments.length === 1 ? "comentário" : "comentários"}`}
        </h2>
        {checkIn.comments.length === 0 && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <EyeDoodle className="w-12" />
            Seja o primeiro a comentar.
          </div>
        )}
        <ul className="space-y-4">
          {checkIn.comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <UserAvatar name={comment.user.name} className="size-8" />
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-card px-3 py-2 ring-1 ring-border/60">
                <p className="text-xs">
                  <span className="font-semibold">{comment.user.name}</span>{" "}
                  <span className="text-muted-foreground">· {timeAgo(comment.createdAt)}</span>
                </p>
                <p className="text-sm whitespace-pre-line">{comment.body}</p>
              </div>
            </li>
          ))}
        </ul>
        <CommentForm checkInId={checkIn.id} />
      </section>
    </main>
  )
}
