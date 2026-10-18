import { TrophyIcon } from "@phosphor-icons/react/dist/ssr"
import { DeleteChallengeButton } from "@/components/delete-challenge-button"
import { UserAvatar } from "@/components/user-avatar"
import type { getClubChallenges } from "@/lib/challenges"
import { MONTHS } from "@/lib/stats"
import { cn } from "@/lib/utils"

type Challenge = Awaited<ReturnType<typeof getClubChallenges>>[number]

function shortDate(day: string) {
  const [, m, d] = day.split("-")
  return `${Number(d)} ${MONTHS[Number(m) - 1]}`
}

const STATUS_LABEL = { upcoming: "Começa em breve", active: "Em andamento", ended: "Terminou" } as const

/** Lista de desafios do clube com o progresso de cada membro. */
export function ClubChallenges({ challenges, viewerId, canManage }: { challenges: Challenge[]; viewerId: string; canManage: boolean }) {
  return (
    <div className="space-y-3">
      {challenges.map((challenge) => {
        const mine = challenge.progress.find((p) => p.userId === viewerId)
        return (
          <section key={challenge.id} className="space-y-3 rounded-2xl bg-card p-4 ring-1 ring-border/60">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <TrophyIcon className="size-5" weight="fill" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{challenge.title}</p>
                <p className="text-xs text-muted-foreground">
                  {STATUS_LABEL[challenge.status as keyof typeof STATUS_LABEL]} · {shortDate(challenge.startsOn)} a{" "}
                  {shortDate(challenge.endsOn)} · meta de {challenge.targetDays} {challenge.targetDays === 1 ? "dia" : "dias"}
                </p>
              </div>
              {canManage && <DeleteChallengeButton challengeId={challenge.id} />}
            </div>

            {mine && (
              <div className="space-y-1">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, (mine.days / challenge.targetDays) * 100)}%` }}
                  />
                </div>
                <p className="text-xs">
                  {mine.done
                    ? "Você completou o desafio! 🏆"
                    : `Você leu em ${mine.days} de ${challenge.targetDays} dias`}
                </p>
              </div>
            )}

            <ol className="space-y-2">
              {challenge.progress.slice(0, 5).map((p) => (
                <li key={p.userId} className={cn("flex items-center gap-2 text-sm", p.userId === viewerId && "font-semibold")}>
                  <UserAvatar name={p.name} className="size-6 text-[0.6rem]" />
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {p.days}/{challenge.targetDays}
                  </span>
                  {p.done && <TrophyIcon className="size-4 text-primary" weight="fill" aria-label="Completou" />}
                </li>
              ))}
            </ol>
            {challenge.finishers > 0 && (
              <p className="text-xs text-muted-foreground">
                {challenge.finishers} {challenge.finishers === 1 ? "pessoa completou" : "pessoas completaram"}
              </p>
            )}
          </section>
        )
      })}
    </div>
  )
}
