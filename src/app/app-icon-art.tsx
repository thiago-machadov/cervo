/**
 * Ícone do app: o cervo do logo em branco sobre cobalto.
 * O ImageResponse não suporta filtros SVG, então o traço "à mão" vem só das curvas.
 */
const ANTLER =
  "M53 60C49 49 44 40 38 32C33 25 30 17 31 7M46 47C40 45 32 45 23 41M40 36C34 34 27 31 20 24M35 28C38 23 40 17 40 10M32 16C28 13 25 9 24 4"

export function AppIconArt({ size }: { size: number }) {
  const ink = "#fdfcf8"
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#2a47b0" }}>
      <svg width={size * 0.7} height={size * 0.76} viewBox="0 0 120 130" fill="none" stroke={ink} strokeLinecap="round" strokeLinejoin="round">
        <path d={ANTLER} strokeWidth="5.5" />
        <path d={ANTLER} strokeWidth="5.5" transform="translate(120 0) scale(-1 1)" />
        <path d="M45 67C35 61 24 60 15 66C23 74 35 77 45 73Z" fill={ink} strokeWidth="1.5" />
        <path d="M75 67C85 61 96 60 105 66C97 74 85 77 75 73Z" fill={ink} strokeWidth="1.5" />
        <path
          fill={ink}
          stroke="none"
          fillRule="evenodd"
          d="M60 57C71 57 79 62 81 72C83 84 75 98 69 112C67 118 64 122 60 122C56 122 53 118 51 112C45 98 37 84 39 72C41 62 49 57 60 57ZM49.5 81a3.4 3.9 0 1 0 6.8 0a3.4 3.9 0 1 0 -6.8 0ZM63.7 81a3.4 3.9 0 1 0 6.8 0a3.4 3.9 0 1 0 -6.8 0ZM56 112a4 2.6 0 1 0 8 0a4 2.6 0 1 0 -8 0Z"
        />
      </svg>
    </div>
  )
}
