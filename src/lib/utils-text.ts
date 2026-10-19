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

/** `values` devolve o que foi digitado quando há erro (o React limpa o formulário após a action). */
export type ActionState = { error?: string; ok?: boolean; values?: Record<string, string> } | undefined

/** Campos de texto de um FormData (ignora arquivos), para devolver em caso de erro. */
export function formValues(formData: FormData): Record<string, string> {
  return Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>
}
