/** Comprueba que la cuadrícula 4×4 esté completa y sea un sudoku válido. */
export function isValidCompletedSudoku4(grid: readonly number[]): boolean {
  if (grid.length !== 16) return false
  if (grid.some((c) => c < 1 || c > 4)) return false

  for (let r = 0; r < 4; r++) {
    const row = [0, 1, 2, 3].map((c) => grid[r * 4 + c]!)
    if (new Set(row).size !== 4) return false
  }
  for (let c = 0; c < 4; c++) {
    const col = [0, 1, 2, 3].map((r) => grid[r * 4 + c]!)
    if (new Set(col).size !== 4) return false
  }
  for (let br = 0; br < 2; br++) {
    for (let bc = 0; bc < 2; bc++) {
      const box: number[] = []
      for (let dr = 0; dr < 2; dr++) {
        for (let dc = 0; dc < 2; dc++) {
          box.push(grid[(br * 2 + dr) * 4 + (bc * 2 + dc)]!)
        }
      }
      if (new Set(box).size !== 4) return false
    }
  }
  return true
}

export function respectsSudokuGivens(
  grid: readonly number[],
  givens: readonly number[],
): boolean {
  for (let i = 0; i < 16; i++) {
    if (givens[i] !== 0 && grid[i] !== givens[i]) return false
  }
  return true
}

export function formatSudoku4Lines(grid: readonly number[]): string {
  const lines: string[] = []
  for (let r = 0; r < 4; r++) {
    lines.push(
      grid
        .slice(r * 4, r * 4 + 4)
        .map(String)
        .join(" "),
    )
  }
  return lines.join("\n")
}
