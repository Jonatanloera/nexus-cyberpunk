// La escena NEXUS: una ciudad cyberpunk de noche, como un solo SVG animado
// (SMIL), dibujado detrás de la conversación. Todo es determinista: la misma
// semilla da la misma ciudad en cada carga.

const W = 1600
const H = 1000
const HORIZON = 650

const C = {
  void: '#04010b',
  night: '#0d0322',
  violet: '#2a0a4a',
  haze: '#7a1fff',
  magenta: '#ff2bd6',
  cyan: '#00f0ff',
  acid: '#f5ff3b',
  red: '#ff2a4d',
  farCity: '#170734',
  nearCity: '#080216',
}

// Generador pseudoaleatorio con semilla (mulberry32).
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = seed
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const r1 = (n: number) => Math.round(n * 10) / 10

const pick = <T,>(rand: () => number, list: readonly T[]): T =>
  list[Math.floor(rand() * list.length)] as T

const WINDOW_COLORS = [C.cyan, C.magenta, C.acid, C.cyan, '#9be7ff'] as const

function skyline(seed: number, fill: string, minH: number, maxH: number, windowRate: number, isNear: boolean): string {
  const rand = rng(seed)
  const out: string[] = []
  let x = -20
  while (x < W + 20) {
    const w = 34 + rand() * (isNear ? 90 : 70)
    const h = minH + rand() * (maxH - minH)
    const top = HORIZON - h
    out.push(`<rect x="${r1(x)}" y="${r1(top)}" width="${r1(w)}" height="${r1(h + 2)}" fill="${fill}"/>`)

    // Antena con luz roja parpadeante en algunas torres.
    if (rand() < (isNear ? 0.35 : 0.2)) {
      const ax = x + w / 2
      const ah = 20 + rand() * 50
      out.push(`<line x1="${r1(ax)}" y1="${r1(top)}" x2="${r1(ax)}" y2="${r1(top - ah)}" stroke="${fill}" stroke-width="3"/>`)
      out.push(
        `<circle cx="${r1(ax)}" cy="${r1(top - ah)}" r="3" fill="${C.red}">` +
          `<animate attributeName="opacity" values="1;0.1;1" dur="${r1(1.2 + rand() * 1.6)}s" repeatCount="indefinite"/></circle>`,
      )
    }

    // Borde de neón en el techo de las torres cercanas.
    if (isNear && rand() < 0.45) {
      out.push(`<rect x="${r1(x)}" y="${r1(top)}" width="${r1(w)}" height="2" fill="${pick(rand, [C.magenta, C.cyan])}" opacity="0.85"/>`)
    }

    // Letrero vertical de neón.
    if (isNear && rand() < 0.22 && h > 260) {
      const sx = x + 6 + rand() * (w - 20)
      const sy = top + 30 + rand() * 60
      const sh = 70 + rand() * 90
      const col = pick(rand, [C.magenta, C.cyan, C.acid])
      out.push(
        `<rect x="${r1(sx)}" y="${r1(sy)}" width="8" height="${r1(sh)}" rx="2" fill="${col}" filter="url(#glow)">` +
          `<animate attributeName="opacity" values="1;1;0.35;1;1;0.6;1" keyTimes="0;0.6;0.62;0.66;0.9;0.92;1" dur="${r1(3 + rand() * 4)}s" repeatCount="indefinite"/></rect>`,
      )
    }

    // Ventanas.
    for (let wy = top + 14; wy < HORIZON - 10; wy += 14) {
      for (let wx = x + 6; wx < x + w - 8; wx += 11) {
        if (rand() > windowRate) continue
        const col = pick(rand, WINDOW_COLORS)
        const op = r1(0.35 + rand() * 0.6)
        if (rand() < 0.08) {
          out.push(
            `<rect x="${r1(wx)}" y="${r1(wy)}" width="5" height="6" fill="${col}" opacity="${op}">` +
              `<animate attributeName="opacity" values="${op};0.05;${op}" dur="${r1(2 + rand() * 6)}s" begin="${r1(-rand() * 6)}s" repeatCount="indefinite"/></rect>`,
          )
        } else {
          out.push(`<rect x="${r1(wx)}" y="${r1(wy)}" width="5" height="6" fill="${col}" opacity="${op}"/>`)
        }
      }
    }
    x += w + (isNear ? rand() * 14 : rand() * 6)
  }
  return out.join('')
}

