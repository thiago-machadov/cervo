import type { Metadata } from "next"
import Link from "next/link"
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr"
import { DoodleEmpty } from "@/components/doodle-empty"
import { FlockDoodle } from "@/components/doodles"
import { FriendButton } from "@/components/friend-button"
import { PageHeader } from "@/components/page-header"
import { PageSuspense } from "@/components/page-suspense"
import { ShareProfileButton } from "@/components/share-profile-button"
import { UserAvatar } from "@/components/user-avatar"
import { getCurrentUser } from "@/lib/auth"
import { timeAgo } from "@/lib/dates"
import { getFriendsOverview } from "@/lib/friends"

export const metadata: Metadata = { title: "Amigos" }

export default function FriendsPage() {
  return (
    <main className="md:mx-auto md:max-w-2xl">
      <PageHeader title="Amigos" backHref="/feed" />
      <PageSuspense>
        <FriendsContent />
      </PageSuspense>
    </main>
  )
}

function PersonRow({ user, children, hint }: { user: { id: string; name: string }; children?: React.ReactNode; hint?: string }) {
  return (
    <li className="space-y-3 px-4 py-3">
      <Link href={`/pessoas/${user.id}`} className="flex items-center gap-3 transition-opacity active:opacity-70">
        <UserAvatar name={user.name} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{user.name}</span>
          {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
        </span>
        {!children && <CaretRightIcon className="size-4 text-muted-foreground" />}
      </Link>
      {children}
    </li>
  )
}

async function FriendsContent() {
  const user = await getCurrentUser()
  const { friends, received, sent } = await getFriendsOverview(user.id)
  const list = "divide-y divide-border/70 overflow-hidden rounded-2xl bg-card ring-1 ring-border/60"

  return (
    <div className="space-y-6 px-4 pt-2 pb-8">
      <div className="space-y-2">
        <ShareProfileButton userId={user.id} />
        <p className="text-center text-xs text-muted-foreground">
          Amizade sempre por pedido: a outra pessoa precisa aceitar. Amigos veem a leitura um do outro no feed.
        </p>
      </div>

      {received.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-base font-bold">Pedidos recebidos ({received.length})</h2>
          <ul className={list}>
            {received.map((r) => (
              <PersonRow key={r.friendshipId} user={r.user} hint={`pediu ${timeAgo(r.createdAt)}`}>
                <FriendButton targetId={r.user.id} state={{ kind: "received", friendshipId: r.friendshipId }} size="sm" />
              </PersonRow>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-base font-bold">{friends.length === 0 ? "Seus amigos" : `Seus amigos (${friends.length})`}</h2>
        {friends.length === 0 ? (
          <DoodleEmpty
            doodle={<FlockDoodle className="w-40" />}
            title="Ninguém por aqui ainda"
            description="Mande seu link para quem você quer acompanhar, ou adicione alguém pelo perfil dentro de um clube."
          />
        ) : (
          <ul className={list}>
            {friends.map((f) => (
              <PersonRow key={f.friendshipId} user={f.user} />
            ))}
          </ul>
        )}
      </section>

      {sent.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-base font-bold">Pedidos enviados</h2>
          <ul className={list}>
            {sent.map((r) => (
              <PersonRow key={r.friendshipId} user={r.user} hint={`aguardando resposta · ${timeAgo(r.createdAt)}`}>
                <FriendButton targetId={r.user.id} state={{ kind: "sent", friendshipId: r.friendshipId }} size="sm" className="w-full" />
              </PersonRow>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
