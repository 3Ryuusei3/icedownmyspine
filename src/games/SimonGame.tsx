import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useUi } from "@/i18n/use-ui"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useLang } from "@/lib/language"
import type { GameProps } from "@/games/types"

type Pad = { label: { es: string; en: string }; idle: string; lit: string }

const PADS: Pad[] = [
  { label: { es: "Rojo", en: "Red" }, idle: "bg-red-400/30", lit: "bg-red-400 shadow-lg shadow-red-400/50" },
  { label: { es: "Azul", en: "Blue" }, idle: "bg-sky-400/30", lit: "bg-sky-400 shadow-lg shadow-sky-400/50" },
  { label: { es: "Verde", en: "Green" }, idle: "bg-emerald-400/30", lit: "bg-emerald-400 shadow-lg shadow-emerald-400/50" },
  { label: { es: "Amarillo", en: "Yellow" }, idle: "bg-amber-300/30", lit: "bg-amber-300 shadow-lg shadow-amber-300/50" },
]

const PAD_COUNT = 4

/** Longitud de la secuencia por nivel. */
const LEVELS = [{ length: 4 }, { length: 5 }, { length: 6 }]

const COPY = {
  es: {
    won: "Completaste los 3 niveles: secuencias de 4, 5 y 6 colores. ¡Gran memoria!",
    start: "Pulsa «Empezar» para ver la secuencia.",
    showing: "Mira la secuencia…",
    turn: (done: number, total: number) => `Tu turno: ${done} / ${total}`,
    failed: "Te has equivocado. Inténtalo de nuevo.",
    levelUp: (n: number) => `¡Nivel ${n} superado!`,
    allDone: "¡Completaste los 3 niveles!",
    level: (n: number, total: number, colors: number) =>
      `Nivel ${n} de ${total} · ${colors} colores`,
    pads: "Botones de Simón",
    next: (colors: number) => `Siguiente reto: una secuencia de ${colors} colores.`,
    continueTo: (n: number, total: number) => `Continuar con el nivel ${n}/${total}`,
    retry: "Reintentar nivel",
  },
  en: {
    won: "You completed all 3 levels: sequences of 4, 5 and 6 colors. Great memory!",
    start: "Press “Start” to see the sequence.",
    showing: "Watch the sequence…",
    turn: (done: number, total: number) => `Your turn: ${done} / ${total}`,
    failed: "You slipped. Try again.",
    levelUp: (n: number) => `Level ${n} cleared!`,
    allDone: "You completed all 3 levels!",
    level: (n: number, total: number, colors: number) =>
      `Level ${n} of ${total} · ${colors} colors`,
    pads: "Simon buttons",
    next: (colors: number) => `Next challenge: a sequence of ${colors} colors.`,
    continueTo: (n: number, total: number) => `Continue to level ${n}/${total}`,
    retry: "Retry level",
  },
}

const STEP_MS = 650
const LIT_MS = 400

const BTN = "min-h-10 w-full sm:min-h-11"
const ROW_BTN =
  "min-h-10 min-w-0 flex-1 px-2 text-sm sm:min-h-11 sm:px-3 sm:text-base"

type Phase = "idle" | "showing" | "input" | "failed" | "levelUp" | "won"

function buildSequence(length: number) {
  return Array.from({ length }, () => Math.floor(Math.random() * PAD_COUNT))
}

