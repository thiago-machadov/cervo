import { SparkleIcon } from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"

/** Selo "Pro" ao lado do nome de quem assina (ou é fundador). */
export function ProBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 align-middle text-[0.6rem] font-bold tracking-wider text-primary-foreground uppercase",
        className
      )}
    >
      <SparkleIcon className="size-2.5" weight="fill" /> Pro
    </span>
  )
}
