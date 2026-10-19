"use client"

/** Último recurso, quando até o layout raiz falha: HTML simples, sem dependências. */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#eceae6", color: "#22284a" }}>
        <main style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
          <h1 style={{ color: "#2a47b0", margin: 0 }}>O Cervo tropeçou</h1>
          <p style={{ maxWidth: 360, margin: 0 }}>Algo deu errado ao abrir o app. Tente de novo; se continuar, escreva para cervobookclub@gmail.com.</p>
          <button
            onClick={() => retry()}
            style={{ height: 44, padding: "0 20px", borderRadius: 999, border: 0, background: "#2a47b0", color: "#fff", fontSize: 16 }}
          >
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  )
}
