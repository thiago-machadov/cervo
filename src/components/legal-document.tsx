/** Estilo de leitura para textos longos (termos, privacidade). */
export function LegalDocument({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article
      className={[
        "space-y-4 text-[0.95rem] leading-relaxed text-foreground/90",
        "[&_h2]:font-display [&_h2]:pt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-primary [&_h2]:uppercase",
        "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
      ].join(" ")}
    >
      <header className="space-y-1 pb-2">
        <h1 className="font-display text-3xl font-bold text-primary uppercase">{title}</h1>
        <p className="text-sm text-muted-foreground">Última atualização: {updated}</p>
      </header>
      {children}
    </article>
  )
}
