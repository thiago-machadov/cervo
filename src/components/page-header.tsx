import { BackButton } from "@/components/back-button"

/**
 * Cabeçalho das telas. Sem `backHref` é uma tela raiz (título grande, estilo pôster);
 * com `backHref` é uma tela interna (barra compacta com voltar).
 */
export function PageHeader({
  title,
  subtitle,
  backHref,
  action,
}: {
  title: string
  subtitle?: React.ReactNode
  backHref?: string
  action?: React.ReactNode
}) {
  if (!backHref) {
    return (
      <header className="flex items-end justify-between gap-3 px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-4">
        <div className="min-w-0">
          <h1 className="font-display truncate text-4xl font-bold text-primary">{title}</h1>
          {subtitle && <p className="mt-1 truncate text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="pb-1">{action}</div>}
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 bg-background/90 px-3 pt-[env(safe-area-inset-top)] backdrop-blur supports-backdrop-filter:bg-background/75">
      <div className="flex h-14 min-w-0 flex-1 items-center gap-1">
        <BackButton fallback={backHref} />
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action}
    </header>
  )
}