function grid(): string {
  const out: string[] = []
  const vx = W / 2
  // Líneas que fugan hacia el horizonte.
  for (let i = -24; i <= 24; i++) {
    const bx = vx + i * 120
    out.push(`<line x1="${vx}" y1="${HORIZON}" x2="${bx}" y2="${H}" />`)
  }
  // Líneas horizontales que avanzan hacia quien mira.
  const rows: string[] = []
  for (let y = HORIZON; y <= H + 40; y += 40) {
    rows.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" />`)
  }
  out.push(
    `<g>${rows.join('')}<animateTransform attributeName="transform" type="translate" from="0 0" to="0 40" dur="1.4s" repeatCount="indefinite"/></g>`,
  )
  return out.join('')
}

function rain(): string {
  const rand = rng(77)
  const out: string[] = []
  for (let i = 0; i < 110; i++) {
    const x = rand() * (W + 200) - 100
    const len = 18 + rand() * 30
    const dur = r1(0.7 + rand() * 0.8)
    out.push(
      `<line x1="${r1(x)}" y1="-60" x2="${r1(x - len * 0.18)}" y2="${r1(-60 + len)}">` +
        `<animateTransform attributeName="transform" type="translate" from="0 0" to="-190 ${H + 120}" dur="${dur}s" begin="${r1(-rand() * 2)}s" repeatCount="indefinite"/></line>`,
    )
  }
  return out.join('')
}

function traffic(): string {
  const rand = rng(1234)
  const out: string[] = []
  for (let i = 0; i < 9; i++) {
    const y = 180 + rand() * 340
    const isLeft = rand() < 0.5
    const col = pick(rand, [C.cyan, C.magenta, C.acid, '#ffffff'])
    const dur = r1(9 + rand() * 14)
    const from = isLeft ? W + 80 : -80
    const to = isLeft ? -80 : W + 80
    out.push(
      `<g opacity="0.9"><ellipse cx="0" cy="${r1(y)}" rx="7" ry="2.2" fill="${col}" filter="url(#glow)"/>` +
        `<rect x="${isLeft ? 4 : -34}" y="${r1(y - 0.6)}" width="30" height="1.2" fill="${col}" opacity="0.4"/>` +
        `<animateTransform attributeName="transform" type="translate" from="${from} 0" to="${to} 0" dur="${dur}s" begin="${r1(-rand() * 20)}s" repeatCount="indefinite"/></g>`,
    )
  }
  return out.join('')
}

// El holograma NEXUS: anillos de nodos girando y el nombre con glitch.
function hologram(cx: number): string {
  const cy = 215
  const nodes: string[] = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2
    const nx = r1(cx + Math.cos(a) * 92)
    const ny = r1(cy + Math.sin(a) * 92)
    nodes.push(`<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="${C.cyan}" stroke-width="1" opacity="0.35"/>`)
    nodes.push(`<circle cx="${nx}" cy="${ny}" r="5" fill="${C.void}" stroke="${C.cyan}" stroke-width="2"/>`)
  }
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2
    return `${r1(cx + Math.cos(a) * 92)},${r1(cy + Math.sin(a) * 92)}`
  }).join(' ')

  const word = (fill: string, dx: string, op: string) =>
    `<text x="${cx}" y="${cy + 190}" text-anchor="middle" font-family="Menlo, Monaco, 'Courier New', monospace" font-size="78" font-weight="800" letter-spacing="22" fill="${fill}" opacity="${op}">NEXUS` +
    `<animate attributeName="x" values="${cx};${cx};${dx};${cx};${cx}" keyTimes="0;0.86;0.88;0.9;1" dur="4.2s" repeatCount="indefinite"/></text>`

  return (
    `<g opacity="0.78">` +
    `<g filter="url(#glow)">` +
    `<circle cx="${cx}" cy="${cy}" r="140" fill="none" stroke="${C.magenta}" stroke-width="2" stroke-dasharray="4 14" opacity="0.8">` +
    `<animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="40s" repeatCount="indefinite"/></circle>` +
    `<circle cx="${cx}" cy="${cy}" r="118" fill="none" stroke="${C.cyan}" stroke-width="1.5" stroke-dasharray="60 20 6 20" opacity="0.7">` +
    `<animateTransform attributeName="transform" type="rotate" from="360 ${cx} ${cy}" to="0 ${cx} ${cy}" dur="26s" repeatCount="indefinite"/></circle>` +
    `<g><polygon points="${hex}" fill="none" stroke="${C.cyan}" stroke-width="2"/>${nodes.join('')}` +
    `<circle cx="${cx}" cy="${cy}" r="14" fill="${C.magenta}"><animate attributeName="r" values="11;17;11" dur="2.4s" repeatCount="indefinite"/></circle>` +
    `<animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="60s" repeatCount="indefinite"/></g>` +
    `</g>` +
    // Haz del proyector hacia la torre.
    `<polygon points="${cx - 6},${cy + 140} ${cx + 6},${cy + 140} ${cx + 40},${HORIZON - 260} ${cx - 40},${HORIZON - 260}" fill="url(#beam)" opacity="0.5"/>` +
    word(C.magenta, String(cx - 7), '0.75') +
    word(C.cyan, String(cx + 6), '0.75') +
    word('#eafcff', String(cx), '0.95') +
    `</g>`
  )
}

