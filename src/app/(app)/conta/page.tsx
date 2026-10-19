import type { Metadata } from "next"
import Link from "next/link"
import { CaretRightIcon, DownloadSimpleIcon, FileTextIcon, ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr"
import { DeleteAccountForm } from "@/components/delete-account-form"
import { PageHeader } from "@/components/page-header"
import { PageSuspense } from "@/components/page-suspense"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"

export const metadata: Metadata = { title: "Privacidade e conta" }

export default function AccountPage() {
  return (
    <main className="md:mx-auto md:max-w-2xl">
      <PageHeader title="Privacidade e conta" backHref="/perfil" />
      <PageSuspense>
        <AccountContent />
      </PageSuspense>
    </main>
  )
}

const row = "flex items-center gap-3 px-4 py-3 transition-colors active:bg-muted"

async function AccountContent() {
  const user = await getCurrentUser({ requireAccess: false })
  const ownedClubs = await db.club.count({ where: { ownerId: user.id } })

  return (
    <div className="space-y-6 px-4 pt-2 pb-8">
      <section className="space-y-2">
        <h2 className="text-base font-bold">Seus dados</h2>
        <div className="divide-y divide-border/70 overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
          {/* Link normal (não <Link>): é um download de arquivo, não uma página. */}
          <a href="/conta/exportar" download className={row}>
            <DownloadSimpleIcon className="size-5 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Baixar meus dados</span>
              <span className="block text-xs text-muted-foreground">Tudo o que o Cervo guarda sobre você, em JSON</span>
            </span>
          </a>
          <Link href="/privacidade" className={row}>
            <ShieldCheckIcon className="size-5 text-primary" />
            <span className="flex-1 text-sm font-semibold">Política de privacidade</span>
            <CaretRightIcon className="size-4 text-muted-foreground" />
          </Link>
          <Link href="/termos" className={row}>
            <FileTextIcon className="size-5 text-primary" />
            <span className="flex-1 text-sm font-semibold">Termos de uso</span>
            <CaretRightIcon className="size-4 text-muted-foreground" />
          </Link>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">Zona de perigo</h2>
        <DeleteAccountForm ownedClubs={ownedClubs} />
      </section>
    </div>
  )
}
