import type { Metadata } from "next"
import Link from "next/link"
import { BookCover } from "@/components/book-cover"
import { BooksDoodle, FlameDoodle, StarDoodle } from "@/components/doodles"
import { PageHeader } from "@/components/page-header"
import { PageSuspense } from "@/components/page-suspense"
import { getCurrentUser } from "@/lib/auth"
import { dayKey } from "@/lib/dates"
import { MONTHS, WEEKDAYS, getYearStats } from "@/lib/stats"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Estatísticas" }

export default function StatsPage({ searchParams }: PageProps<"/estatisticas">) {
  return (
    <main className="md:mx-auto md:max-w-2xl">
      <PageHeader title="Estatísticas" backHref="/perfil" />
      <PageSuspense>
        <StatsContent searchParams={searchParams} />
      </PageSuspense>
    </main>
  )
}

function formatDay(day: string) {
  const [, m, d] = day.split("-")
  return `${Number(d)} de ${MONTHS[Number(m) - 1]}`
}

/** Intensidade do quadradinho do calendário conforme as páginas do dia. */
function heat(pages: number) {
  if (pages < 0) return "bg-transparent"
  if (pages === 0) return "bg-muted"
  if (pages < 10) return "bg-primary/30"
  if (pages < 30) return "bg-primary/60"
  return "bg-primary"
}

