export type WinPayload = {
  /** Texto para mostrar en el modal; omitir o null si no aplica (ej. grounding). */
  solutionText?: string | null
}

export type GameProps = {
  onWin?: (payload?: WinPayload) => void
  /** Avisa de una partida completada sin abrir el modal de victoria (juegos de relajación). */
  onComplete?: () => void
  /** Texto breve que se muestra fuera de la caja del juego, alineado a la derecha (null lo oculta). */
  onStatusChange?: (text: string | null) => void
  /** Cambia a otro juego (para juegos con sus propios menús, como los niveles de Simón). */
  onSwapGame?: () => void
}
