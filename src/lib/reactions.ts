/** Reações disponíveis no feed (ordem de exibição). */
export const REACTIONS = ["🔥", "👏", "❤️", "📚", "😮"] as const
export type ReactionEmoji = (typeof REACTIONS)[number]

export type ReactionSummary = { emoji: ReactionEmoji; count: number; mine: boolean }

export function isReaction(value: string): value is ReactionEmoji {
  return (REACTIONS as readonly string[]).includes(value)
}

/** Agrupa as reações de um check-in por emoji, marcando as do usuário atual. */
export function summarizeReactions(reactions: { emoji: string; userId: string }[], viewerId: string): ReactionSummary[] {
  return REACTIONS.map((emoji) => {
    const matching = reactions.filter((r) => r.emoji === emoji)
    return { emoji, count: matching.length, mine: matching.some((r) => r.userId === viewerId) }
  }).filter((r) => r.count > 0)
}
