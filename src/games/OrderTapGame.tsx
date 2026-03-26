import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { GameProps } from "@/games/types"
import { useStableRandom } from "@/hooks/use-stable-random"
import { shuffle } from "@/lib/shuffle"

const NUMBERS = Array.from({ length: 16 }, (_, i) => i + 1)

export function OrderTapGame({ onWin }: GameProps) {
  const layout = useStableRandom(() => shuffle([...NUMBERS]))

  const [nextExpected, setNextExpected] = useState(1)
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
      if (n === 16) {
        setCompleted(new Set(NUMBERS))
        onWin?.({
          solutionText:
            "Orden correcto: has pulsado del 1 al 16 sin fallar en esta disposición.",
        })
      } else {
        setCompleted((prev) => new Set([...prev, n]))
        setNextExpected(n + 1)
      }
    } else {
      setNextExpected(1)
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

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm leading-relaxed">
        Pulsa los números del <strong>1</strong> al <strong>16</strong> en
        orden. Si te equivocas, vuelves a empezar desde el 1 (los números no se
        mueven). Los acertados se marcan en verde.
      </p>
      <p
        className={cn(
          "text-center text-sm font-medium",
          wrongFlash && "text-destructive animate-pulse",
        )}
        aria-live="polite"
      >
        {wrongFlash
          ? "Orden incorrecto — empieza otra vez por el 1."
          : `Siguiente: ${nextExpected}`}
      </p>
      <div
        className="mx-auto grid w-full max-w-xs grid-cols-4 gap-2 sm:max-w-sm sm:gap-3"
        role="grid"
        aria-label="Cuadrícula del 1 al 16"
      >
        {layout.map((n, i) => {
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
                "border-border flex aspect-square min-h-[3.25rem] items-center justify-center rounded-xl border-2 text-lg font-semibold tabular-nums transition-colors active:scale-[0.98] sm:min-h-16 sm:text-xl",
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
