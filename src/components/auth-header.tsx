import Link from "next/link"
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"

export function AuthHeader({ title, subtitle, next }: { title: string; subtitle: string; next?: string }) {
  const query = next ? `?next=${encodeURIComponent(next)}` : ""
  return (
    <div className="mb-8 space-y-6">
      <Button
        variant="ghost"
        size="icon-lg"
        className="-ml-2 text-primary"
        render={<Link href={`/boas-vindas${query}`} />}
        nativeButton={false}
      >
        <CaretLeftIcon className="size-5" />
        <span className="sr-only">Voltar</span>
      </Button>
      <div className="space-y-2">
        <h1 className="font-display text-4xl font-bold text-primary">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}
