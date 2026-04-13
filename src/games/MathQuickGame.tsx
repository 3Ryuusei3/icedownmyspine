import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { GameProps } from "@/games/types"

type MathQuickFilter = "all" | "mul" | "div"

type MathPuzzle = { prompt: string; answer: number }

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const DIVISORS = [3, 4, 5] as const

const FILTER_STORAGE_KEY = "icedownyourspine.mathQuickFilter"

function readStoredFilter(): MathQuickFilter {
  try {
    const v = sessionStorage.getItem(FILTER_STORAGE_KEY)
    if (v === "all" || v === "mul" || v === "div") return v
  } catch {
    /* private mode / no storage */
  }
  return "all"
}

function persistFilter(next: MathQuickFilter) {
  try {
    sessionStorage.setItem(FILTER_STORAGE_KEY, next)
  } catch {
    /* ignore */
  }
}

/** Multiplicación con al menos un factor estrictamente mayor que 10. */
function pickMultiplication(): MathPuzzle {
  const variant = randomInt(0, 2)
  let a: number
  let b: number
  if (variant === 0) {
    a = randomInt(11, 19)
    b = randomInt(2, 12)
  } else if (variant === 1) {
    a = 11
    b = randomInt(11, 16)
  } else {
    a = 20
    b = randomInt(2, 15)
  }
  if (randomInt(0, 1) === 1) {
    ;[a, b] = [b, a]
  }
  return { prompt: `${a} × ${b}`, answer: a * b }
}

/** Cociente entero; divisor 3, 4 o 5; dividendo ≥ 90. */
function pickDivision(): MathPuzzle {
  const divisor = DIVISORS[randomInt(0, DIVISORS.length - 1)]!
  const minQ = Math.ceil(90 / divisor)
  const maxQ = Math.floor(240 / divisor)
  const quotient = randomInt(minQ, maxQ)
  const dividend = quotient * divisor
  return { prompt: `${dividend} ÷ ${divisor}`, answer: quotient }
}

function buildMathPuzzle(filter: MathQuickFilter): MathPuzzle {
  if (filter === "mul") return pickMultiplication()
  if (filter === "div") return pickDivision()
  return Math.random() < 0.5 ? pickMultiplication() : pickDivision()
}

export function MathQuickGame({ onWin }: GameProps) {
  const [filter, setFilter] = useState<MathQuickFilter>(readStoredFilter)
  const puzzle = useMemo(() => buildMathPuzzle(filter), [filter])

  function setFilterAndPersist(next: MathQuickFilter) {
    setFilter(next)
    persistFilter(next)
  }

  const [value, setValue] = useState("")
  const [feedback, setFeedback] = useState<"bad" | null>(null)

  useEffect(() => {
    setValue("")
    setFeedback(null)
  }, [filter])

  function check() {
    const n = Number.parseInt(value.trim(), 10)
    if (Number.isNaN(n)) {
      setFeedback("bad")
      return
    }
    if (n === puzzle.answer) {
      onWin?.({
        solutionText: `${puzzle.prompt} = ${puzzle.answer}`,
      })
    } else {
      setFeedback("bad")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm leading-relaxed">
        Solo multiplicaciones y divisiones (divisor 3, 4 o 5; dividendo a partir
        de 90). Elige el tipo de operaciones (se conserva al volver a jugar):
      </p>
      <div
        className="flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Tipo de operaciones"
      >
        <Button
          type="button"
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          className="min-h-9"
          onClick={() => setFilterAndPersist("all")}
        >
          Todo
        </Button>
        <Button
          type="button"
          size="sm"
          variant={filter === "mul" ? "default" : "outline"}
          className="min-h-9"
          onClick={() => setFilterAndPersist("mul")}
        >
          Solo multiplicaciones
        </Button>
        <Button
          type="button"
          size="sm"
          variant={filter === "div" ? "default" : "outline"}
          className="min-h-9"
          onClick={() => setFilterAndPersist("div")}
        >
          Solo divisiones
        </Button>
      </div>
      <p className="text-center text-2xl font-medium tabular-nums">
        {puzzle.prompt}
        <span className="text-muted-foreground"> = ?</span>
      </p>
      <div className="space-y-2">
        <Label htmlFor="math-answer">Resultado</Label>
        <Input
          id="math-answer"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Número"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setFeedback(null)
          }}
          className="min-h-11 text-base"
          onKeyDown={(e) => {
            if (e.key === "Enter") check()
          }}
        />
      </div>
      <Button type="button" className="min-h-11 w-full" onClick={check}>
        Comprobar
      </Button>
      {feedback === "bad" && (
        <p className="text-center text-sm text-destructive">
          No coincide. Puedes volver a calcular con calma.
        </p>
      )}
    </div>
  )
}
