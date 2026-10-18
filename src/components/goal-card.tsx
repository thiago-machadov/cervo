import Link from "next/link"
import { TargetIcon } from "@phosphor-icons/react/dist/ssr"
import { StampFrame, StarDoodle, SunDoodle } from "@/components/doodles"
import { goalUnit } from "@/lib/goals"

export function GoalCard({
  goalType,
  dailyGoal,
  pagesToday,
  minutesToday,
}: {
  goalType: string | null
  dailyGoal: number | null
  pagesToday: number
  minutesToday: number
}) {
  if (!dailyGoal) {
    return (
      <Link href="/perfil" className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/60">
        <TargetIcon className="size-5 text-primary" />
        <span className="text-sm">
          Defina uma <span className="font-semibold text-primary">meta diária</span> no seu perfil
        </span>
      </Link>
    )
  }

  const done = goalType === "MINUTES" ? minutesToday : pagesToday
  const percent = Math.min(100, Math.round((done / dailyGoal) * 100))
  const remaining = Math.max(0, dailyGoal - done)

  return (
    <div className="relative space-y-3 overflow-hidden rounded-2xl bg-card p-4 ring-1 ring-border/60">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-semibold tracking-widest text-primary uppercase">Meta de hoje</p>
          <p className="flex items-baseline gap-1">
            <span className="font-display text-3xl font-bold text-primary tabular-nums">{done}</span>
            <span className="font-display text-lg text-muted-foreground">/ {dailyGoal}</span>
            <span className="ml-1 text-sm text-muted-foreground">{goalUnit(goalType, dailyGoal)}</span>
          </p>
        </div>
        {remaining === 0 ? (
          <StampFrame className="h-20 w-15 shrink-0 -rotate-6">
            <StarDoodle className="w-4" />
            <span className="font-display text-[0.55rem] leading-none">
              Meta
              <br />
              batida
            </span>
          </StampFrame>
        ) : (
          <div className="flex shrink-0 items-center gap-2 pb-1">
            <span className="text-xs font-medium text-muted-foreground">Faltam {remaining}</span>
            <SunDoodle className="w-8 opacity-80" />
          </div>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
