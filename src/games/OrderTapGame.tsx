import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { GameProps } from "@/games/types"
import { useStableRandom } from "@/hooks/use-stable-random"
import { shuffle } from "@/lib/shuffle"

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

type OrderRound = {
  start: number
  end: number
  numbers: number[]
  layout: number[]
}

function buildOrderRound(): OrderRound {
  const start = randomInt(1, 85)
  const end = start + 15
  const numbers = Array.from({ length: 16 }, (_, i) => start + i)
  return {
    start,
    end,
    numbers,
    layout: shuffle([...numbers]),
  }
}

export function OrderTapGame({ onWin }: GameProps) {
  const round = useStableRandom(() => buildOrderRound())

  const [nextExpected, setNextExpected] = useState(round.start)
  const [completed, setCompleted] = useState<Set<number>>(() => new Set())
  const [wrongFlash, setWrongFlash] = useState(false)
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current !== null) {
        clearTimeout(flashTimeoutRef.current)
      }
    }
  }, [])

  function onCell(n: number) {
    if (n === nextExpected) {
      setWrongFlash(false)
      if (flashTimeoutRef.current !== null) {
        clearTimeout(flashTimeoutRef.current)
        flashTimeoutRef.current = null
      }
      if (n === round.end) {
        setCompleted(new Set(round.numbers))
        onWin?.({
          solutionText: `Orden correcto: del ${round.start} al ${round.end} sin fallar en esta disposición.`,
        })
      } else {
        setCompleted((prev) => new Set([...prev, n]))
        setNextExpected(n + 1)
      }
    } else {
      setNextExpected(round.start)
      setCompleted(new Set())
      setWrongFlash(true)
      if (flashTimeoutRef.current !== null) {
        clearTimeout(flashTimeoutRef.current)
      }
      flashTimeoutRef.current = setTimeout(() => {
        setWrongFlash(false)
        flashTimeoutRef.current = null
      }, 450)
    }
  }

  const gridLabel = `Cuadrícula del ${round.start} al ${round.end}`

  return (
    <div className="flex flex-col gap-4 max-sm:gap-2">
      <p className="text-muted-foreground max-sm:text-xs max-sm:leading-snug text-sm leading-relaxed">
        Pulsa los números del <strong>{round.start}</strong> al{" "}
        <strong>{round.end}</strong> en orden (16 números seguidos entre 1 y
        100). Si te equivocas, vuelves a empezar desde el {round.start} (los
        números no se mueven). Los acertados se marcan en verde.
      </p>
      <p
        className={cn(
          "text-center text-sm font-medium",
          wrongFlash && "text-destructive animate-pulse",
        )}
        aria-live="polite"
      >
        {wrongFlash
          ? `Orden incorrecto — empieza otra vez por el ${round.start}.`
          : `Siguiente: ${nextExpected}`}
      </p>
      <div
        className="mx-auto grid w-full max-w-xs grid-cols-4 gap-1.5 sm:max-w-sm sm:gap-3"
        role="grid"
        aria-label={gridLabel}
      >
        {round.layout.map((n, i) => {
          const isDone = completed.has(n)
          const isNext = nextExpected === n && !isDone
          return (
            <button
              key={`${i}-${n}`}
              type="button"
              role="gridcell"
              aria-label={`Número ${n}${isDone ? ", ya acertado" : ""}`}
              onClick={() => onCell(n)}
              className={cn(
                "border-border flex aspect-square min-h-[2.75rem] items-center justify-center rounded-xl border-2 text-base font-semibold tabular-nums transition-colors active:scale-[0.98] sm:min-h-16 sm:text-xl",
                isDone &&
                  "border-emerald-600/50 bg-emerald-600/15 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-100",
                !isDone && "bg-card hover:bg-muted/70",
                isNext &&
                  "ring-primary ring-offset-background ring-2 ring-offset-2",
              )}
            >
              {n}
            </button>
          )
        })}
      </div>
    </div>
  )
}
