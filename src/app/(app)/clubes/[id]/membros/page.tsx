import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MemberActions } from "@/components/member-actions"
import { PageHeader } from "@/components/page-header"
import { PageSuspense } from "@/components/page-suspense"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/user-avatar"
import { getCurrentUser } from "@/lib/auth"
import { ROLE_LABEL, getClubRole } from "@/lib/clubs"
import { formatDate } from "@/lib/dates"
import { db } from "@/lib/db"

export const metadata: Metadata = { title: "Membros" }

export default function MembersPage({ params }: PageProps<"/clubes/[id]/membros">) {
  return (
    <PageSuspense>
      <MembersContent params={params} />
    </PageSuspense>
  )
}

const ROLE_ORDER = { OWNER: 0, ADMIN: 1, MEMBER: 2 } as const

async function MembersContent({ params }: Pick<PageProps<"/clubes/[id]/membros">, "params">) {
  const { id } = await params
  const user = await getCurrentUser()
  const viewerRole = await getClubRole(id, user.id)
  if (!viewerRole) notFound()

  const club = await db.club.findUnique({
    where: { id },
    select: {
      name: true,
      members: { include: { user: { select: { id: true, name: true } } }, orderBy: { joinedAt: "asc" } },
    },
  })
  if (!club) notFound()
  const members = [...club.members].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role])

  return (
    <main className="md:mx-auto md:max-w-2xl">
      <PageHeader title="Membros" subtitle={club.name} backHref={`/clubes/${id}`} />
      <div className="space-y-3 px-4 pt-2 pb-8">
        <ul className="divide-y divide-border/70 rounded-2xl bg-card ring-1 ring-border/60">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3 px-4 py-3">
              <Link href={`/pessoas/${member.user.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <UserAvatar name={member.user.name} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {member.user.name}
                    {member.user.id === user.id && <span className="font-normal text-muted-foreground"> (você)</span>}
                  </span>
                  <span className="block text-xs text-muted-foreground">desde {formatDate(member.joinedAt)}</span>
                </span>
              </Link>
              {member.role !== "MEMBER" && <Badge variant={member.role === "OWNER" ? "default" : "secondary"}>{ROLE_LABEL[member.role]}</Badge>}
              {member.user.id !== user.id && (
                <MemberActions
                  clubId={id}
                  viewerRole={viewerRole}
                  member={{ id: member.user.id, name: member.user.name, role: member.role }}
                />
              )}
            </li>
          ))}
        </ul>
        <p className="px-1 text-xs text-muted-foreground">
          O dono edita o clube, escolhe admins e pode passar o clube para outra pessoa. Admins editam o clube e removem membros.
        </p>
      </div>
    </main>
  )
}
