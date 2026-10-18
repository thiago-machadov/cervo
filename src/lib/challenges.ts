import "server-only"
import { dayKey, shiftDay } from "@/lib/dates"
import { db } from "@/lib/db"

/** Desafios ativos e recém-terminados (últimos 7 dias) do clube, com o progresso de cada membro. */
export async function getClubChallenges(clubId: string, members: { userId: string; name: string }[]) {
  const today = dayKey()
  const challenges = await db.clubChallenge.findMany({
    where: { clubId, endsOn: { gte: shiftDay(today, -7) } },
    orderBy: [{ endsOn: "asc" }, { createdAt: "asc" }],
  })
  if (challenges.length === 0) return []

  const from = challenges.reduce((min, c) => (c.startsOn < min ? c.startsOn : min), challenges[0]!.startsOn)
  const to = challenges.reduce((max, c) => (c.endsOn > max ? c.endsOn : max), challenges[0]!.endsOn)
  const checkIns = await db.checkIn.findMany({
    where: { userId: { in: members.map((m) => m.userId) }, day: { gte: from, lte: to } },
    select: { userId: true, day: true },
  })

  return challenges.map((challenge) => {
    const progress = members
      .map((member) => {
        const days = new Set(
          checkIns
            .filter((c) => c.userId === member.userId && c.day >= challenge.startsOn && c.day <= challenge.endsOn)
            .map((c) => c.day)
        ).size
        return { ...member, days, done: days >= challenge.targetDays }
      })
      .sort((a, b) => b.days - a.days || a.name.localeCompare(b.name, "pt-BR"))
    const status = today < challenge.startsOn ? "upcoming" : today > challenge.endsOn ? "ended" : "active"
    return { ...challenge, status, progress, finishers: progress.filter((p) => p.done).length }
  })
}

/** Número de dias de um período AAAA-MM-DD (inclusive). */
export function periodLength(startsOn: string, endsOn: string) {
  const ms = new Date(`${endsOn}T12:00:00Z`).getTime() - new Date(`${startsOn}T12:00:00Z`).getTime()
  return Math.round(ms / 86_400_000) + 1
}