export function SimonGame({ onWin, onSwapGame }: GameProps) {
  const { lang } = useLang()
  const c = COPY[lang]
  const ui = useUi()
  const [level, setLevel] = useState(0)
  const [sequence, setSequence] = useState<number[]>([])
  const [phase, setPhase] = useState<Phase>("idle")
  const [lit, setLit] = useState<number | null>(null)
  const [inputIdx, setInputIdx] = useState(0)

  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const later = useCallback((fn: () => void, ms: number) => {
    timeouts.current.push(setTimeout(fn, ms))
  }, [])

  const flash = useCallback(
    (pad: number) => {
      setLit(pad)
      later(() => setLit(null), LIT_MS)
    },
    [later],
  )

  const playLevel = useCallback(
    (lvl: number) => {
      clearTimers()
      const { length } = LEVELS[lvl]!
      const seq = buildSequence(length)
      setLevel(lvl)
      setSequence(seq)
      setInputIdx(0)
      setLit(null)
      setPhase("showing")
      seq.forEach((pad, i) => later(() => flash(pad), 700 + i * STEP_MS))
      later(() => setPhase("input"), 700 + seq.length * STEP_MS)
    },
    [clearTimers, flash, later],
  )

  function restart() {
    clearTimers()
    setLevel(0)
    setSequence([])
    setInputIdx(0)
    setLit(null)
    setPhase("idle")
  }

  function onPad(pad: number) {
    if (phase !== "input") return
    flash(pad)
    if (pad !== sequence[inputIdx]) {
      setPhase("failed")
      return
    }
    const next = inputIdx + 1
    if (next < sequence.length) {
      setInputIdx(next)
      return
    }
    if (level + 1 < LEVELS.length) {
      // Pequeña pausa para ver el último color antes del aviso de nivel superado.
      later(() => setPhase("levelUp"), LIT_MS)
    } else {
      setPhase("won")
      onWin?.({
        solutionText: c.won,
      })
    }
  }

  const { length } = LEVELS[level]!

  let status = c.start
  if (phase === "showing") status = c.showing
  if (phase === "input") status = c.turn(inputIdx, sequence.length)
  if (phase === "failed") status = c.failed
  if (phase === "levelUp") status = c.levelUp(level + 1)
  if (phase === "won") status = c.allDone

  return (
    <div className="flex flex-col gap-4 max-sm:gap-3">
      <p className="text-center text-base font-medium sm:text-lg">
        {c.level(level + 1, LEVELS.length, length)}
      </p>
      <p
        className={cn(
          "min-h-5 text-center text-sm",
          phase === "failed" && "text-destructive font-medium",
          (phase === "levelUp" || phase === "won") &&
            "font-medium text-emerald-600 dark:text-emerald-400",
          phase !== "failed" &&
            phase !== "levelUp" &&
            phase !== "won" &&
            "text-muted-foreground",
        )}
        aria-live="polite"
      >
        {status}
      </p>
      <div
        className="mx-auto grid w-full max-w-sm grid-cols-2 gap-2 sm:max-w-md sm:gap-3"
        role="group"
        aria-label={c.pads}
      >
        {PADS.map((p, i) => (
          <button
            key={p.label.es}
            type="button"
            aria-label={p.label[lang]}
            disabled={phase !== "input"}
            onClick={() => onPad(i)}
            className={cn(
              "aspect-square rounded-2xl transition-all duration-150 active:scale-95 disabled:cursor-default",
              lit === i ? p.lit : p.idle,
              lit === i && "scale-[1.03]",
            )}
          />
        ))}
      </div>
      {/* Siempre dos botones en la misma fila para que la altura no cambie. */}
      <div className="flex flex-row gap-2">
        <Button
          type="button"
          variant="secondary"
          className={ROW_BTN}
          disabled={phase === "idle"}
          onClick={restart}
        >
          {ui.playback.reset}
        </Button>
        {phase === "won" ? (
          <Button
            type="button"
            className={ROW_BTN}
            disabled={!onSwapGame}
            onClick={onSwapGame}
          >
            {ui.playAnother}
          </Button>
        ) : (
          <Button
            type="button"
            className={ROW_BTN}
            disabled={phase !== "idle" && phase !== "failed"}
            onClick={() => playLevel(phase === "idle" ? 0 : level)}
          >
            {phase === "idle" ? ui.playback.start : c.retry}
          </Button>
        )}
      </div>

      <Dialog open={phase === "levelUp"}>
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={false}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{c.levelUp(level + 1)}</DialogTitle>
            <DialogDescription>
              {c.next(LEVELS[level + 1]?.length ?? length)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="button"
              className={BTN}
              onClick={() => playLevel(level + 1)}
            >
              {c.continueTo(level + 2, LEVELS.length)}
            </Button>
            <div className="flex flex-row gap-2">
              <Button
                type="button"
                variant="secondary"
                className={ROW_BTN}
                onClick={restart}
              >
                {ui.playback.reset}
              </Button>
              {onSwapGame ? (
                <Button
                  type="button"
                  variant="secondary"
                  className={ROW_BTN}
                  onClick={onSwapGame}
                >
                  {ui.playAnother}
                </Button>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
