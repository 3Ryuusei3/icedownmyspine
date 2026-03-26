/** 4×4 sudoku: filas de izquierda a derecha, de arriba abajo. 0 = vacío. */

export type Sudoku4Puzzle = {
  initial: readonly number[]
  solution: readonly number[]
}

export const SUDOKU4_PUZZLES: Sudoku4Puzzle[] = [
  {
    initial: [3, 4, 0, 0, 2, 0, 4, 0, 0, 3, 0, 1, 0, 0, 3, 4],
    solution: [3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1, 1, 2, 3, 4],
  },
  {
    initial: [1, 0, 0, 4, 0, 4, 1, 0, 0, 1, 4, 0, 4, 0, 0, 1],
    solution: [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1],
  },
  {
    initial: [2, 1, 0, 0, 0, 0, 2, 1, 1, 0, 0, 3, 0, 3, 1, 0],
    solution: [2, 1, 4, 3, 4, 3, 2, 1, 1, 2, 3, 4, 3, 4, 1, 2],
  },
]
