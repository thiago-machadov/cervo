/** Geradores determinísticos de traços "à mão" (mesmo resultado no servidor e no cliente). */

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f = (n: number) => n.toFixed(1)

function toPath(points: [number, number][]) {
  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${f(x)} ${f(y)}`).join("")
}

/** Espiral com leve irregularidade, como a feita a pincel. */
export function spiralPath(cx: number, cy: number, maxR: number, turns: number, seed = 1) {
  const end = turns * Math.PI * 2
  const points: [number, number][] = []
  for (let t = 0.6; t <= end; t += 0.12) {
    const wobble = 1 + Math.sin(t * 1.7 + seed) * 0.05 + Math.sin(t * 0.55 + seed * 2.3) * 0.06
    const r = (maxR * t * wobble) / end
    points.push([cx + Math.cos(t + seed) * r, cy + Math.sin(t + seed) * r * 0.94])
  }
  return toPath(points)
}

/** Fio sinuoso com nós/laços em alguns pontos (referência do rabisco contínuo). */
export function threadPath(width: number, height: number, seed = 1, knots = [0.24, 0.52, 0.8]) {
  const points: [number, number][] = []
  for (let t = 0; t <= 1; t += 0.0015) {
    // Nós: laços grandes e bagunçados, com raio variando dentro de cada nó.
    const knot = knots.reduce((sum, c) => sum + Math.exp(-(((t - c) / 0.045) ** 2)), 0)
    const phase = t * Math.PI * 2 * 30 + seed
    const loop = knot * height * 0.26 * (0.75 + 0.35 * Math.sin(t * 173 + seed))
    const x = 6 + t * (width - 12) + Math.cos(phase) * loop * 1.15
    const y = height / 2 + Math.sin(t * Math.PI * 2.2 + seed) * height * 0.24 + Math.sin(phase * 1.08) * loop
    points.push([x, y])
  }
  return { d: toPath(points), start: points[0]!, end: points[points.length - 1]! }
}

/** Raios curtos ao redor de um centro, com variação de ângulo e comprimento. */
export function rays(cx: number, cy: number, count: number, inner: number, outer: number, seed = 1) {
  const random = rng(seed)
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (random() - 0.5) * 0.12
    const r1 = inner + (random() - 0.5) * 3
    const r2 = outer + (random() - 0.5) * 6
    return `M${f(cx + Math.cos(angle) * r1)} ${f(cy + Math.sin(angle) * r1)}L${f(cx + Math.cos(angle) * r2)} ${f(cy + Math.sin(angle) * r2)}`
  }).join("")
}

/** Penas: traços saindo de uma base em direção a pontas, com comprimento irregular. */
export function feathers(
  base: [number, number],
  baseEnd: [number, number],
  tip: [number, number],
  tipEnd: [number, number],
  count: number,
  seed = 1
) {
  const random = rng(seed)
  return Array.from({ length: count }, (_, i) => {
    const k = i / (count - 1)
    const bx = base[0] + (baseEnd[0] - base[0]) * k
    const by = base[1] + (baseEnd[1] - base[1]) * k
    const len = 0.7 + random() * 0.35
    const tx = bx + (tip[0] + (tipEnd[0] - tip[0]) * k - bx) * len
    const ty = by + (tip[1] + (tipEnd[1] - tip[1]) * k - by) * len
    return `M${f(bx)} ${f(by)}L${f(tx)} ${f(ty)}`
  }).join("")
}

/**
 * Penas em leque: cada traço sai de um ponto da base (arco curto) para uma ponta
 * em ângulo crescente, levemente curvado, com comprimento irregular.
 */
export function fan(
  origin: [number, number],
  baseSpread: number,
  angleFrom: number,
  angleTo: number,
  radius: [number, number],
  count: number,
  seed = 1
) {
  const random = rng(seed)
  return Array.from({ length: count }, (_, i) => {
    const k = i / (count - 1)
    const angle = ((angleFrom + (angleTo - angleFrom) * k + (random() - 0.5) * 6) * Math.PI) / 180
    const bx = origin[0] + (k - 0.5) * baseSpread
    const by = origin[1] + Math.abs(k - 0.5) * 3
    const r = radius[0] + (radius[1] - radius[0]) * Math.sin(k * Math.PI * 0.9 + 0.2) * (0.8 + random() * 0.35)
    const tx = bx + Math.cos(angle) * r
    const ty = by + Math.sin(angle) * r
    const bend = (random() - 0.3) * 6
    const cx = (bx + tx) / 2 + Math.cos(angle + Math.PI / 2) * bend
    const cy = (by + ty) / 2 + Math.sin(angle + Math.PI / 2) * bend
    return `M${f(bx)} ${f(by)}Q${f(cx)} ${f(cy)} ${f(tx)} ${f(ty)}`
  }).join("")
}
