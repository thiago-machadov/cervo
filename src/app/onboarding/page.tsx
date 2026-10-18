import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { PageSkeleton } from "@/components/page-skeleton"
import { getSessionUser } from "@/lib/auth"
import { db } from "@/lib/db"
import type { GoalType } from "@/lib/goals"
import { safeNext } from "@/lib/redirects"
import { OnboardingWizard } from "./onboarding-wizard"

export const metadata: Metadata = { title: "Primeiros passos" }

export default function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  return (
    <main className="mx-auto min-h-dvh max-w-md bg-background">
      <Suspense fallback={<PageSkeleton />}>
        <OnboardingContent searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function OnboardingContent({ searchParams }: Pick<PageProps<"/onboarding">, "searchParams">) {
  const { next: rawNext } = await searchParams
  const next = safeNext(typeof rawNext === "string" ? rawNext : null)
  const user = await getSessionUser()
  if (user.onboardedAt) redirect(next)

  const firstBook = await db.libraryItem.findFirst({
    where: { userId: user.id, status: "READING" },
    orderBy: { createdAt: "desc" },
    include: { book: { select: { title: true, coverUrl: true } } },
  })

  // Retoma de onde a pessoa parou se ela recarregar a página.
  const initialStep = !user.dailyGoal ? 0 : !firstBook ? 1 : 2
  const inviteCode = next.match(/^\/convite\/([\w-]+)/)?.[1]

  return (
    <OnboardingWizard
      initialStep={initialStep}
      firstName={user.name.split(" ")[0]!}
      goal={user.dailyGoal ? { type: (user.goalType ?? "PAGES") as GoalType, value: user.dailyGoal } : null}
      book={firstBook ? firstBook.book : null}
      inviteLink={inviteCode ? `/convite/${inviteCode}` : undefined}
      next={next}
    />
  )
}
