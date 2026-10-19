import type { Metadata } from "next"
import { InstallGuide } from "@/components/install-guide"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Como instalar o Cervo no celular",
  description: "Passo a passo para instalar o Cervo no iPhone e no Android: adicione à tela de início e use como um app, sem loja.",
  alternates: { canonical: "/instalar" },
  robots: { index: true, follow: true },
}

export default function InstallPage() {
  return (
    <main className="mx-auto max-w-2xl">
      <PageHeader title="Instalar o app" backHref="/" />
      <div className="pt-2">
        <InstallGuide />
      </div>
    </main>
  )
}
