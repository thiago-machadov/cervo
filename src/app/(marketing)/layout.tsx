/** Páginas públicas de apresentação (landing): largura total, abertas para buscadores. */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return <div className="min-h-dvh overflow-x-hidden bg-background">{children}</div>
}
