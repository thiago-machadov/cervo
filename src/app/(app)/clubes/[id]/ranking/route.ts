import { getClubRole } from "@/lib/clubs"
import { getClubDetail } from "@/lib/queries"
import { getSessionUserId } from "@/lib/session"

function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? "")
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Exporta o ranking do clube em CSV (dono e admins). */
export async function GET(_request: Request, { params }: RouteContext<"/clubes/[id]/ranking">) {
  const { id } = await params
  const userId = await getSessionUserId()
  if (!userId) return new Response("Faça login", { status: 401 })

  const role = await getClubRole(id, userId)
  if (role !== "OWNER" && role !== "ADMIN") return new Response("Só o dono e os admins exportam o ranking", { status: 403 })
  const data = await getClubDetail(id, userId)
  if (!data) return new Response("Clube não encontrado", { status: 404 })

  const { club, ranking, freeReading } = data
  const header = ["posição", "nome", "páginas", "dias com check-in", "sequência atual", freeReading ? "lendo agora" : "página atual"]
  const rows = ranking.map((row, index) => [
    index + 1,
    row.user.name,
    row.pages,
    row.days,
    row.streak,
    freeReading ? (row.currentBook ?? "") : row.currentPage,
  ])
  // BOM no início para o Excel abrir os acentos corretamente.
  const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n")
  const slug = club.name.normalize("NFD").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "clube"

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="ranking-${slug}.csv"`,
      "cache-control": "no-store",
    },
  })
}
