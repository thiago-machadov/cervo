"use server"

import { redirect } from "next/navigation"
import { deleteAccount } from "@/lib/account"
import { requireUserId } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ActionState } from "@/lib/utils-text"

export async function deleteMyAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "EXCLUIR") {
    return { error: "Digite EXCLUIR para confirmar" }
  }

  await deleteAccount(userId)
  // A sessão já não vale (o usuário não existe mais); isso só limpa os cookies.
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut({ scope: "local" })
  redirect("/boas-vindas?conta=excluida")
}
