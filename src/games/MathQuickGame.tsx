import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { GameProps } from "@/games/types"
import { useStableRandom } from "@/hooks/use-stable-random"

type OpKind = "mul" | "half" | "add" | "sub"

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickOp(): OpKind {
  const kinds: OpKind[] = ["mul", "half", "add", "sub"]
  return kinds[randomInt(0, kinds.length - 1)]!
}

/** Multiplicación con al menos un factor estrictamente mayor que 10. */
function pickMultiplication(): { prompt: string; answer: number } {
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

export function MathQuickGame({ onWin }: GameProps) {
  const puzzle = useStableRandom(() => {
    const op = pickOp()
    switch (op) {
      case "mul":
        return pickMultiplication()
      case "half": {
        const n = randomInt(4, 40) * 2
        return { prompt: `La mitad de ${n}`, answer: n / 2 }
      }
      case "add": {
        const a = randomInt(5, 40)
        const b = randomInt(5, 40)
        return { prompt: `${a} + ${b}`, answer: a + b }
      }
      case "sub": {
        const a = randomInt(20, 60)
        const b = randomInt(5, a - 1)
        return { prompt: `${a} − ${b}`, answer: a - b }
      }
    }
  })

  const [value, setValue] = useState("")
  const [feedback, setFeedback] = useState<"bad" | null>(null)

  function check() {
    const n = Number.parseFloat(value.trim().replace(",", "."))
    if (Number.isNaN(n)) {
      setFeedback("bad")
      return
    }
    if (Math.abs(n - puzzle.answer) < 1e-9) {
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
        Resuelve mentalmente y escribe el resultado.
      </p>
      <p className="text-center text-2xl font-medium tabular-nums">
        {puzzle.prompt}
        <span className="text-muted-foreground"> = ?</span>
      </p>
      <div className="space-y-2">
        <Label htmlFor="math-answer">Resultado</Label>
        <Input
          id="math-answer"
          inputMode="decimal"
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
