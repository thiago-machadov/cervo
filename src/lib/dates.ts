/** Fuso usado para definir "o dia" de um check-in (base dos streaks). */
export const APP_TIME_ZONE = "America/Sao_Paulo"

/** Data local no formato YYYY-MM-DD. */
export function dayKey(date: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

/** Soma `delta` dias a uma chave YYYY-MM-DD. */
export function shiftDay(key: string, delta: number) {
  const [y, m, d] = key.split("-").map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + delta))
  return date.toISOString().slice(0, 10)
}

/** Streak atual (terminando hoje ou ontem) e maior streak, a partir dos dias com check-in. */
export function computeStreaks(days: Iterable<string>, today = dayKey()) {
  const set = new Set(days)

  let current = 0
  let cursor = set.has(today) ? today : shiftDay(today, -1)
  while (set.has(cursor)) {
    current++
    cursor = shiftDay(cursor, -1)
  }

  let longest = 0
  let run = 0
  let prev: string | null = null
  for (const day of [...set].sort()) {
    run = prev && shiftDay(prev, 1) === day ? run + 1 : 1
    longest = Math.max(longest, run)
    prev = day
  }

  return { current, longest, readToday: set.has(today) }
}

const relative = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" })

export function timeAgo(date: Date) {
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ]
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  }
  return "agora"
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: APP_TIME_ZONE,
    day: "2-digit",
    month: "short",
  }).format(date)
}
