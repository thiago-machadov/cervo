import type { Metadata } from "next"
import { FeedbackForm } from "@/components/feedback-form"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "Feedback" }

export default function FeedbackPage() {
  return (
    <main className="md:mx-auto md:max-w-2xl">
      <PageHeader title="Feedback" backHref="/perfil" />
      <div className="space-y-4 px-4 pt-2 pb-8">
        <p className="text-sm text-muted-foreground">
          Achou um problema, teve uma ideia ou quer só dizer oi? O Cervo está começando e sua opinião muda o que vem a seguir.
        </p>
        <FeedbackForm />
      </div>
    </main>
  )
}
