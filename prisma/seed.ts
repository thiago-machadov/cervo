/**
 * Dados de exemplo para desenvolvimento: `npm run db:seed`.
 * Cria os usuários no Supabase Auth (precisa de SUPABASE_SECRET_KEY) e os perfis via Prisma.
 * Contas de teste (todas com a senha TEST_PASSWORD abaixo):
 *   ana@teste.local, bruno@teste.local
 */
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { createClient } from "@supabase/supabase-js"
import { PrismaClient } from "../src/generated/prisma/client"
import type { GoalType } from "../src/generated/prisma/enums"
import { dayKey, shiftDay } from "../src/lib/dates"

export const TEST_PASSWORD = "leitura-teste-123"

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const secretKey = process.env.SUPABASE_SECRET_KEY
if (!supabaseUrl || !secretKey) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY para rodar o seed")
const admin = createClient(supabaseUrl, secretKey, { auth: { persistSession: false, autoRefreshToken: false } })

/** Usuário no Supabase Auth (já confirmado) + perfil do app com o mesmo id. */
async function seedUser(email: string, name: string, goalType: GoalType, dailyGoal: number) {
  const created = await admin.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { name },
  })
  let id = created.data.user?.id
  if (!id) {
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 })
    id = data.users.find((user) => user.email === email)?.id
  }
  if (!id) throw new Error(`Não foi possível criar ${email}: ${created.error?.message}`)

  return db.user.upsert({
    where: { id },
    update: {},
    create: { id, name, email, goalType, dailyGoal, onboardedAt: new Date() },
  })
}

async function main() {
  const today = dayKey()

  const ana = await seedUser("ana@teste.local", "Ana Souza", "PAGES", 20)
  const bruno = await seedUser("bruno@teste.local", "Bruno Lima", "MINUTES", 30)

  if (await db.club.findFirst({ where: { ownerId: ana.id } })) {
    console.log("Seed já aplicado.")
    return
  }

  const book = await db.book.create({
    data: { title: "Torto Arado", author: "Itamar Vieira Junior", totalPages: 264, createdById: ana.id },
  })
  await db.book.create({
    data: {
      title: "Dom Casmurro",
      author: "Machado de Assis",
      totalPages: 208,
      createdById: ana.id,
      libraryItems: { create: { userId: ana.id, status: "WANT" } },
    },
  })

  const started = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  await db.club.create({
    data: {
      name: "Leitores de Domingo",
      description: "Um livro por mês, sem pressão (mas com streak).",
      ownerId: ana.id,
      bookId: book.id,
      bookStartedAt: started,
      weeklyPages: 70,
      members: { create: [{ userId: ana.id, role: "OWNER" }, { userId: bruno.id }] },
    },
  })

  // Ana leu nos últimos 5 dias; Bruno em 3 dias alternados.
  const plan: [string, number[]][] = [
    [ana.id, [-4, -3, -2, -1, 0]],
    [bruno.id, [-5, -3, -1]],
  ]
  for (const [userId, days] of plan) {
    let page = 0
    for (const offset of days) {
      const toPage = page + 12 + Math.abs(offset) * 2
      const day = shiftDay(today, offset)
      await db.checkIn.create({
        data: {
          userId,
          bookId: book.id,
          fromPage: page,
          toPage,
          pagesRead: toPage - page,
          minutes: userId === bruno.id ? 25 + Math.abs(offset) * 5 : null,
          day,
          createdAt: new Date(`${day}T22:00:00Z`),
          note: offset === 0 ? "Que capítulo! A relação das irmãs tá cada vez mais tensa." : null,
        },
      })
      page = toPage
    }
    await db.libraryItem.create({
      data: { userId, bookId: book.id, status: "READING", currentPage: page, startedAt: started },
    })
  }

  console.log("Seed aplicado.")
}

main().finally(() => db.$disconnect())
