const N = 9
const BOX = 3

/** Comprueba que la cuadrícula 9×9 esté completa y sea un sudoku válido. */
export function isValidCompletedSudoku9(grid: readonly number[]): boolean {
  if (grid.length !== N * N) return false
  if (grid.some((c) => c < 1 || c > N)) return false

  for (let r = 0; r < N; r++) {
    const row = Array.from({ length: N }, (_, c) => grid[r * N + c]!)
    if (new Set(row).size !== N) return false
  }
  for (let c = 0; c < N; c++) {
    const col = Array.from({ length: N }, (_, r) => grid[r * N + c]!)
    if (new Set(col).size !== N) return false
  }
  for (let br = 0; br < BOX; br++) {
    for (let bc = 0; bc < BOX; bc++) {
      const box: number[] = []
      for (let dr = 0; dr < BOX; dr++) {
        for (let dc = 0; dc < BOX; dc++) {
          box.push(grid[(br * BOX + dr) * N + (bc * BOX + dc)]!)
        }
      }
      if (new Set(box).size !== N) return false
    }
  }
  return true
}

export function respectsSudoku9Givens(
  grid: readonly number[],
  givens: readonly number[],
): boolean {
  for (let i = 0; i < N * N; i++) {
    if (givens[i] !== 0 && grid[i] !== givens[i]) return false
  }
  return true
}

export function formatSudoku9Lines(grid: readonly number[]): string {
  const lines: string[] = []
  for (let r = 0; r < N; r++) {
    lines.push(
      grid
        .slice(r * N, r * N + N)
        .map(String)
        .join(" "),
    )
  }
  return lines.join("\n")
}
