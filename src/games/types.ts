export type WinPayload = {
  /** Texto para mostrar en el modal; omitir o null si no aplica (ej. grounding). */
  solutionText?: string | null
}

export type GameProps = {
  onWin?: (payload?: WinPayload) => void
}
