"use client"

import Link, { useLinkStatus } from "next/link"
import { usePathname } from "next/navigation"
import { BookOpenIcon, ChatsCircleIcon, FireIcon, UserIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr"
import { DeerDoodle } from "@/components/doodles"
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Hoje", icon: FireIcon },
  { href: "/feed", label: "Feed", icon: ChatsCircleIcon },
  { href: "/biblioteca", label: "Biblioteca", icon: BookOpenIcon },
  { href: "/clubes", label: "Clubes", icon: UsersThreeIcon },
  { href: "/perfil", label: "Perfil", icon: UserIcon },
]

/** Telas internas que pertencem a uma aba (ex.: /amigos fica sob Feed, /feedback sob Perfil). */
const SECTION_PATHS: Record<string, string[]> = {
  "/feed": ["/amigos", "/pessoas", "/checkin"],
  "/perfil": ["/feedback", "/instalar", "/conta", "/assinatura", "/estatisticas"],
}

function isActive(pathname: string | undefined, href: string) {
  if (pathname === undefined) return false
  if (href === "/") return pathname === "/"
  // Compara por segmento: "/feedback" não pode ativar "/feed".
  return [href, ...(SECTION_PATHS[href] ?? [])].some((base) => pathname === base || pathname.startsWith(`${base}/`))
}

export function BottomNav() {
  const pathname = usePathname()
  return <BottomNavItems pathname={pathname} />
}

/** Menu do app: barra inferior no celular/tablet e barra lateral no desktop (lg). */
export function BottomNavItems({ pathname }: { pathname?: string }) {
  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md rounded-t-3xl border-t bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.12)] backdrop-blur supports-backdrop-filter:bg-card/85 lg:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className="flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium text-muted-foreground transition-transform active:scale-90"
                >
                  <NavLinkContent active={active} icon={Icon} label={label} variant="bottom" />
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col gap-8 border-r bg-card/60 px-4 py-6 lg:flex"
      >
        <Link href="/" className="flex items-center gap-2 px-3">
          <DeerDoodle className="w-10" label="Cervo" />
        </Link>
        <ul className="space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className="block rounded-xl text-sm font-medium text-muted-foreground transition-transform active:scale-[0.98]"
                >
                  <NavLinkContent active={active} icon={Icon} label={label} variant="side" />
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}

/**
 * Conteúdo do item do menu. Acende na hora do toque (useLinkStatus), antes de a nova
 * tela chegar, para a navegação nunca parecer travada.
 */
function NavLinkContent({
  active,
  icon: Icon,
  label,
  variant,
}: {
  active: boolean
  icon: (typeof items)[number]["icon"]
  label: string
  variant: "bottom" | "side"
}) {
  const { pending } = useLinkStatus()
  const on = active || pending

  if (variant === "bottom") {
    return (
      <span className={cn("flex flex-col items-center gap-1 transition-colors duration-150", on && "text-primary")}>
        <Icon className={cn("size-6", pending && "animate-pulse")} weight={on ? "fill" : "regular"} />
        {label}
      </span>
    )
  }
  return (
    <span
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-muted hover:text-foreground",
        on && "bg-secondary text-secondary-foreground hover:bg-secondary"
      )}
    >
      <Icon className={cn("size-5", pending && "animate-pulse")} weight={on ? "fill" : "regular"} />
      {label}
    </span>
  )
}
