export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")
}

export const STATUS_LABEL: Record<string, string> = {
  WANT: "Quero ler",
  READING: "Lendo",
  DONE: "Lido",
}

export type ActionState = { error?: string; ok?: boolean } | undefined
