"use server"

import { refresh } from "next/cache"
import { Prisma } from "@/generated/prisma/client"
import { requireUserId } from "@/lib/auth"
import { db } from "@/lib/db"
import { findFriendship } from "@/lib/friends"

export type FriendActionResult = { ok?: true; message?: string; error?: string }

/**
 * Pede amizade. Se a outra pessoa já tinha pedido, aceita o pedido dela na hora
 * (os dois lados quiseram). Pedir de novo para quem você já pediu não faz nada.
 */
export async function sendFriendRequest(targetId: string): Promise<FriendActionResult> {
  const userId = await requireUserId()
  if (targetId === userId) return { error: "Você não pode adicionar a si mesmo" }

  const target = await db.user.findUnique({ where: { id: targetId }, select: { id: true } })
  if (!target) return { error: "Leitor não encontrado" }

  const existing = await findFriendship(userId, targetId)
  if (existing?.status === "ACCEPTED") return { ok: true, message: "Vocês já são amigos" }
  if (existing && existing.requesterId === userId) return { ok: true, message: "Pedido já enviado" }
  if (existing) {
    await db.friendship.update({ where: { id: existing.id }, data: { status: "ACCEPTED", acceptedAt: new Date() } })
    refresh()
    return { ok: true, message: "Agora vocês são amigos!" }
  }

  try {
    await db.friendship.create({ data: { requesterId: userId, addresseeId: targetId } })
  } catch (error) {
    // Dois cliques simultâneos: o pedido já existe.
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error
  }
  refresh()
  return { ok: true, message: "Pedido de amizade enviado" }
}

/** Aceita ou recusa um pedido recebido. Só quem recebeu pode responder. */
export async function respondFriendRequest(friendshipId: string, accept: boolean): Promise<FriendActionResult> {
  const userId = await requireUserId()
  const request = await db.friendship.findFirst({ where: { id: friendshipId, addresseeId: userId, status: "PENDING" } })
  if (!request) return { error: "Pedido não encontrado" }

  if (accept) {
    await db.friendship.update({ where: { id: request.id }, data: { status: "ACCEPTED", acceptedAt: new Date() } })
  } else {
    await db.friendship.delete({ where: { id: request.id } })
  }
  refresh()
  return { ok: true, message: accept ? "Agora vocês são amigos!" : "Pedido recusado" }
}

/** Cancela um pedido enviado ou desfaz uma amizade (qualquer um dos dois pode). */
export async function removeFriendship(friendshipId: string): Promise<FriendActionResult> {
  const userId = await requireUserId()
  const { count } = await db.friendship.deleteMany({
    where: { id: friendshipId, OR: [{ requesterId: userId }, { addresseeId: userId }] },
  })
  if (count === 0) return { error: "Amizade não encontrada" }
  refresh()
  return { ok: true }
}
