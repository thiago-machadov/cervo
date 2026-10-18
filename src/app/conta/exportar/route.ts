import { exportUserData } from "@/lib/account"
import { getSessionUserId } from "@/lib/session"

/** Baixa todos os dados do usuário logado em JSON. */
export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return new Response("Faça login para exportar seus dados", { status: 401 })

  const data = await exportUserData(userId)
  const day = new Date().toISOString().slice(0, 10)
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="cervo-meus-dados-${day}.json"`,
      "cache-control": "no-store",
    },
  })
}
