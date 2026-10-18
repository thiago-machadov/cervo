import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BookDoodle, DeerDoodle, SunDoodle, ThreadDoodle } from "@/components/doodles"
import { Button } from "@/components/ui/button"
import { getSessionUserId } from "@/lib/session"

export const metadata: Metadata = { title: "Boas-vindas" }

export default function WelcomePage({ searchParams }: PageProps<"/boas-vindas">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-primary pb-2 text-[0.7rem] font-bold tracking-widest text-primary uppercase">
        <span>Leia todo dia</span>
        <span>Seu clube do livro</span>
      </header>

      <div className="flex flex-1 flex-col justify-center py-6">
        <DeerDoodle className="mx-auto w-28" />
        <h1 className="font-display mt-2 text-center text-[clamp(5rem,30vw,7.5rem)] font-bold text-primary">Cervo</h1>
        <p className="text-center text-sm font-medium text-muted-foreground">Leia junto. Todo dia, um pouco.</p>

        <div className="relative mx-auto mt-4 h-44 w-full max-w-[19rem]">
          <SunDoodle className="absolute top-0 right-4 w-14" />
          <BookDoodle className="absolute bottom-8 left-1/2 w-40 -translate-x-1/2" />
          <ThreadDoodle className="absolute bottom-0 left-1/2 w-56 -translate-x-1/2 opacity-60" />
          <span className="font-display absolute bottom-2 -left-1 flex size-[4.5rem] -rotate-6 items-center justify-center rounded-full bg-primary text-center text-base leading-none font-bold text-primary-foreground">
            Check-in
            <br />
            diário
          </span>
          <span className="font-display absolute top-16 -right-1 flex h-14 w-22 rotate-6 items-center justify-center rounded-[50%] bg-primary text-center text-base leading-none font-bold text-primary-foreground">
            Com os
            <br />
            amigos
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Suspense fallback={<WelcomeActions />}>
          <WelcomeActionsWithNext searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}

async function WelcomeActionsWithNext({ searchParams }: Pick<PageProps<"/boas-vindas">, "searchParams">) {
  const { next } = await searchParams
  if (await getSessionUserId()) redirect("/")
  return <WelcomeActions next={typeof next === "string" ? next : undefined} />
}

function WelcomeActions({ next }: { next?: string }) {
  const query = next ? `?next=${encodeURIComponent(next)}` : ""
  return (
    <>
      <Button size="lg" className="h-13 w-full text-base font-semibold" render={<Link href={`/cadastro${query}`} />} nativeButton={false}>
        Criar conta
      </Button>
      <Button
        variant="ghost"
        size="lg"
        className="h-12 w-full text-base font-semibold text-primary"
        render={<Link href={`/entrar${query}`} />}
        nativeButton={false}
      >
        Já tenho conta
      </Button>
    </>
  )
}
