import { cn } from "@/lib/utils"

/** Variações da capa genérica, todas dentro da paleta cobalto/papel. */
const styles = [
  "bg-primary text-primary-foreground",
  "bg-secondary text-primary",
  "bg-[oklch(0.9_0.01_95)] text-primary",
  "bg-[oklch(0.32_0.14_266)] text-primary-foreground",
]

function styleFor(title: string) {
  let hash = 0
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return styles[Math.abs(hash) % styles.length]
}

export function BookCover({
  title,
  coverUrl,
  className,
}: {
  title: string
  coverUrl?: string | null
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative aspect-[2/3] w-12 shrink-0 overflow-hidden rounded-lg shadow-[0_6px_14px_-6px_rgb(30_40_120/0.35)] ring-1 ring-black/5 @container",
        !coverUrl && styleFor(title),
        className
      )}
    >
      {coverUrl ? (
        // Capas vêm de URLs arbitrárias informadas pelo usuário, então não usamos next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt={`Capa de ${title}`} className="size-full object-cover" />
      ) : (
        <>
          <span className="halftone absolute inset-x-0 bottom-0 h-1/2 opacity-25 [mask-image:linear-gradient(to_top,black,transparent)]" />
          <span className="font-display absolute inset-x-0 top-0 line-clamp-4 p-[8%] text-[clamp(0.55rem,18cqw,1.6rem)] font-bold break-words">
            {title}
          </span>
        </>
      )}
    </div>
  )
}