async function StatsContent({ searchParams }: Pick<PageProps<"/estatisticas">, "searchParams">) {
  const user = await getCurrentUser()
  const currentYear = Number(dayKey().slice(0, 4))
  const { ano } = await searchParams
  const requested = Number(ano)
  const year = Number.isInteger(requested) && requested >= 2000 && requested <= currentYear ? requested : currentYear
  const stats = await getYearStats(user.id, year)
  const years = Array.from({ length: currentYear - Math.min(stats.firstYear, currentYear) + 1 }, (_, i) => currentYear - i)
  const maxMonth = Math.max(1, ...stats.pagesByMonth)
  const maxWeekday = Math.max(1, ...stats.pagesByWeekday)

  const totals = [
    { label: "Páginas", value: stats.totalPages.toLocaleString("pt-BR") },
    { label: "Livros terminados", value: stats.booksFinished.length },
    { label: "Dias lendo", value: stats.daysRead },
    { label: "Maior sequência", value: `${stats.longestStreak} ${stats.longestStreak === 1 ? "dia" : "dias"}` },
  ]

  return (
    <div className="space-y-6 px-4 pt-2 pb-8">
      {years.length > 1 && (
        <nav aria-label="Ano" className="no-scrollbar flex gap-2 overflow-x-auto">
          {years.map((y) => (
            <Link
              key={y}
              href={y === currentYear ? "/estatisticas" : `/estatisticas?ano=${y}`}
              aria-current={y === year ? "true" : undefined}
              className={cn(
                "shrink-0 rounded-full bg-card px-4 py-2 text-sm font-medium ring-1 ring-border",
                y === year && "bg-primary text-primary-foreground ring-primary"
              )}
            >
              {y}
            </Link>
          ))}
        </nav>
      )}

      <dl className="grid grid-cols-2 gap-3">
        {totals.map((item) => (
          <div key={item.label} className="rounded-2xl bg-card p-4 ring-1 ring-border/60">
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
            <dd className="font-display text-3xl font-bold text-primary tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>

      <>
        <>
          <section className="relative space-y-3 overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground">
            <StarDoodle className="absolute top-4 right-4 w-8 opacity-80" />
            <p className="text-[0.7rem] font-bold tracking-widest uppercase opacity-80">Retrospectiva {year}</p>
            {stats.totalPages === 0 ? (
              <p className="font-display text-2xl font-bold uppercase">Nenhuma página registrada em {year} ainda</p>
            ) : (
              <>
                <p className="font-display text-3xl leading-tight font-bold uppercase">
                  {stats.totalPages.toLocaleString("pt-BR")} páginas
                </p>
                <ul className="space-y-1.5 text-sm">
                  <li>
                    Isso dá uns <strong>{Math.max(1, Math.round(stats.totalPages / 300))}</strong>{" "}
                    {Math.round(stats.totalPages / 300) <= 1 ? "livro" : "livros"} de 300 páginas.
                  </li>
                  {stats.topMonth !== null && (
                    <li>
                      Seu melhor mês foi <strong>{MONTHS[stats.topMonth]}</strong>, com{" "}
                      {stats.pagesByMonth[stats.topMonth]!.toLocaleString("pt-BR")} páginas.
                    </li>
                  )}
                  {stats.topWeekday !== null && (
                    <li>
                      Você lê mais {stats.topWeekday === 0 || stats.topWeekday === 6 ? "aos" : "às"}{" "}
                      <strong>{WEEKDAYS[stats.topWeekday]}s</strong>.
                    </li>
                  )}
                  {stats.bestDay && (
                    <li>
                      Seu recorde foi em <strong>{formatDay(stats.bestDay.day)}</strong>: {stats.bestDay.pages} páginas num dia.
                    </li>
                  )}
                  <li>
                    Média de <strong>{stats.averagePerDay}</strong> páginas por dia de leitura
                    {stats.minutes > 0 && `, em ${Math.round(stats.minutes / 60)} horas no total`}.
                  </li>
                </ul>
              </>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold">Páginas por mês</h2>
            <div className="flex h-40 items-end gap-1.5 rounded-2xl bg-card p-4 ring-1 ring-border/60">
              {stats.pagesByMonth.map((pages, i) => (
                <div key={MONTHS[i]} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  {/* Valor visível (sem depender de passar o mouse) e lido pelo leitor de tela. */}
                  {pages > 0 && (
                    <span aria-hidden className="text-[0.55rem] font-semibold text-primary tabular-nums">
                      {pages}
                    </span>
                  )}
                  <div
                    aria-hidden
                    className="w-full rounded-t bg-primary"
                    style={{ height: `${(pages / maxMonth) * 100}%`, minHeight: pages > 0 ? 3 : 0 }}
                  />
                  <span aria-hidden className="text-[0.6rem] text-muted-foreground">
                    {MONTHS[i]}
                  </span>
                  <span className="sr-only">
                    {MONTHS[i]}: {pages} páginas
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold">Dias da semana</h2>
            <ul className="space-y-1.5 rounded-2xl bg-card p-4 ring-1 ring-border/60">
              {stats.pagesByWeekday.map((pages, i) => (
                <li key={WEEKDAYS[i]} className="flex items-center gap-3 text-xs">
                  <span className="w-14 text-muted-foreground">{WEEKDAYS[i]!.slice(0, 3)}</span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${(pages / maxWeekday) * 100}%` }} />
                  </span>
                  <span className="w-10 text-right tabular-nums">{pages}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <FlameDoodle className="w-4" /> Calendário de leitura
            </h2>
            <div className="overflow-x-auto rounded-2xl bg-card p-4 ring-1 ring-border/60">
              <div
                className="flex w-max gap-1"
                role="img"
                aria-label={`Calendário dos últimos 6 meses: ${stats.calendar.flat().filter((c) => c.pages > 0).length} dias com leitura`}
              >
                {stats.calendar.map((week) => (
                  <div key={week[0]!.day} className="flex flex-col gap-1">
                    {week.map((cell) => (
                      <span
                        key={cell.day}
                                                className={cn("size-3 rounded-[3px]", heat(cell.pages))}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>Últimos 6 meses</span>
                <span className="flex items-center gap-1" aria-hidden>
                  Menos
                  {[0, 5, 20, 40].map((p) => (
                    <span key={p} className={cn("size-3 rounded-[3px]", heat(p))} />
                  ))}
                  Mais páginas
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <BooksDoodle className="w-6" /> Livros terminados em {year}
            </h2>
            {stats.booksFinished.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum livro terminado ainda. O próximo pode ser este!</p>
            ) : (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {stats.booksFinished.map((book) => (
                  <li key={book.id} className="space-y-1">
                    <BookCover title={book.title} coverUrl={book.coverUrl} className="w-full" />
                    <p className="line-clamp-2 text-xs font-medium">{book.title}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      </>
    </div>
  )
}
