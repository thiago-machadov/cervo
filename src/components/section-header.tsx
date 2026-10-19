import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"

export function SectionHeader({ title, href, linkLabel = "Ver todos" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between px-5 pb-3">
      <h2 className="text-base font-bold">{title}</h2>
      {href && (
        <Link href={href} className="-my-2 flex min-h-11 items-center gap-1 px-2 text-xs font-semibold text-primary">
          {linkLabel} <ArrowRightIcon className="size-3.5" />
        </Link>
      )}
    </div>
  )
}
