import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  BookOpenIcon,
  CameraIcon,
  ChartLineUpIcon,
  ChatsCircleIcon,
  CheckCircleIcon,
  DeviceMobileIcon,
  FireIcon,
  TargetIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react/lib"
import { BirdDoodle, BookDoodle, DeerDoodle, FlameDoodle, SpiralDoodle, StarDoodle, SunDoodle, ThreadDoodle } from "@/components/doodles"
import { Button } from "@/components/ui/button"
import { FREE_CLUB_LIMIT } from "@/lib/plan-limits"
import { getSessionUserId } from "@/lib/session"
import { FAQ, SITE } from "@/lib/site-info"

// A landing responde em "/" para quem não está logado (rewrite no proxy); esta é a URL canônica.
export const metadata: Metadata = {
  title: { absolute: SITE.title },
  description: SITE.description,
  alternates: { canonical: "/" },
}

const STEPS = [
  { title: "Escolha o livro e a meta", text: "Páginas ou minutos por dia, do seu jeito. Pode ser 10 páginas antes de dormir." },
  { title: "Faça o check-in", text: "Em segundos: em que página parou, quantos minutos leu. A sequência acende." },
  { title: "Leia junto", text: "Crie um clube, convide por link e acompanhe o ranking e as leituras do grupo." },
]

const FEATURES: { icon: Icon; title: string; text: string }[] = [
  { icon: FireIcon, title: "Sequência de leitura", text: "Cada dia com check-in mantém o fogo aceso. Ver a sequência crescer vira motivo para abrir o livro." },
  { icon: TargetIcon, title: "Metas diárias", text: "Defina uma meta em páginas ou minutos e veja quanto falta hoje, sem planilha." },
  { icon: UsersThreeIcon, title: "Clubes do livro", text: "Públicos ou privados, com o mesmo livro para todos ou leitura livre, meta do clube, ranking e desafios." },
  { icon: ChatsCircleIcon, title: "Feed com amigos", text: "Veja o que seus amigos e clubes estão lendo, reaja e comente cada check-in." },
  { icon: CameraIcon, title: "Biblioteca com capas", text: "Fotografe a capa, acompanhe o progresso de cada livro e o que você quer ler depois." },
  { icon: ChartLineUpIcon, title: "Estatísticas e retrospectiva", text: "Páginas por mês, seu dia favorito para ler e o resumo do seu ano em livros (Pro)." },
]

