"use client"

import { useTransition } from "react"
import { CrownSimpleIcon, DotsThreeVerticalIcon, ShieldCheckIcon, ShieldSlashIcon, UserMinusIcon } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useConfirm } from "@/components/confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { removeMember, setMemberRole, transferOwnership, type MemberActionResult } from "@/app/actions/clubs"

type Role = "OWNER" | "ADMIN" | "MEMBER"

/** Menu de ações sobre um membro, conforme o papel de quem está vendo. */
export function MemberActions({
  clubId,
  member,
  viewerRole,
}: {
  clubId: string
  member: { id: string; name: string; role: Role }
  viewerRole: Role
}) {
  const [pending, startTransition] = useTransition()
  const confirm = useConfirm()
  const firstName = member.name.split(" ")[0]
  const isOwner = viewerRole === "OWNER"
  const canRemove = member.role !== "OWNER" && (isOwner || (viewerRole === "ADMIN" && member.role === "MEMBER"))
  if (!canRemove && !isOwner) return null
  if (member.role === "OWNER") return null

  async function run(
    action: () => Promise<MemberActionResult>,
    ask?: { title: string; description: string; confirmLabel: string; destructive?: boolean }
  ) {
    if (ask && !(await confirm(ask))) return
    startTransition(async () => {
      const result = await action()
      if (result.error) toast.error(result.error)
      else if (result.message) toast.success(result.message)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-lg" disabled={pending} aria-label={`Ações para ${member.name}`} />}>
        <DotsThreeVerticalIcon weight="bold" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {isOwner && member.role === "MEMBER" && (
          <DropdownMenuItem onClick={() => run(() => setMemberRole(clubId, member.id, "ADMIN"))}>
            <ShieldCheckIcon /> Tornar admin
          </DropdownMenuItem>
        )}
        {isOwner && member.role === "ADMIN" && (
          <DropdownMenuItem onClick={() => run(() => setMemberRole(clubId, member.id, "MEMBER"))}>
            <ShieldSlashIcon /> Tirar de admin
          </DropdownMenuItem>
        )}
        {isOwner && (
          <DropdownMenuItem
            onClick={() =>
              run(
                () => transferOwnership(clubId, member.id),
                {
                  title: `Passar o clube para ${firstName}?`,
                  description: `${firstName} passa a ser o dono e você vira admin.`,
                  confirmLabel: "Passar o clube",
                }
              )
            }
          >
            <CrownSimpleIcon /> Passar o clube
          </DropdownMenuItem>
        )}
        {canRemove && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() =>
                run(() => removeMember(clubId, member.id), {
                  title: `Remover ${firstName} do clube?`,
                  description: "A pessoa sai do ranking e do feed do clube. Ela pode voltar se receber um novo convite.",
                  confirmLabel: "Remover",
                  destructive: true,
                })
              }
            >
              <UserMinusIcon /> Remover do clube
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
