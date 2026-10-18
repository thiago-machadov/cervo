import type { Metadata } from "next"
import { Suspense } from "react"
import { ClubForm } from "@/components/club-form"
import { PageHeader } from "@/components/page-header"
import { PageSkeleton } from "@/components/page-skeleton"
import { UpgradeCard } from "@/components/upgrade-card"
import { getCurrentUser } from "@/lib/auth"
import { FREE_CLUB_LIMIT, remainingClubSlots } from "@/lib/plan"
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
  const [library, slots] = await Promise.all([getLibrary(user.id), remainingClubSlots(user.id)])

  return (
    <main className="md:mx-auto md:max-w-2xl">
      <PageHeader title="Novo clube" backHref="/clubes" />
      <div className="p-4">
        {slots === 0 ? (
          <UpgradeCard
            title={`Você já está em ${FREE_CLUB_LIMIT} clubes`}
            description={`No plano grátis dá para participar de até ${FREE_CLUB_LIMIT} clubes, contando os que você criou. Com o Cervo Pro, os clubes são ilimitados.`}
          />
        ) : (
          <ClubForm books={library.map((item) => ({ id: item.book.id, title: item.book.title }))} />
        )}
      </div>
    </main>
  )
}
