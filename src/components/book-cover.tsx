import { cn } from "@/lib/utils"
import { colorFor, initialsOf } from "@/lib/placeholder"

export function BookCover({
  title,
  coverUrl,
  className,
}: {
  title: string
  coverUrl?: string | null
  className?: string
}) {
  const color = colorFor(title)

  return (
    <div
      className={cn(
        "@container relative aspect-[2/3] w-12 shrink-0 overflow-hidden rounded-lg shadow-[0_6px_14px_-6px_rgb(30_40_120/0.35)] ring-1 ring-black/5",
        className
      )}
      style={coverUrl ? undefined : { backgroundColor: color.bg, color: color.fg }}
    >
      {coverUrl ? (
        // Capas vêm de URLs arbitrárias informadas pelo usuário, então não usamos next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt={`Capa de ${title}`} className="size-full object-cover" />
      ) : (
        <span
          role="img"
          aria-label={`Capa de ${title}`}
          className="font-display absolute inset-0 flex items-center justify-center text-[34cqw] font-bold leading-none"
        >
          {initialsOf(title)}
        </span>
      )}
    </div>
  )
}

/** Avatar quadrado de clube: iniciais do nome sobre a cor do clube. */
export function ClubTile({ name, className }: { name: string; className?: string }) {
  const color = colorFor(name)
  return (
    <div
      className={cn("@container relative aspect-square w-14 shrink-0 overflow-hidden rounded-2xl", className)}
      style={{ backgroundColor: color.bg, color: color.fg }}
      role="img"
      aria-label={`Clube ${name}`}
    >
      <span className="font-display absolute inset-0 flex items-center justify-center text-[36cqw] font-bold leading-none">
        {initialsOf(name)}
      </span>
    </div>
  )
}
