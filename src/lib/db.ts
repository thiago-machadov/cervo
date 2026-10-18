import "server-only"
import { cache } from "react"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/generated/prisma/client"

function createClient(options: { connectionString?: string; singleUse?: boolean } = {}) {
  const connectionString = options.connectionString ?? process.env.DATABASE_URL
  if (!connectionString) throw new Error("DATABASE_URL não configurada")
  // maxUses: 1 descarta cada conexão após o uso (o Worker não pode reaproveitá-la em outro request).
  const adapter = new PrismaPg({ connectionString, ...(options.singleUse ? { maxUses: 1 } : {}) })
  return new PrismaClient({ adapter })
}

/**
 * No Cloudflare Workers, conexões (sockets) não podem ser reaproveitadas entre requests,
 * então criamos um cliente por request (deduplicado com `cache` do React). A conexão vai para
 * o Hyperdrive, que fica no mesmo datacenter e mantém as conexões com o Supabase já abertas,
 * então abrir uma por request é barato.
 * No Node (dev/local) mantemos um único cliente compartilhado.
 */
const isWorkers = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers"

const getRequestClient = cache(() =>
  createClient({ connectionString: getCloudflareContext().env.HYPERDRIVE.connectionString, singleUse: true })
)

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function getClient(): PrismaClient {
  if (isWorkers) return getRequestClient()
  globalForPrisma.prisma ??= createClient()
  return globalForPrisma.prisma
}

/** Acesso ao Prisma; resolve o cliente certo para o ambiente a cada uso. */
export const db = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getClient()
    const value = Reflect.get(client, prop)
    return typeof value === "function" ? value.bind(client) : value
  },
})
