import Link from "next/link"
import { EyeDoodle, ThreadDoodle } from "@/components/doodles"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <EyeDoodle className="w-36" />
      <h1 className="font-display text-6xl font-bold text-primary">Página perdida</h1>
      <p className="text-sm text-muted-foreground">Procuramos em todas as estantes e não encontramos essa página.</p>
      <ThreadDoodle className="w-56 opacity-60" />
      <Button size="lg" className="mt-2 h-12 px-6" render={<Link href="/" />} nativeButton={false}>
        Voltar para o início
      </Button>
    </main>
  )
}
