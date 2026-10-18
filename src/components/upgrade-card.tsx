import Link from "next/link"
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Convite para assinar o Pro quando a pessoa esbarra num limite do plano grátis. */
export function UpgradeCard({
  title,
  description,
  className,
}: {
  title: string
  description: string
  className?: string
}) {
  return (
    <div className={cn("space-y-3 rounded-2xl bg-secondary p-4 text-left text-secondary-foreground", className)}>
      <p className="flex items-center gap-2 font-semibold">
        <SparkleIcon className="size-5 text-primary" weight="fill" /> {title}
      </p>
      <p className="text-sm">{description}</p>
      <Button className="h-10 w-full" render={<Link href="/assinatura" />} nativeButton={false}>
        Conhecer o Cervo Pro
      </Button>
    </div>
  )
}
