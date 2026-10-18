export type GoalType = "PAGES" | "MINUTES"

export const GOAL_PRESETS: Record<GoalType, number[]> = {
  PAGES: [10, 20, 30, 50],
  MINUTES: [15, 30, 45, 60],
}

export function goalUnit(type: string | null | undefined, value: number) {
  if (type === "MINUTES") return value === 1 ? "minuto" : "minutos"
  return value === 1 ? "página" : "páginas"
}
