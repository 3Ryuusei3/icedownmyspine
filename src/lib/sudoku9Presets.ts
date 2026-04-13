/** 9×9 sudoku: filas de izquierda a derecha, de arriba abajo. 0 = vacío. Puzles con muchas pistas (sencillos). */

export type Sudoku9Puzzle = {
  initial: readonly number[]
  solution: readonly number[]
}

const STORAGE_LAST_INDEX = "icedownyourspine:sudoku9-last-index"

const SOLUTION_EASY =
  "534678912672195348198342567859761423426853791713924856961537284287419635345286179"
    .split("")
    .map(Number) as readonly number[]

/** Varios tableros iniciales; todos llevan a la misma solución comprobada. */
export const SUDOKU9_PUZZLES: Sudoku9Puzzle[] = [
  {
    initial: [
      5, 3, 0, 0, 7, 0, 0, 0, 0, 6, 0, 0, 1, 9, 5, 0, 0, 0, 0, 9, 8, 0, 0, 0, 0, 6, 0, 8, 0, 0,
      0, 6, 0, 0, 0, 3, 4, 0, 0, 8, 0, 3, 0, 0, 1, 7, 0, 0, 0, 2, 0, 0, 0, 6, 0, 6, 0, 0, 0, 0,
      2, 8, 0, 0, 0, 0, 4, 1, 9, 0, 0, 5, 0, 0, 0, 0, 8, 0, 0, 7, 9,
    ],
    solution: SOLUTION_EASY,
  },
  {
    initial: [
      5, 0, 4, 6, 7, 0, 9, 0, 2, 6, 7, 0, 1, 0, 5, 3, 4, 0, 1, 0, 8, 3, 4, 0, 5, 0, 7, 8, 5, 0,
      7, 0, 1, 4, 2, 0, 4, 0, 6, 8, 5, 0, 7, 0, 1, 7, 1, 0, 9, 0, 4, 8, 5, 0, 9, 0, 1, 5, 3, 0,
      2, 0, 4, 2, 8, 0, 4, 0, 9, 6, 3, 0, 3, 0, 5, 2, 8, 0, 1, 0, 9,
    ],
    solution: SOLUTION_EASY,
  },
  {
    initial: [
      5, 0, 4, 0, 7, 0, 9, 0, 2, 0, 7, 0, 1, 0, 5, 0, 4, 0, 1, 0, 8, 0, 4, 0, 5, 0, 7, 0, 5, 0,
      7, 0, 1, 0, 2, 0, 4, 0, 6, 0, 5, 0, 7, 0, 1, 0, 1, 0, 9, 0, 4, 0, 5, 0, 9, 0, 1, 0, 3, 0,
      2, 0, 4, 0, 8, 0, 4, 0, 9, 0, 3, 0, 3, 0, 5, 0, 8, 0, 1, 0, 9,
    ],
    solution: SOLUTION_EASY,
  },
  {
    initial: [
      5, 3, 4, 6, 7, 0, 0, 1, 2, 0, 0, 2, 1, 9, 5, 3, 4, 8, 0, 0, 8, 3, 0, 0, 5, 0, 0, 8, 5, 9,
      0, 0, 0, 0, 2, 0, 4, 2, 0, 0, 5, 3, 7, 9, 1, 0, 1, 0, 9, 2, 4, 8, 5, 6, 0, 0, 1, 0, 3, 0,
      2, 0, 0, 2, 8, 7, 4, 1, 0, 6, 3, 5, 3, 4, 0, 2, 8, 0, 0, 0, 0,
    ],
    solution: SOLUTION_EASY,
  },
  {
    initial: [
      0, 0, 4, 6, 7, 8, 0, 1, 0, 6, 0, 2, 1, 9, 0, 3, 4, 8, 1, 0, 8, 0, 4, 2, 5, 0, 0, 0, 0, 0,
      7, 6, 1, 4, 2, 0, 4, 2, 6, 8, 5, 3, 7, 9, 0, 7, 0, 3, 9, 2, 0, 0, 0, 6, 0, 6, 0, 5, 0, 7,
      0, 8, 4, 0, 0, 7, 0, 0, 9, 6, 3, 0, 0, 4, 5, 2, 8, 6, 0, 7, 0,
    ],
    solution: SOLUTION_EASY,
  },
  {
    initial: [
      0, 0, 4, 6, 0, 8, 0, 1, 2, 6, 0, 2, 1, 0, 5, 3, 4, 0, 1, 0, 8, 0, 4, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 2, 3, 4, 2, 0, 8, 5, 3, 7, 9, 1, 0, 1, 0, 0, 0, 4, 8, 5, 6, 9, 6, 0, 5, 3, 7,
      2, 8, 4, 2, 0, 7, 0, 1, 0, 6, 3, 0, 3, 4, 5, 2, 8, 0, 1, 7, 9,
    ],
    solution: SOLUTION_EASY,
  },
  {
    initial: [
      5, 3, 4, 0, 7, 8, 0, 1, 2, 6, 0, 0, 0, 0, 0, 0, 4, 8, 0, 9, 8, 0, 4, 2, 0, 6, 7, 8, 5, 9,
      7, 6, 1, 0, 2, 3, 0, 2, 6, 8, 0, 3, 7, 9, 1, 0, 0, 3, 9, 2, 4, 8, 5, 0, 0, 0, 1, 5, 3, 7,
      2, 0, 0, 2, 0, 7, 4, 0, 0, 6, 0, 5, 3, 0, 0, 0, 8, 0, 0, 7, 0,
    ],
    solution: SOLUTION_EASY,
  },
  {
    initial: [
      0, 3, 4, 6, 7, 8, 0, 0, 2, 0, 7, 0, 1, 9, 0, 3, 4, 0, 1, 9, 8, 3, 0, 0, 0, 0, 7, 8, 5, 9,
      0, 0, 1, 4, 2, 3, 4, 0, 0, 0, 0, 3, 7, 9, 0, 0, 1, 0, 9, 2, 4, 8, 0, 0, 9, 6, 1, 0, 3, 0,
      2, 8, 4, 2, 0, 0, 4, 0, 9, 6, 0, 0, 3, 0, 5, 2, 0, 6, 1, 7, 9,
    ],
    solution: SOLUTION_EASY,
  },
]

/**
 * Elige un puzle distinto al último que se jugó en esta pestaña (evita repetir al pulsar Repetir).
 */
export function pickSudoku9Puzzle(): Sudoku9Puzzle {
  const n = SUDOKU9_PUZZLES.length
  if (n === 0) throw new Error("SUDOKU9_PUZZLES vacío")
  if (n === 1) return SUDOKU9_PUZZLES[0]!

  let last = -1
  try {
    if (typeof sessionStorage !== "undefined") {
      const raw = sessionStorage.getItem(STORAGE_LAST_INDEX)
      if (raw !== null) {
        const parsed = Number.parseInt(raw, 10)
        if (Number.isFinite(parsed) && parsed >= 0 && parsed < n) last = parsed
      }
    }
  } catch {
    /* modo privado u orígenes que bloquean storage */
  }

  const pool = Array.from({ length: n }, (_, i) => i).filter((i) => i !== last)
  const idx = pool[Math.floor(Math.random() * pool.length)]!

  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(STORAGE_LAST_INDEX, String(idx))
    }
  } catch {
    /* ignore */
  }

  return SUDOKU9_PUZZLES[idx]!
}
