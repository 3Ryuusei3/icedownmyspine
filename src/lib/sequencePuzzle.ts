/** Generadores de series con reglas distintas (no solo progresión aritmética). */

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export type SequencePuzzle = {
  shown: number[]
  answer: number
  /** Texto breve para el modal de victoria */
  explain: string
}

function arithmetic(): SequencePuzzle {
  // Sin ±5 (demasiado obvio); se mezcla con otros generadores más irregulares.
  const steps = [-8, -7, -6, -4, -3, -2, -1, 1, 2, 3, 4, 6, 7, 8]
  const step = steps[randomInt(0, steps.length - 1)]!
  const start = randomInt(3, 25)
  const len = randomInt(5, 6)
  const terms: number[] = []
  for (let i = 0; i < len; i++) terms.push(start + i * step)
  const answer = terms[len - 1]!
  const shown = terms.slice(0, -1)
  return {
    shown,
    answer,
    explain: `Progresión aritmética (mismo salto cada vez). Serie: ${terms.join(", ")}.`,
  }
}

/** Segunda diferencia constante → cuadrática en el índice. */
function quadratic(): SequencePuzzle {
  const len = randomInt(5, 6)
  const c = randomInt(1, 3)
  const b = randomInt(-5, 5)
  const a = randomInt(2, 14)
  const terms: number[] = []
  for (let i = 0; i < len; i++) {
    terms.push(c * i * i + b * i + a)
  }
  const answer = terms[len - 1]!
  return {
    shown: terms.slice(0, -1),
    answer,
    explain: `Patrón cuadrático. Serie completa: ${terms.join(", ")}.`,
  }
}

function fibonacciLike(): SequencePuzzle {
  const len = randomInt(6, 7)
  const terms = [randomInt(3, 9), randomInt(3, 9)]
  for (let i = 2; i < len; i++) {
    const n = terms[i - 2]! + terms[i - 1]!
    terms.push(n)
  }
  const answer = terms[len - 1]!
  return {
    shown: terms.slice(0, -1),
    answer,
    explain: `Cada término es la suma de los dos anteriores. Serie: ${terms.join(", ")}.`,
  }
}

function geometric(): SequencePuzzle {
  const r = Math.random() < 0.5 ? 2 : 3
  const a0 = randomInt(2, 6)
  const len = randomInt(5, 6)
  const terms: number[] = []
  let v = a0
  for (let i = 0; i < len; i++) {
    terms.push(v)
    v *= r
  }
  const answer = terms[len - 1]!
  return {
    shown: terms.slice(0, -1),
    answer,
    explain: `Multiplicación repetida por ${r}. Serie: ${terms.join(", ")}.`,
  }
}

/** Saltos que alternan entre dos valores distintos. */
function alternatingStep(): SequencePuzzle {
  const len = randomInt(6, 7)
  let d1 = randomInt(2, 7)
  while (d1 === 5) d1 = randomInt(2, 7)
  const d2 = randomInt(-6, -2)
  const start = randomInt(8, 28)
  const terms: number[] = [start]
  for (let i = 1; i < len; i++) {
    const delta = i % 2 === 1 ? d1 : d2
    terms.push(terms[i - 1]! + delta)
  }
  const answer = terms[len - 1]!
  return {
    shown: terms.slice(0, -1),
    answer,
    explain: `Los saltos alternan (+${d1} y ${d2}). Serie: ${terms.join(", ")}.`,
  }
}

/** Tres saltos distintos que se repiten en ciclo (+d0, +d1, +d2, +d0…). */
function cyclicThreeStep(): SequencePuzzle {
  const len = randomInt(6, 7)
  const pickDelta = () => {
    let d = randomInt(2, 12)
    while (d === 5) d = randomInt(2, 12)
    return d
  }
  const d0 = pickDelta()
  let d1 = pickDelta()
  while (d1 === d0) d1 = pickDelta()
  let d2 = pickDelta()
  while (d2 === d0 || d2 === d1) d2 = pickDelta()
  const deltas = [d0, d1, d2]
  const start = randomInt(6, 35)
  const terms: number[] = [start]
  for (let i = 1; i < len; i++) {
    terms.push(terms[i - 1]! + deltas[(i - 1) % 3]!)
  }
  const answer = terms[len - 1]!
  return {
    shown: terms.slice(0, -1),
    answer,
    explain: `Los saltos se repiten en ciclo (+${d0}, +${d1}, +${d2}). Serie: ${terms.join(", ")}.`,
  }
}

/** +k, ×r, +k, ×r… (k y r pequeños). */
function addThenMul(): SequencePuzzle {
  const len = randomInt(6, 7)
  let k = randomInt(2, 6)
  while (k === 5) k = randomInt(2, 6)
  const r = randomInt(2, 3)
  const start = randomInt(2, 8)
  const terms: number[] = [start]
  for (let i = 1; i < len; i++) {
    const prev = terms[i - 1]!
    terms.push(i % 2 === 1 ? prev + k : prev * r)
  }
  const answer = terms[len - 1]!
  return {
    shown: terms.slice(0, -1),
    answer,
    explain: `Alterna sumar ${k} y multiplicar por ${r}. Serie: ${terms.join(", ")}.`,
  }
}

/** Más peso a patrones alternos / cíclicos que a la progresión lineal simple. */
function pickGenerator(): () => SequencePuzzle {
  const r = Math.random()
  if (r < 0.22) return alternatingStep
  if (r < 0.4) return addThenMul
  if (r < 0.52) return cyclicThreeStep
  const rest = [
    arithmetic,
    quadratic,
    fibonacciLike,
    geometric,
  ] as const
  return rest[randomInt(0, rest.length - 1)]!
}

export function buildRandomSequencePuzzle(): SequencePuzzle {
  const f = pickGenerator()
  let p = f()
  let guard = 0
  while (guard++ < 16) {
    const nums = [...p.shown, p.answer]
    const bad =
      nums.some((n) => !Number.isFinite(n) || Math.abs(n) > 999) ||
      p.shown.length < 3
    if (!bad) break
    p = f()
  }
  return p
}
