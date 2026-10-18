import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"

export function SectionHeader({ title, href, linkLabel = "Ver todos" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between px-5 pb-3">
      <h2 className="text-base font-bold">{title}</h2>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs font-semibold text-primary">
          {linkLabel} <ArrowRightIcon className="size-3.5" />
        </Link>
      )}
    </div>
  )
}
