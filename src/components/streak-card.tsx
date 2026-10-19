import { FlameDoodle, SpiralDoodle } from "@/components/doodles"
import { cn } from "@/lib/utils"

// "short" (seg, ter, qua…) em vez de "narrow" (S, T, Q…), que repete letras e confunde.
const weekdayShort = new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: "UTC" })
const weekdayLong = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })

export function StreakCard({
  current,
  longest,
  readToday,
  lastWeek,
  children,
}: {
  current: number
  longest: number
  readToday: boolean
  lastWeek: { day: string; read: boolean }[]
  children?: React.ReactNode
}) {
  return (
    <section className="relative space-y-4 overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground shadow-[0_18px_40px_-20px_oklch(0.42_0.18_266/0.8)]">
      <SpiralDoodle seed={3} turns={8} className="pointer-events-none absolute -top-10 -right-10 w-44 text-primary-foreground opacity-15" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase opacity-70">Sequência atual</p>
          <p className="flex items-baseline gap-2">
            <span className="font-display text-7xl font-bold tabular-nums">{current}</span>
            <span className="font-display text-xl">{current === 1 ? "dia" : "dias"}</span>
          </p>
        </div>
        <FlameDoodle className={cn("relative w-11 text-primary-foreground", !readToday && "opacity-40")} />
      </div>

      <ol className="grid grid-cols-7 gap-1.5" aria-label="Leitura nos últimos 7 dias">
        {lastWeek.map(({ day, read }) => {
          const date = new Date(`${day}T12:00:00Z`)
          return (
            <li key={day} className="flex flex-col items-center gap-1">
              <span
                aria-hidden
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs",
                  read ? "bg-primary-foreground font-bold text-primary" : "bg-primary-foreground/12"
                )}
              >
                {read ? "✓" : ""}
              </span>
              <span aria-hidden className="text-[0.65rem] opacity-60">
                {weekdayShort.format(date).replace(".", "")}
              </span>
              <span className="sr-only">
                {weekdayLong.format(date)}: {read ? "leu" : "não leu"}
              </span>
            </li>
          )
        })}
      </ol>

      <p className="text-sm opacity-80">
        {readToday
          ? "Leitura de hoje registrada. Bora manter o ritmo!"
          : current > 0
            ? "Faça o check-in de hoje para não perder a sequência."
            : "Registre uma leitura para começar sua sequência."}
        {longest > 0 && (
          <span className="opacity-70">
            {" "}
            · Recorde: {longest} {longest === 1 ? "dia" : "dias"}
          </span>
        )}
      </p>
      {children}
    </section>
  )
}