// La escena entera, o un recorte (`viewBox`) a un tamaño fijo para el panel.
const svg = (open: string, holoX: number): string =>
  open +
  `<defs>` +
  `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">` +
  `<stop offset="0" stop-color="${C.void}"/><stop offset="0.45" stop-color="${C.night}"/>` +
  `<stop offset="0.62" stop-color="${C.violet}"/><stop offset="0.66" stop-color="#4a0d5e"/></linearGradient>` +
  `<radialGradient id="horizonGlow" cx="0.5" cy="0.65" r="0.55">` +
  `<stop offset="0" stop-color="${C.magenta}" stop-opacity="0.55"/><stop offset="0.5" stop-color="${C.haze}" stop-opacity="0.18"/>` +
  `<stop offset="1" stop-color="${C.haze}" stop-opacity="0"/></radialGradient>` +
  `<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">` +
  `<stop offset="0" stop-color="#1b0634"/><stop offset="1" stop-color="${C.void}"/></linearGradient>` +
  `<linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">` +
  `<stop offset="0" stop-color="${C.magenta}" stop-opacity="0.15"/><stop offset="1" stop-color="${C.magenta}" stop-opacity="0.85"/></linearGradient>` +
  `<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">` +
  `<stop offset="0" stop-color="${C.cyan}" stop-opacity="0.5"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>` +
  `<radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">` +
  `<stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.75"/></radialGradient>` +
  `<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity="0.5"/></pattern>` +
  `<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" result="b"/>` +
  `<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
  `<clipPath id="floorClip"><rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}"/></clipPath>` +
  `</defs>` +
  // Cielo y bruma.
  `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
  `<rect width="${W}" height="${H}" fill="url(#horizonGlow)">` +
  `<animate attributeName="opacity" values="0.85;1;0.85" dur="7s" repeatCount="indefinite"/></rect>` +
  traffic() +
  // Ciudad: capa lejana y capa cercana; el holograma flota delante.
  `<g opacity="0.9">${skyline(11, C.farCity, 140, 420, 0.18, false)}</g>` +
  `<g>${skyline(29, C.nearCity, 90, 330, 0.12, true)}</g>` +
  hologram(holoX) +
  // Suelo con rejilla de neón.
  `<rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#floor)"/>` +
  `<g clip-path="url(#floorClip)" stroke="url(#gridFade)" stroke-width="1.5" opacity="0.7">${grid()}</g>` +
  `<rect x="0" y="${HORIZON - 1}" width="${W}" height="2" fill="${C.magenta}" filter="url(#glow)"/>` +
  // Lluvia.
  `<g stroke="${C.cyan}" stroke-width="1" opacity="0.22">${rain()}</g>` +
  // Líneas de escaneo y viñeta.
  `<rect width="${W}" height="${H}" fill="url(#scan)" opacity="0.35"/>` +
  `<rect width="${W}" height="${H}" fill="url(#vignette)"/>` +
  `</svg>`

// Fondo de ventana completa: llena el hueco recortando lo que sobre.
export const SCENE: string = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">`,
  1180,
)

// Panel lateral: un recorte vertical centrado en el holograma y la rejilla.
export const PANEL_SCENE: string = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="400 0 800 ${H}" width="800" height="${H}" preserveAspectRatio="xMidYMid slice">`,
  800,
)
