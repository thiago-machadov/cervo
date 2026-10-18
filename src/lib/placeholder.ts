/** Capas/avatares sem foto: iniciais + uma cor estável escolhida a partir do nome. */

/** Paleta variada que conversa com o fundo papel (cor de fundo + cor do texto com bom contraste). */
const PALETTE = [
  { bg: "#2a47b0", fg: "#fdfcf8" }, // cobalto
  { bg: "#c8553d", fg: "#fdfcf8" }, // terracota
  { bg: "#e0a43a", fg: "#2b2112" }, // mostarda
  { bg: "#5b8c5a", fg: "#fdfcf8" }, // sálvia
  { bg: "#1f6f78", fg: "#fdfcf8" }, // petróleo
  { bg: "#7a3e65", fg: "#fdfcf8" }, // ameixa
  { bg: "#e98a7b", fg: "#3a1410" }, // coral
  { bg: "#26324d", fg: "#fdfcf8" }, // tinta
  { bg: "#9bb7d4", fg: "#18243f" }, // céu
  { bg: "#d9c7a1", fg: "#3b2f1a" }, // areia
  { bg: "#2f5d3a", fg: "#fdfcf8" }, // floresta
  { bg: "#b34a6b", fg: "#fdfcf8" }, // framboesa
] as const

/** Iniciais das duas primeiras palavras ("Torto Arado" → "TA"; "Dom" → "D"). */
export function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toLocaleUpperCase("pt-BR"))
    .join("")
}

/** "Aleatória", mas estável: o mesmo nome sempre ganha a mesma cor. */
export function colorFor(name: string) {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return PALETTE[Math.abs(hash) % PALETTE.length]!
}
