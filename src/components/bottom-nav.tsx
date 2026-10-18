"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpenIcon, FlameIcon, UserIcon, UsersIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Hoje", icon: FlameIcon },
  { href: "/biblioteca", label: "Biblioteca", icon: BookOpenIcon },
  { href: "/clubes", label: "Clubes", icon: UsersIcon },
  { href: "/perfil", label: "Perfil", icon: UserIcon },
]

export function BottomNav() {
  const pathname = usePathname()
  return <BottomNavItems pathname={pathname} />
}

export function BottomNavItems({ pathname }: { pathname?: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md rounded-t-3xl border-t bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.12)] backdrop-blur supports-backdrop-filter:bg-card/85">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname !== undefined && (href === "/" ? pathname === "/" : pathname.startsWith(href))
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium text-muted-foreground transition-colors",
                  active && "text-primary"
                )}
              >
                <Icon className={cn("size-[1.35rem]", active && "fill-primary/15 stroke-[2.25]")} />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
