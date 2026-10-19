import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ClubForm } from "@/components/club-form"
import { DeleteClubButton } from "@/components/leave-club-button"
import { PageHeader } from "@/components/page-header"
import { PageSuspense } from "@/components/page-suspense"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { getLibrary } from "@/lib/queries"

export const metadata: Metadata = { title: "Editar clube" }

export default function EditClubPage({ params }: PageProps<"/clubes/[id]/editar">) {
  return (
    <PageSuspense>
      <EditClubContent params={params} />
    </PageSuspense>
  )
}

async function EditClubContent({ params }: Pick<PageProps<"/clubes/[id]/editar">, "params">) {
  const { id } = await params
  const user = await getCurrentUser()
  const club = await db.club.findFirst({
    where: { id, members: { some: { userId: user.id, role: { in: ["OWNER", "ADMIN"] } } } },
  })
  if (!club) notFound()

  const library = await getLibrary(user.id)

  return (
    <main className="md:mx-auto md:max-w-2xl">
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
            visibility: club.visibility,
            maxMembers: club.maxMembers,
            readingMode: club.readingMode,
          }}
        />
      </div>
      {club.ownerId === user.id && (
        <section className="mx-4 mb-8 space-y-3 rounded-2xl border border-destructive/40 p-4">
          <h2 className="font-semibold">Zona de perigo</h2>
          <p className="text-sm text-muted-foreground">Apagar o clube remove o ranking, os desafios e o histórico para todos os membros.</p>
          <DeleteClubButton clubId={club.id} />
        </section>
      )}
    </main>
  )
}
