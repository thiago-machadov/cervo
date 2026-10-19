import type { Metadata } from "next"
import { ClubForm } from "@/components/club-form"
import { PageHeader } from "@/components/page-header"
import { PageSuspense } from "@/components/page-suspense"
import { getCurrentUser } from "@/lib/auth"
import { getLibrary } from "@/lib/queries"

export const metadata: Metadata = { title: "Novo clube" }

export default function NewClubPage() {
  return (
    <PageSuspense>
      <NewClubContent />
    </PageSuspense>
  )
}

async function NewClubContent() {
  const user = await getCurrentUser()
  const library = await getLibrary(user.id)

  return (
    <main className="md:mx-auto md:max-w-2xl">
      <PageHeader title="Novo clube" backHref="/clubes" />
      <div className="p-4">
        <ClubForm books={library.map((item) => ({ id: item.book.id, title: item.book.title }))} />
      </div>
    </main>
  )
}
