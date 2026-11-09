import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useUi } from "@/i18n/use-ui"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useLang } from "@/lib/language"
import type { GameProps } from "@/games/types"
import { shuffle } from "@/lib/shuffle"

const SIZE = 5
const CELLS = SIZE * SIZE
const MIN_TARGETS = 5
const MAX_TARGETS = 15

const ROW_BTN =
  "min-h-10 min-w-0 flex-1 px-2 text-sm sm:min-h-11 sm:px-3 sm:text-base"

/** Más casillas, más tiempo para memorizarlas. */
function showDurationMs(count: number) {
  return 1500 + count * 250
}

const COPY = {
  es: {
    won: (n: number, size: number) =>
      `Recordaste las ${n} casillas en la cuadrícula de ${size}x${size}.`,
    start: "Pulsa «Empezar» y memoriza las casillas iluminadas.",
    memorize: (n: number, s: number) => `Memoriza ${n} casillas · ${s} s`,
    mark: (n: number, sel: number) => `Marca las ${n} casillas: ${sel} / ${n}`,
    wrong: "No es correcto. Verde: acertadas · Rojo: fallos.",
    timeLeft: "Tiempo restante para memorizar",
    grid: "Cuadrícula de memoria",
    cell: (n: number) => `Casilla ${n}`,
    check: "Comprobar",
    retry: "Reintentar",
  },
  en: {
    won: (n: number, size: number) =>
      `You remembered all ${n} squares on the ${size}x${size} grid.`,
    start: "Press “Start” and memorize the lit squares.",
    memorize: (n: number, s: number) => `Memorize ${n} squares · ${s} s`,
    mark: (n: number, sel: number) => `Mark the ${n} squares: ${sel} / ${n}`,
    wrong: "Not quite. Green: correct · Red: misses.",
    timeLeft: "Time left to memorize",
    grid: "Memory grid",
    cell: (n: number) => `Square ${n}`,
    check: "Check",
    retry: "Retry",
  },
}

type Phase = "idle" | "showing" | "input" | "wrong"

function buildPattern(): Set<number> {
  const count =
    Math.floor(Math.random() * (MAX_TARGETS - MIN_TARGETS + 1)) + MIN_TARGETS
  const all = Array.from({ length: CELLS }, (_, i) => i)
  return new Set(shuffle(all).slice(0, count))
}

export function MemoryGridGame({ onWin }: GameProps) {
  const { lang } = useLang()
  const c = COPY[lang]
  const ui = useUi()
  const [pattern, setPattern] = useState<Set<number>>(() => new Set())
  const [selected, setSelected] = useState<Set<number>>(() => new Set())
  const [phase, setPhase] = useState<Phase>("idle")
  const [remainingMs, setRemainingMs] = useState(0)
  const [totalMs, setTotalMs] = useState(1)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      clearInterval(timer.current)
      timer.current = null
    }
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  const show = useCallback(
    (p: Set<number>) => {
      clearTimer()
      setSelected(new Set())
      setPhase("showing")
      const total = showDurationMs(p.size)
      const end = Date.now() + total
      setTotalMs(total)
      setRemainingMs(total)
      timer.current = setInterval(() => {
        const left = end - Date.now()
        if (left <= 0) {
          clearTimer()
          setRemainingMs(0)
          setPhase("input")
        } else {
          setRemainingMs(left)
        }
      }, 100)
    },
    [clearTimer],
  )

  function start() {
    const p = buildPattern()
    setPattern(p)
    show(p)
  }

  function restart() {
    clearTimer()
    setPattern(new Set())
    setSelected(new Set())
    setPhase("idle")
  }

  function toggle(i: number) {
    if (phase !== "input" && phase !== "wrong") return
    if (phase === "wrong") return
    const next = new Set(selected)
    if (next.has(i)) next.delete(i)
    else next.add(i)
    setSelected(next)
  }

  function check() {
    const ok =
      selected.size === pattern.size && [...selected].every((i) => pattern.has(i))
    if (ok) {
      onWin?.({
        solutionText: c.won(pattern.size, SIZE),
      })
    } else {
      setPhase("wrong")
    }
  }

  let status = c.start
  if (phase === "showing")
    status = c.memorize(pattern.size, Math.ceil(remainingMs / 1000))
  if (phase === "input")
    status = c.mark(pattern.size, selected.size)
  if (phase === "wrong") status = c.wrong

  return (
    <div className="flex flex-col gap-4 max-sm:gap-3">
      <p
        className={cn(
          "min-h-10 text-center text-sm sm:min-h-12 sm:text-base",
          phase === "wrong" ? "text-destructive font-medium" : "text-muted-foreground",
        )}
        aria-live="polite"
      >
        {status}
      </p>
      <div className="mx-auto h-1 w-full max-w-sm sm:max-w-md">
        <Progress
          value={phase === "showing" ? (remainingMs / totalMs) * 100 : 0}
          className={phase === "showing" ? undefined : "invisible"}
          aria-label={c.timeLeft}
        />
      </div>
      <div
        className="mx-auto grid w-full max-w-sm grid-cols-5 gap-1.5 sm:max-w-md sm:gap-2.5"
        role="grid"
        aria-label={c.grid}
      >
        {Array.from({ length: CELLS }, (_, i) => {
          const inPattern = pattern.has(i)
          const isSel = selected.has(i)
          let style = "bg-card hover:bg-muted/70"
          if (phase === "showing" && inPattern)
            style = "border-primary bg-primary text-primary-foreground"
          else if (phase === "input" && isSel)
            style = "border-primary bg-primary/30"
          else if (phase === "wrong") {
            if (inPattern && isSel)
              style = "border-emerald-600/60 bg-emerald-600/25"
            else if (inPattern)
              style = "border-emerald-600/60 border-dashed bg-transparent"
            else if (isSel) style = "border-red-500/60 bg-red-500/25"
          }
          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              aria-label={c.cell(i + 1)}
              aria-pressed={isSel}
              disabled={phase === "idle" || phase === "showing"}
              onClick={() => toggle(i)}
              className={cn(
                "border-border aspect-square min-h-10 rounded-lg border-2 transition-colors active:scale-[0.97] disabled:cursor-default sm:min-h-14",
                style,
              )}
            />
          )
        })}
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
        {phase === "idle" ? (
          <Button type="button" className={ROW_BTN} onClick={start}>
            {ui.playback.start}
          </Button>
        ) : phase === "wrong" ? (
          <Button type="button" className={ROW_BTN} onClick={() => show(pattern)}>
            {c.retry}
          </Button>
        ) : (
          <Button
            type="button"
            className={ROW_BTN}
            disabled={phase !== "input" || selected.size !== pattern.size}
            onClick={check}
          >
            {c.check}
          </Button>
        )}
      </div>
    </div>
  )
}
