import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ClubForm } from "@/components/club-form"
import { PageHeader } from "@/components/page-header"
import { PageSkeleton } from "@/components/page-skeleton"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { getLibrary } from "@/lib/queries"

export default function EditClubPage({ params }: PageProps<"/clubes/[id]/editar">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EditClubContent params={params} />
    </Suspense>
  )
}

async function EditClubContent({ params }: Pick<PageProps<"/clubes/[id]/editar">, "params">) {
  const { id } = await params
  const user = await getCurrentUser()
  const club = await db.club.findFirst({ where: { id, ownerId: user.id } })
  if (!club) notFound()

  const library = await getLibrary(user.id)

  return (
    <main>
      <PageHeader title="Editar clube" backHref={`/clubes/${club.id}`} />
      <div className="p-4">
        <ClubForm
          books={library.map((item) => ({ id: item.book.id, title: item.book.title }))}
          club={{
            id: club.id,
            name: club.name,
            description: club.description,
            bookId: club.bookId,
            goalEndDate: club.goalEndDate?.toISOString().slice(0, 10) ?? null,
            weeklyPages: club.weeklyPages,
          }}
        />
      </div>
    </main>
  )
}
