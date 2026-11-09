import { Button } from "@/components/ui/button"

export type PlaybackStatus = "idle" | "playing" | "paused" | "done"

type PlaybackControlsProps = {
  status: PlaybackStatus
  /** Empezar (idle/done) o continuar (paused). */
  onPlay: () => void
  onPause: () => void
  onReset: () => void
}

const BTN =
  "min-h-10 min-w-0 flex-1 px-2 text-sm sm:min-h-11 sm:px-3 sm:text-base"

/**
 * Reiniciar + Empezar/Pausar/Continuar. Siempre dos botones en la misma fila:
 * solo cambian el texto y el estado, para que la altura nunca varíe.
 */
export function PlaybackControls({
  status,
  onPlay,
  onPause,
  onReset,
}: PlaybackControlsProps) {
  const playing = status === "playing"
  return (
    <div className="flex flex-row gap-2">
      <Button
        type="button"
        variant="secondary"
        className={BTN}
        disabled={status === "idle"}
        onClick={onReset}
      >
        Reiniciar
      </Button>
      <Button type="button" className={BTN} onClick={playing ? onPause : onPlay}>
        {playing ? "Pausar" : status === "paused" ? "Continuar" : "Empezar"}
      </Button>
    </div>
  )
}
