import type { Metadata } from "next"
import { InstallGuide } from "@/components/install-guide"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "Instalar o app" }

export default function InstallPage() {
  return (
    <main>
      <PageHeader title="Instalar o app" backHref="/perfil" />
      <div className="pt-2">
        <InstallGuide />
      </div>
    </main>
  )
}
