/** Cores do app (recurso Pro). O valor vai no data-accent do <html>; ver globals.css. */
export const ACCENTS = [
  { id: "cobalto", label: "Cobalto", swatch: "oklch(0.42 0.18 266)" },
  { id: "floresta", label: "Floresta", swatch: "oklch(0.42 0.18 152)" },
  { id: "petroleo", label: "Petróleo", swatch: "oklch(0.42 0.18 215)" },
  { id: "ameixa", label: "Ameixa", swatch: "oklch(0.42 0.18 320)" },
  { id: "vinho", label: "Vinho", swatch: "oklch(0.42 0.18 12)" },
  { id: "terracota", label: "Terracota", swatch: "oklch(0.42 0.18 45)" },
] as const

export type AccentId = (typeof ACCENTS)[number]["id"]

export const ACCENT_COOKIE = "cervo-accent"

export function isAccent(value: unknown): value is AccentId {
  return ACCENTS.some((a) => a.id === value)
}

/** Aplica a cor no <html> e guarda num cookie para a próxima abertura não piscar em cobalto. */
export function applyAccent(accent: AccentId | null) {
  const root = document.documentElement
  if (!accent || accent === "cobalto") {
    delete root.dataset.accent
    document.cookie = `${ACCENT_COOKIE}=; path=/; max-age=0; samesite=lax`
  } else {
    root.dataset.accent = accent
    document.cookie = `${ACCENT_COOKIE}=${accent}; path=/; max-age=31536000; samesite=lax`
  }
}
