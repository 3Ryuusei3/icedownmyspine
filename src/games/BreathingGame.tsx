import { Minus, Plus } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  PlaybackControls,
  type PlaybackStatus,
} from "@/components/playback-controls"

type Phase = "idle" | "inhale" | "hold" | "exhale" | "done"

type Setting = {
  key: "inhale" | "hold" | "exhale" | "cycles"
  label: string
  min: number
  max: number
  unit: string
}

/** Valores por defecto habituales: inhalar 4 s, mantener 4 s, exhalar 6 s. */
const DEFAULTS = { inhale: 4, hold: 4, exhale: 6, cycles: 5 }

const SETTINGS: Setting[] = [
  { key: "inhale", label: "Inhalar", min: 2, max: 8, unit: "s" },
  { key: "hold", label: "Mantener", min: 0, max: 8, unit: "s" },
  { key: "exhale", label: "Exhalar", min: 2, max: 10, unit: "s" },
  { key: "cycles", label: "Respiraciones", min: 3, max: 10, unit: "" },
]

type Config = typeof DEFAULTS

const LABELS: Record<Phase, string> = {
  idle: "",
  inhale: "Inhala",
  hold: "Sostén",
  exhale: "Exhala",
  done: "Bien hecho",
}

/** Radio del círculo (sobre 50) cuando está encogido y expandido. */
const R_MIN = 28
const R_MAX = 46

/** Suaviza el arranque y el final de cada movimiento, como una respiración real. */
const easeInOutSine = (p: number) => 0.5 - Math.cos(Math.PI * p) / 2

function stateAt(sec: number, c: Config) {
  const cycleLen = c.inhale + c.hold + c.exhale
  const pos = sec % cycleLen
  const cycle = Math.floor(sec / cycleLen) + 1
  if (pos < c.inhale) {
    return {
      phase: "inhale" as const,
      left: c.inhale - pos,
      cycle,
      radius: R_MIN + (R_MAX - R_MIN) * easeInOutSine(pos / c.inhale),
    }
  }
  if (pos < c.inhale + c.hold) {
    return {
      phase: "hold" as const,
      left: c.inhale + c.hold - pos,
      cycle,
      radius: R_MAX,
    }
  }
  const p = (pos - c.inhale - c.hold) / c.exhale
  return {
    phase: "exhale" as const,
    left: cycleLen - pos,
    cycle,
    radius: R_MAX - (R_MAX - R_MIN) * easeInOutSine(p),
  }
}

export function BreathingGame() {
  const [config, setConfig] = useState<Config>(DEFAULTS)
  const [status, setStatus] = useState<PlaybackStatus>("idle")
  const [elapsed, setElapsed] = useState(0) // segundos
  const elapsedRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const stopLoop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  useEffect(() => stopLoop, [])

  function runLoop() {
    stopLoop()
    const total = (config.inhale + config.hold + config.exhale) * config.cycles
    let last = performance.now()
    const frame = (now: number) => {
      // Si la pestaña estuvo oculta, no saltamos: contamos como mucho 100 ms.
      elapsedRef.current += Math.min(now - last, 100) / 1000
      last = now
      if (elapsedRef.current >= total) {
        rafRef.current = null
        setElapsed(total)
        setStatus("done")
        return
      }
      setElapsed(elapsedRef.current)
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
  }

  function play() {
    if (status === "idle" || status === "done") {
      elapsedRef.current = 0
      setElapsed(0)
    }
    setStatus("playing")
    runLoop()
  }

  function pause() {
    stopLoop()
    setStatus("paused")
  }

  function reset() {
    stopLoop()
    elapsedRef.current = 0
    setElapsed(0)
    setStatus("idle")
  }

  function change(key: Setting["key"], delta: number, min: number, max: number) {
    setConfig((c) => ({ ...c, [key]: Math.min(max, Math.max(min, c[key] + delta)) }))
  }

  const active = status === "playing" || status === "paused"
  const current = active ? stateAt(elapsed, config) : null
  const phase: Phase = current?.phase ?? (status === "done" ? "done" : "idle")
  const radius = current?.radius ?? R_MIN

  let statusText = "Ajusta la respiración y pulsa «Empezar»."
  if (current) {
    statusText =
      status === "paused"
        ? `En pausa · respiración ${current.cycle} de ${config.cycles}`
        : `Respiración ${current.cycle} de ${config.cycles}`
  }
  if (status === "done") statusText = `Has completado las ${config.cycles} respiraciones.`

  return (
    <div className="flex flex-col gap-4 max-sm:gap-3">
      <p className="text-muted-foreground min-h-5 text-center text-sm" aria-live="polite">
        {statusText}
      </p>

      <div className="relative mx-auto size-56 sm:size-64">
        {/* Se dibuja en SVG y se anima cuadro a cuadro: sin transiciones CSS, el
            movimiento sigue exactamente el ritmo y se congela al pausar. */}
        <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
          <circle
            cx="50"
            cy="50"
            r={R_MAX}
            className="fill-none stroke-border"
            strokeWidth="0.6"
            strokeDasharray="1.5 2.5"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="fill-accent stroke-primary/40"
            strokeWidth="0.8"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
          {phase === "done" ? (
            // Al terminar, solo la palabra, justo en el centro.
            <span className="text-xl font-medium sm:text-2xl">{LABELS[phase]}</span>
          ) : (
            <>
              <span className="min-h-8 text-xl font-medium sm:text-2xl">
                {LABELS[phase]}
              </span>
              <span className="text-muted-foreground min-h-7 text-lg tabular-nums">
                {current ? Math.ceil(current.left) : ""}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-sm grid-cols-2 gap-x-4 gap-y-3">
        {SETTINGS.map((s) => {
          const value = config[s.key]
          return (
            <div key={s.key} className="flex flex-col items-center gap-1">
              <span className="text-muted-foreground text-xs">{s.label}</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label={`Menos ${s.label.toLowerCase()}`}
                  disabled={active || value <= s.min}
                  onClick={() => change(s.key, -1, s.min, s.max)}
                >
                  <Minus aria-hidden className="size-4" />
                </Button>
                <span className="min-w-12 text-center text-sm font-medium tabular-nums">
                  {s.key === "hold" && value === 0 ? "No" : `${value}${s.unit}`}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label={`Más ${s.label.toLowerCase()}`}
                  disabled={active || value >= s.max}
                  onClick={() => change(s.key, 1, s.min, s.max)}
                >
                  <Plus aria-hidden className="size-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <PlaybackControls
        status={status}
        onPlay={play}
        onPause={pause}
        onReset={reset}
      />
    </div>
  )
}
