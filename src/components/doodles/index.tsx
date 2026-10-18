import { cn } from "@/lib/utils"
import { fan, feathers, rays, spiralPath, threadPath } from "./paths"

/**
 * Ilustrações desenhadas à mão (referências: sol, olho, garça, espirais e fio em azul cobalto).
 * Todas usam `currentColor` e os filtros de `CrayonDefs`.
 */
type DoodleProps = { className?: string; label?: string }

function Svg({
  viewBox,
  className,
  label,
  children,
}: DoodleProps & { viewBox: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      className={cn("shrink-0 text-primary", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </svg>
  )
}

const SUN_RAYS = rays(50, 50, 12, 27, 41, 3)

/** Sol de giz de cera: disco cheio + raios curtos. */
export function SunDoodle(props: DoodleProps) {
  return (
    <Svg viewBox="0 0 100 100" {...props}>
      <g filter="url(#crayon)">
        <path
          d="M50 31C61 30.5 69.5 39 69 50.5C68.5 61 60.5 69.5 49.5 69C39 68.5 30.5 60.5 31 49.5C31.5 39.5 39.5 31.5 50 31Z"
          fill="currentColor"
          stroke="none"
        />
        <path d={SUN_RAYS} strokeWidth="4.2" />
      </g>
    </Svg>
  )
}

/** Olho de pincel: amêndoa grossa, íris cheia e cílios em gotas. */
export function EyeDoodle(props: DoodleProps) {
  return (
    <Svg viewBox="0 0 120 80" {...props}>
      <g filter="url(#ink)">
        <path d="M14 52C32 30 86 27 106 48C88 70 34 73 14 52Z" strokeWidth="9" />
        <path d="M47 37C56 33 69 36 71 47C72 58 63 64 54 62C46 60 42 51 43 44C43.5 41 45 38.5 47 37Z" fill="currentColor" stroke="none" />
        <path d="M17 33L24 35M31 26L35 31M45 20L47 27M60 17L60 25M75 19L72 27M90 24L84 30M103 32L96 35" strokeWidth="7" />
      </g>
    </Svg>
  )
}

const WING_BACK = fan([82, 63], 30, -128, -72, [30, 58], 13, 5)
const WING_FRONT = fan([118, 60], 22, -98, -48, [24, 44], 10, 8)
const TAIL = feathers([24, 70], [40, 69], [8, 64], [24, 61], 5, 2)

/** Garça em voo, traço de giz. */
export function BirdDoodle(props: DoodleProps) {
  return (
    <Svg viewBox="0 0 200 100" {...props}>
      <g filter="url(#crayon)">
        <path d={WING_BACK} strokeWidth="3.2" />
        <path d={WING_FRONT} strokeWidth="2.9" />
        <path d={TAIL} strokeWidth="2.6" />
        <path
          d="M12 70C34 68 56 66 76 68C92 70 108 66 124 60C134 56 142 52 152 50C160 48 168 49 170 53C171 56 167 58 160 58C150 59 140 64 132 70C118 79 92 82 68 76"
          strokeWidth="3"
        />
        <path d="M168 52L196 55L169 57" strokeWidth="2.6" />
        <circle cx="162" cy="53" r="1.6" fill="currentColor" stroke="none" />
      </g>
    </Svg>
  )
}

/** Estrela de oito pontas, como a da medalha do anjo. */
export function StarDoodle(props: DoodleProps) {
  return (
    <Svg viewBox="0 0 48 48" {...props}>
      <g filter="url(#crayon)">
        <path d="M24 5L24.4 43M5 24L43 23.6M10.5 10.5L37.5 37.8M37.6 10.2L10.3 37.6" strokeWidth="2.6" />
        <circle cx="24" cy="24" r="4.2" fill="currentColor" stroke="none" />
      </g>
    </Svg>
  )
}

/** Espiral de pincel (pode ser usada como textura de fundo). */
export function SpiralDoodle({ seed = 1, turns = 6, ...props }: DoodleProps & { seed?: number; turns?: number }) {
  return (
    <Svg viewBox="0 0 100 100" {...props}>
      <path d={spiralPath(50, 50, 44, turns, seed)} strokeWidth="3.2" filter="url(#ink)" />
    </Svg>
  )
}

const CLUSTER = [
  { cx: 70, cy: 70, r: 58, turns: 9, seed: 1 },
  { cx: 150, cy: 52, r: 30, turns: 5, seed: 4 },
  { cx: 132, cy: 138, r: 52, turns: 8, seed: 2 },
  { cx: 52, cy: 168, r: 30, turns: 5, seed: 6 },
  { cx: 108, cy: 202, r: 26, turns: 4, seed: 3 },
].map((s) => spiralPath(s.cx, s.cy, s.r, s.turns + 3, s.seed))

/** Composição de espirais (referência do quadro de espirais). Decorativa. */
export function SpiralClusterDoodle(props: DoodleProps) {
  return (
    <Svg viewBox="0 0 200 240" {...props}>
      <g filter="url(#ink)" strokeWidth="2.6">
        {CLUSTER.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </Svg>
  )
}

const THREAD = threadPath(300, 80, 2)

/** Fio contínuo com nós, como um rabisco de caneta. Bom como divisor. */
export function ThreadDoodle(props: DoodleProps) {
  return (
    <Svg viewBox="0 0 300 80" {...props}>
      <g filter="url(#pen)">
        <path d={THREAD.d} strokeWidth="2.4" />
        <circle cx={THREAD.start[0]} cy={THREAD.start[1]} r="3" fill="currentColor" stroke="none" />
        <circle cx={THREAD.end[0]} cy={THREAD.end[1]} r="3" fill="currentColor" stroke="none" />
      </g>
    </Svg>
  )
}

/** Livro aberto com linhas de texto rabiscadas. */
export function BookDoodle(props: DoodleProps) {
  return (
    <Svg viewBox="0 0 160 110" {...props}>
      <g filter="url(#crayon)">
        <path d="M80 28C64 16 36 13 12 20L14 90C38 84 62 86 80 98" strokeWidth="4.5" />
        <path d="M80 28C96 16 124 13 148 20L146 90C122 84 98 86 80 98" strokeWidth="4.5" />
        <path d="M80 28L80 98" strokeWidth="3.5" />
        <path d="M12 92C38 98 62 98 80 104C98 98 122 98 148 92" strokeWidth="3.5" />
        <path
          d="M24 34C38 31 52 32 66 37M24 46C40 43 52 44 68 49M25 58C38 56 50 57 66 61M26 70C36 68 46 69 58 72M94 37C108 32 122 31 136 34M93 49C108 44 120 43 136 46M94 61C110 57 122 56 135 58M95 72C108 69 118 68 130 70"
          strokeWidth="2.4"
          opacity="0.75"
        />
        <path d="M112 16L112 40L118 34L124 40L124 14" fill="currentColor" strokeWidth="2" />
      </g>
    </Svg>
  )
}

/** Pilha de livros tortos: leitura livre, cada um com o seu. */
export function BooksDoodle(props: DoodleProps) {
  return (
    <Svg viewBox="0 0 100 100" {...props}>
      <g filter="url(#crayon)">
        <path d="M14 82C36 80 62 80 86 83L85 94C62 92 36 92 15 94Z" fill="currentColor" strokeWidth="2" />
        <path d="M20 66C40 63 62 64 82 68L80 80C60 77 40 77 21 79Z" strokeWidth="3.8" />
        <path d="M24 70C40 68 58 68 76 72" strokeWidth="2" opacity="0.7" />
        <path d="M26 50C44 46 62 47 78 52L74 64C58 60 42 60 27 63Z" fill="currentColor" strokeWidth="2" />
        <path d="M34 22L46 20L52 46L40 49Z" strokeWidth="3.6" />
        <path d="M52 18L62 20L58 46L49 45Z" fill="currentColor" strokeWidth="2" />
      </g>
    </Svg>
  )
}

/** Chama da sequência: forma cheia com miolo vazado. */
export function FlameDoodle(props: DoodleProps) {
  return (
    <Svg viewBox="0 0 64 72" {...props}>
      <path
        filter="url(#crayon)"
        fill="currentColor"
        stroke="none"
        fillRule="evenodd"
        d="M33 4C37 17 52 24 52 43C52 57 43 67 32 67C19 67 11 57 12 44C13 33 20 28 23 17C28 23 30 28 30 33C35 26 36 15 33 4ZM32 38C37 45 41 49 39 56C38 60 35 62 32 62C27.5 62 25 58 26 53.5C27 49 30 46 32 38Z"
      />
    </Svg>
  )
}

/** Envelope com um coraçãozinho no lacre. */
export function EnvelopeDoodle(props: DoodleProps) {
  return (
    <Svg viewBox="0 0 120 90" {...props}>
      <g filter="url(#crayon)">
        <path d="M12 18C44 15 78 15 108 17C110 38 109 58 107 76C76 78 44 78 13 75C11 56 10 36 12 18Z" strokeWidth="4.5" />
        <path d="M13 20C30 34 46 46 60 52C74 46 90 34 106 19" strokeWidth="4" />
        <path d="M14 74C28 62 40 54 50 48M106 74C92 62 80 54 70 48" strokeWidth="3" opacity="0.8" />
        <path d="M60 48C57 43 51 44 52 49C53 53 60 57 60 57C60 57 67 53 68 49C69 44 63 43 60 48Z" fill="currentColor" strokeWidth="1.5" />
      </g>
    </Svg>
  )
}

/** Bando de pássaros: leitura em grupo. */
export function FlockDoodle(props: DoodleProps) {
  return (
    <Svg viewBox="0 0 160 100" {...props}>
      <g filter="url(#crayon)">
        <path d="M18 56C28 44 38 42 48 54C56 40 70 36 82 46" strokeWidth="5" />
        <path d="M78 30C86 21 94 20 101 29C107 19 117 16 126 23" strokeWidth="4.2" />
        <path d="M96 72C103 64 110 63 116 71C121 63 129 61 136 66" strokeWidth="3.6" />
        <path d="M128 42C132 38 136 38 139 42C142 38 146 37 150 39" strokeWidth="3" />
      </g>
    </Svg>
  )
}

/** Medalha oval de carimbo (referência do anjo), com conteúdo no centro. */
export function StampFrame({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("relative inline-flex items-center justify-center text-primary", className)}>
      <svg viewBox="0 0 120 160" className="absolute inset-0 size-full" fill="none" stroke="currentColor" aria-hidden>
        <g filter="url(#crayon)">
          <ellipse cx="60" cy="80" rx="54" ry="74" strokeWidth="4.5" />
          <ellipse cx="60" cy="80" rx="47" ry="66" strokeWidth="1.6" opacity="0.6" />
        </g>
      </svg>
      <div className="relative flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}

/** Metade da galhada (lado esquerdo); o lado direito é espelhado. */
const ANTLER =
  "M53 60C49 49 44 40 38 32C33 25 30 17 31 7" +
  "M46 47C40 45 32 45 23 41" +
  "M40 36C34 34 27 31 20 24" +
  "M35 28C38 23 40 17 40 10" +
  "M32 16C28 13 25 9 24 4"

/** Cervo, o símbolo do app: cabeça de frente com galhada, em giz de cera. */
export function DeerDoodle(props: DoodleProps) {
  return (
    <Svg viewBox="0 0 120 130" {...props}>
      <g filter="url(#ink)">
        <path d={ANTLER} strokeWidth="4.6" />
        <path d={ANTLER} strokeWidth="4.6" transform="translate(120 0) scale(-1 1)" />
        {/* Orelhas */}
        <path d="M45 67C35 61 24 60 15 66C23 74 35 77 45 73Z" fill="currentColor" strokeWidth="1.5" />
        <path d="M75 67C85 61 96 60 105 66C97 74 85 77 75 73Z" fill="currentColor" strokeWidth="1.5" />
        {/* Cabeça com olhos e focinho vazados */}
        <path
          fill="currentColor"
          stroke="none"
          fillRule="evenodd"
          d="M60 57C71 57 79 62 81 72C83 84 75 98 69 112C67 118 64 122 60 122C56 122 53 118 51 112C45 98 37 84 39 72C41 62 49 57 60 57ZM49.5 81a3.4 3.9 0 1 0 6.8 0a3.4 3.9 0 1 0 -6.8 0ZM63.7 81a3.4 3.9 0 1 0 6.8 0a3.4 3.9 0 1 0 -6.8 0ZM56 112a4 2.6 0 1 0 8 0a4 2.6 0 1 0 -8 0Z"
        />
      </g>
    </Svg>
  )
}
