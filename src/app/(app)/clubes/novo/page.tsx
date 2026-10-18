import type { Metadata } from "next"
import { Suspense } from "react"
import { ClubForm } from "@/components/club-form"
import { PageHeader } from "@/components/page-header"
import { PageSkeleton } from "@/components/page-skeleton"
import { getCurrentUser } from "@/lib/auth"
import { getLibrary } from "@/lib/queries"

export const metadata: Metadata = { title: "Novo clube" }

export default function NewClubPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewClubContent />
    </Suspense>
  )
}

async function NewClubContent() {
  const user = await getCurrentUser()
  const library = await getLibrary(user.id)

  return (
    <main>
      <PageHeader title="Novo clube" backHref="/clubes" />
      <div className="p-4">
        <ClubForm books={library.map((item) => ({ id: item.book.id, title: item.book.title }))} />
      </div>
    </main>
  )
}
