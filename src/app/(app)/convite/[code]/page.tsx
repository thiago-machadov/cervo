import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BookCover } from "@/components/book-cover"
import { BirdDoodle, SpiralClusterDoodle, StampFrame, StarDoodle } from "@/components/doodles"
import { PageSuspense } from "@/components/page-suspense"
import { SubmitButton } from "@/components/submit-button"
import { Button } from "@/components/ui/button"
import { joinClub } from "@/app/actions/clubs"
import { UpgradeCard } from "@/components/upgrade-card"
import { getSessionUser } from "@/lib/auth"
import { clubMembersLabel } from "@/lib/clubs"
import { db } from "@/lib/db"
import { FREE_CLUB_LIMIT, remainingClubSlots } from "@/lib/plan"
import { getInvite } from "@/lib/queries"
import { withNext } from "@/lib/redirects"

export const metadata: Metadata = { title: "Convite" }

export default function InvitePage({ params }: PageProps<"/convite/[code]">) {
  return (
    <PageSuspense>
      <InviteContent params={params} />
    </PageSuspense>
  )
}

async function InviteContent({ params }: Pick<PageProps<"/convite/[code]">, "params">) {
  const { code } = await params
  // Sem onboarding concluído: termina o onboarding e volta para este convite (não perde o clube).
  const user = await getSessionUser()
  if (!user.onboardedAt) redirect(withNext("/onboarding", `/convite/${code}`))
  const invite = await getInvite(code)
  const expired = !invite || (invite.expiresAt !== null && invite.expiresAt < new Date())

  if (expired) {
    return (
      <main className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">Convite inválido</h1>
        <p className="text-sm text-muted-foreground">Esse link expirou ou não existe. Peça um novo para quem te convidou.</p>
        <Button render={<Link href="/clubes" />} nativeButton={false}>
          Ver meus clubes
        </Button>
      </main>
    )
  }

  const { club } = invite
  const [alreadyMember, slots] = await Promise.all([
    db.clubMember.findUnique({ where: { clubId_userId: { clubId: club.id, userId: user.id } } }),
    remainingClubSlots(user.id),
  ])

  return (
    <main className="relative flex min-h-[85dvh] flex-col justify-center gap-6 overflow-hidden p-6 text-center">
      <SpiralClusterDoodle className="pointer-events-none absolute -bottom-16 -left-14 w-56 -rotate-12 opacity-[0.12]" />
      <div className="relative space-y-3">
        <p className="border-b border-primary pb-2 text-xs font-bold tracking-widest text-primary uppercase">
          {invite.createdBy.name} te convidou
        </p>
        <StampFrame className="mx-auto my-2 h-40 w-30">
          <StarDoodle className="mb-1 w-7" />
          <BirdDoodle className="w-20" />
          <span className="font-display mt-1 text-base">Convite</span>
        </StampFrame>
        <h1 className="font-display text-5xl font-bold break-words text-primary">{club.name}</h1>
        {club.description && <p className="text-sm text-muted-foreground">{club.description}</p>}
        <p className="text-xs text-muted-foreground">
          {clubMembersLabel(club._count.members, club.maxMembers, club.visibility)}
        </p>
      </div>

      {club.readingMode === "FREE" && (
        <p className="relative mx-auto rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
          Leitura livre: cada um lê o livro que quiser
        </p>
      )}

      {club.readingMode === "FIXED" && club.book && (
        <div className="relative mx-auto flex items-center gap-3 rounded-2xl bg-card p-3 pr-5 text-left ring-1 ring-border/60">
          <BookCover title={club.book.title} coverUrl={club.book.coverUrl} className="w-12" />
          <div>
            <p className="text-xs text-muted-foreground">Lendo agora</p>
            <p className="font-medium">{club.book.title}</p>
            <p className="text-sm text-muted-foreground">{club.book.author}</p>
          </div>
        </div>
      )}

      {alreadyMember ? (
        <Button size="lg" className="relative h-12" render={<Link href={`/clubes/${club.id}`} />} nativeButton={false}>
          Você já está no clube — abrir
        </Button>
      ) : club.maxMembers !== null && club._count.members >= club.maxMembers ? (
        <p className="relative rounded-2xl bg-card p-4 text-sm text-muted-foreground ring-1 ring-border/60">
          Esse clube está lotado. Peça para quem te convidou aumentar o limite de membros.
        </p>
      ) : slots === 0 ? (
        <UpgradeCard
          className="relative"
          title={`Você já está em ${FREE_CLUB_LIMIT} clubes`}
          description={`No plano grátis dá para participar de até ${FREE_CLUB_LIMIT} clubes. Saia de um ou assine o Cervo Pro para entrar neste.`}
        />
      ) : (
        <form action={joinClub.bind(null, code)} className="relative">
          <SubmitButton size="lg" className="h-12 w-full text-base" pendingText="Entrando no clube…">
            Bora ler junto!
          </SubmitButton>
        </form>
      )}
    </main>
  )
}
