import { ImageResponse } from "next/og"
import { AppIconArt } from "./app-icon-art"

export const alt = "Cervo: app de clube do livro e hábito de leitura"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/** Imagem de compartilhamento (WhatsApp, redes sociais, Google). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#eceae6", padding: 64, alignItems: "center", gap: 56 }}>
        <div style={{ width: 300, height: 300, display: "flex", borderRadius: 64, overflow: "hidden" }}>
          <AppIconArt size={300} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
          <div style={{ fontSize: 30, letterSpacing: 6, color: "#2a47b0", fontWeight: 700 }}>CERVOBOOK.CLUB</div>
          <div style={{ fontSize: 76, lineHeight: 1.02, color: "#2a47b0", fontWeight: 800 }}>O APP DO SEU CLUBE DO LIVRO</div>
          <div style={{ fontSize: 32, color: "#3d4466" }}>Check-in diário, sequência, metas e leitura com os amigos.</div>
        </div>
      </div>
    ),
    size
  )
}
