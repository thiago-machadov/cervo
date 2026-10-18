import { cn } from "@/lib/utils"

/** Estado vazio com ilustração desenhada à mão. */
export function DoodleEmpty({
  doodle,
  title,
  description,
  action,
  className,
}: {
  doodle: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-4 flex flex-col items-center gap-3 rounded-3xl bg-card px-6 py-8 text-center ring-1 ring-border/60", className)}>
      <div className="mb-1">{doodle}</div>
      <h3 className="font-display text-2xl font-bold text-primary">{title}</h3>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}
