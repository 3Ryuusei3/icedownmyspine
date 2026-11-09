import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
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

type Phase = "idle" | "showing" | "input" | "wrong"

function buildPattern(): Set<number> {
  const count =
    Math.floor(Math.random() * (MAX_TARGETS - MIN_TARGETS + 1)) + MIN_TARGETS
  const all = Array.from({ length: CELLS }, (_, i) => i)
  return new Set(shuffle(all).slice(0, count))
}

export function MemoryGridGame({ onWin }: GameProps) {
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
        solutionText: `Recordaste las ${pattern.size} casillas en la cuadrícula de ${SIZE}x${SIZE}.`,
      })
    } else {
      setPhase("wrong")
    }
  }

  let status = "Pulsa «Empezar» y memoriza las casillas iluminadas."
  if (phase === "showing")
    status = `Memoriza ${pattern.size} casillas · ${Math.ceil(remainingMs / 1000)} s`
  if (phase === "input")
    status = `Marca las ${pattern.size} casillas: ${selected.size} / ${pattern.size}`
  if (phase === "wrong") status = "No es correcto. Verde: acertadas · Rojo: fallos."

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
          aria-label="Tiempo restante para memorizar"
        />
      </div>
      <div
        className="mx-auto grid w-full max-w-sm grid-cols-5 gap-1.5 sm:max-w-md sm:gap-2.5"
        role="grid"
        aria-label="Cuadrícula de memoria"
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
              aria-label={`Casilla ${i + 1}`}
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
          Reiniciar
        </Button>
        {phase === "idle" ? (
          <Button type="button" className={ROW_BTN} onClick={start}>
            Empezar
          </Button>
        ) : phase === "wrong" ? (
          <Button type="button" className={ROW_BTN} onClick={() => show(pattern)}>
            Reintentar
          </Button>
        ) : (
          <Button
            type="button"
            className={ROW_BTN}
            disabled={phase !== "input" || selected.size !== pattern.size}
            onClick={check}
          >
            Comprobar
          </Button>
        )}
      </div>
    </div>
  )
}