export default function WelcomePage({ searchParams }: PageProps<"/boas-vindas">) {
  return (
    <main>
      <JsonLd />
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <Link href="/" className="flex items-center gap-2" aria-label="Cervo, página inicial">
          <DeerDoodle className="w-10" label="Cervo" />
          <span className="font-display text-xl font-bold text-primary uppercase">Cervo</span>
        </Link>
        <Link href="/entrar" className="text-sm font-semibold text-primary">
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-5xl items-center gap-8 px-5 pt-8 pb-12 md:grid-cols-2 md:pt-16">
        <div className="space-y-5">
          <p className="inline-block border-b border-primary pb-1 text-[0.7rem] font-bold tracking-widest text-primary uppercase">
            Leia todo dia · Seu clube do livro
          </p>
          <h1 className="font-display text-4xl leading-[1.05] font-bold text-primary uppercase sm:text-5xl">
            O app do seu clube do livro
          </h1>
          <p className="text-lg text-muted-foreground">
            Faça check-in da leitura, mantenha a sequência, bata metas de páginas ou minutos e leia junto com os amigos.
            Um pouco por dia, sem perder o ritmo.
          </p>
          <Suspense fallback={<WelcomeActions />}>
            <WelcomeActionsWithSession searchParams={searchParams} />
          </Suspense>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {["Grátis para começar", "Sem anúncios", "iPhone e Android"].map((item) => (
              <li key={item} className="flex items-center gap-1">
                <CheckCircleIcon className="size-4 text-primary" weight="fill" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto h-72 w-full max-w-sm" aria-hidden>
          <SunDoodle className="absolute top-2 right-6 w-16" />
          <BirdDoodle className="absolute top-10 left-4 w-20" />
          <BookDoodle className="absolute bottom-12 left-1/2 w-52 -translate-x-1/2" />
          <ThreadDoodle className="absolute bottom-0 left-1/2 w-64 -translate-x-1/2 opacity-60" />
          <span className="font-display absolute bottom-6 left-0 flex size-20 -rotate-6 items-center justify-center rounded-full bg-primary text-center text-xs leading-tight font-bold text-primary-foreground">
            Check-in
            <br />
            diário
          </span>
          <span className="font-display absolute top-24 right-0 flex h-16 w-24 rotate-6 items-center justify-center rounded-[50%] bg-primary text-center text-xs leading-tight font-bold text-primary-foreground">
            Com os
            <br />
            amigos
          </span>
        </div>
      </section>

      {/* Como funciona */}
      <section aria-labelledby="como-funciona" className="bg-card py-14">
        <div className="mx-auto max-w-5xl space-y-8 px-5">
          <h2 id="como-funciona" className="font-display text-3xl font-bold text-primary uppercase">
            Como funciona
          </h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="space-y-2">
                <span className="font-display flex size-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Recursos */}
      <section aria-labelledby="recursos" className="mx-auto max-w-5xl space-y-8 px-5 py-14">
        <div className="space-y-2">
          <h2 id="recursos" className="font-display text-3xl font-bold text-primary uppercase">
            Tudo para criar o hábito de leitura
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Feito para quem quer ler mais: sozinho, com amigos ou em um clube do livro com dezenas de pessoas.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: FeatureIcon, title, text }) => (
            <li key={title} className="space-y-2 rounded-2xl bg-card p-5 ring-1 ring-border/60">
              <FeatureIcon className="size-7 text-primary" weight="duotone" />
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Planos */}
      <section aria-labelledby="planos" className="bg-card py-14">
        <div className="mx-auto max-w-5xl space-y-8 px-5">
          <h2 id="planos" className="font-display text-3xl font-bold text-primary uppercase">
            Grátis para começar
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-2xl bg-background p-6 ring-1 ring-border/60">
              <p className="font-display text-2xl font-bold uppercase">Grátis</p>
              <p className="text-sm text-muted-foreground">Para criar o hábito, sem anúncios.</p>
              <ul className="space-y-1.5 text-sm">
                {["Check-ins, sequência e metas", "Biblioteca e fotos", "Amigos, feed, reações e comentários", `Até ${FREE_CLUB_LIMIT} clubes`].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircleIcon className="size-4 text-primary" weight="fill" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative space-y-3 overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground">
              <StarDoodle className="absolute top-4 right-4 w-8 opacity-80" />
              <p className="font-display text-2xl font-bold uppercase">Cervo Pro</p>
              <p className="text-sm opacity-90">R$ 9,90 por mês ou R$ 79,90 por ano.</p>
              <ul className="space-y-1.5 text-sm">
                {["Clubes ilimitados", "Estatísticas e retrospectiva do ano", "Desafios no clube", "Exportar o ranking do clube"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircleIcon className="size-4" weight="fill" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Perguntas frequentes */}
      <section aria-labelledby="perguntas" className="mx-auto max-w-3xl space-y-6 px-5 py-14">
        <h2 id="perguntas" className="font-display text-3xl font-bold text-primary uppercase">
          Perguntas frequentes
        </h2>
        <div className="space-y-3">
          {FAQ.map(({ question, answer }) => (
            <details key={question} className="group rounded-2xl bg-card p-5 ring-1 ring-border/60">
              <summary className="cursor-pointer list-none font-semibold marker:hidden">{question}</summary>
              <p className="mt-3 text-sm text-muted-foreground">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Chamada final */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="relative space-y-4 overflow-hidden rounded-3xl bg-primary p-8 text-center text-primary-foreground">
          <SpiralDoodle seed={3} turns={7} className="pointer-events-none absolute -top-10 -left-10 w-40 opacity-20" />
          <FlameDoodle className="mx-auto w-10" />
          <h2 className="font-display text-3xl font-bold uppercase">Comece sua sequência hoje</h2>
          <p className="mx-auto max-w-md text-sm opacity-90">Leva menos de um minuto para criar a conta e fazer o primeiro check-in.</p>
          <Button
            size="lg"
            variant="secondary"
            className="h-12 px-8 text-base font-semibold"
            render={<Link href="/cadastro" />}
            nativeButton={false}
          >
            Criar conta grátis
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <BookOpenIcon className="size-4" /> Cervo, clube do livro para ler todo dia.
          </p>
          <nav aria-label="Rodapé" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/instalar" className="flex items-center gap-1 hover:text-foreground">
              <DeviceMobileIcon className="size-4" /> Instalar o app
            </Link>
            <Link href="/termos" className="hover:text-foreground">
              Termos de uso
            </Link>
            <Link href="/privacidade" className="hover:text-foreground">
              Privacidade
            </Link>
            <a href={`mailto:${SITE.email}`} className="hover:text-foreground">
              Contato
            </a>
          </nav>
        </div>
      </footer>
    </main>
  )
}

async function WelcomeActionsWithSession({ searchParams }: Pick<PageProps<"/boas-vindas">, "searchParams">) {
  const { next, conta } = await searchParams
  if (await getSessionUserId()) redirect("/")
  return (
    <>
      {conta === "excluida" && (
        <p role="status" className="rounded-2xl bg-secondary p-3 text-sm text-secondary-foreground">
          Sua conta e seus dados foram excluídos. Obrigado por ter lido com a gente.
        </p>
      )}
      <WelcomeActions next={typeof next === "string" ? next : undefined} />
    </>
  )
}

function WelcomeActions({ next }: { next?: string }) {
  const query = next ? `?next=${encodeURIComponent(next)}` : ""
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button size="lg" className="h-12 px-6 text-base font-semibold" render={<Link href={`/cadastro${query}`} />} nativeButton={false}>
        Criar conta grátis
      </Button>
      <Button
        variant="ghost"
        size="lg"
        className="h-12 px-6 text-base font-semibold text-primary"
        render={<Link href={`/entrar${query}`} />}
        nativeButton={false}
      >
        Já tenho conta
      </Button>
    </div>
  )
}

/** Dados estruturados (schema.org) para o Google entender o app, os planos e as perguntas frequentes. */
function JsonLd() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "iOS, Android, Web",
      inLanguage: "pt-BR",
      image: `${SITE.url}/icon/512`,
      offers: [
        { "@type": "Offer", name: "Grátis", price: "0", priceCurrency: "BRL" },
        { "@type": "Offer", name: "Cervo Pro mensal", price: "9.90", priceCurrency: "BRL" },
        { "@type": "Offer", name: "Cervo Pro anual", price: "79.90", priceCurrency: "BRL" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: `${SITE.url}/icon/512`,
      email: SITE.email,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ]
  // JSON.stringify não escapa "<"; trocamos para não fechar a tag script por engano.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
}
