"use client"

import { useTransition } from "react"
import { CrownSimpleIcon, DotsThreeVerticalIcon, ShieldCheckIcon, ShieldSlashIcon, UserMinusIcon } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
  const firstName = member.name.split(" ")[0]
  const isOwner = viewerRole === "OWNER"
  const canRemove = member.role !== "OWNER" && (isOwner || (viewerRole === "ADMIN" && member.role === "MEMBER"))
  if (!canRemove && !isOwner) return null
  if (member.role === "OWNER") return null

  function run(action: () => Promise<MemberActionResult>, confirmMessage?: string) {
    if (confirmMessage && !confirm(confirmMessage)) return
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
                `Passar o clube para ${firstName}? Você vira admin e ${firstName} passa a ser o dono.`
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
              onClick={() => run(() => removeMember(clubId, member.id), `Remover ${firstName} do clube?`)}
            >
              <UserMinusIcon /> Remover do clube
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
