import "server-only"
import { db } from "@/lib/db"

/** Situação da amizade do ponto de vista de quem está vendo. */
export type FriendState =
  | { kind: "self" }
  | { kind: "none" }
  | { kind: "friends"; friendshipId: string }
  | { kind: "sent"; friendshipId: string }
  | { kind: "received"; friendshipId: string }

/** A linha de amizade entre duas pessoas, em qualquer direção. */
export function findFriendship(a: string, b: string) {
  return db.friendship.findFirst({
    where: {
      OR: [
        { requesterId: a, addresseeId: b },
        { requesterId: b, addresseeId: a },
      ],
    },
  })
}

export async function getFriendState(viewerId: string, otherId: string): Promise<FriendState> {
  if (viewerId === otherId) return { kind: "self" }
  const friendship = await findFriendship(viewerId, otherId)
  if (!friendship) return { kind: "none" }
  if (friendship.status === "ACCEPTED") return { kind: "friends", friendshipId: friendship.id }
  return friendship.requesterId === viewerId
    ? { kind: "sent", friendshipId: friendship.id }
    : { kind: "received", friendshipId: friendship.id }
}

/** Ids dos amigos (pedidos aceitos) do usuário. */
export async function getFriendIds(userId: string) {
  const rows = await db.friendship.findMany({
    where: { status: "ACCEPTED", OR: [{ requesterId: userId }, { addresseeId: userId }] },
    select: { requesterId: true, addresseeId: true },
  })
  return rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId))
}

export function countPendingRequests(userId: string) {
  return db.friendship.count({ where: { addresseeId: userId, status: "PENDING" } })
}

const userSelect = { select: { id: true, name: true } } as const

/** Amigos, pedidos recebidos e pedidos enviados (tela /amigos). */
export async function getFriendsOverview(userId: string) {
  const rows = await db.friendship.findMany({
    where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
    include: { requester: userSelect, addressee: userSelect },
    orderBy: { createdAt: "desc" },
  })

  const friends = rows
    .filter((r) => r.status === "ACCEPTED")
    .map((r) => ({ friendshipId: r.id, user: r.requesterId === userId ? r.addressee : r.requester }))
    .sort((a, b) => a.user.name.localeCompare(b.user.name, "pt-BR"))
  const received = rows
    .filter((r) => r.status === "PENDING" && r.addresseeId === userId)
    .map((r) => ({ friendshipId: r.id, user: r.requester, createdAt: r.createdAt }))
  const sent = rows
    .filter((r) => r.status === "PENDING" && r.requesterId === userId)
    .map((r) => ({ friendshipId: r.id, user: r.addressee, createdAt: r.createdAt }))

  return { friends, received, sent }
}
