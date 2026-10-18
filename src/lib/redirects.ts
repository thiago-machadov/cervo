/** Só aceita caminhos internos para evitar open redirect. */
export function safeNext(value: FormDataEntryValue | string | null | undefined) {
  const next = typeof value === "string" ? value : ""
  return next.startsWith("/") && !next.startsWith("//") ? next : "/"
}

export function withNext(path: string, next: string) {
  return next && next !== "/" ? `${path}?next=${encodeURIComponent(next)}` : path
}
