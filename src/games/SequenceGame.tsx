import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumericKeypad } from "@/components/numeric-keypad"
import type { GameProps } from "@/games/types"
import { useStableRandom } from "@/hooks/use-stable-random"
import { buildRandomSequencePuzzle } from "@/lib/sequencePuzzle"

const MAX_DIGITS = 9

function sanitizeSignedIntegerInput(raw: string): string {
  const only = raw.replace(/[^\d-]/g, "")
  const leadingMinus = only.startsWith("-")
  const digits = only.replace(/-/g, "").slice(0, MAX_DIGITS)
  if (digits === "") return leadingMinus ? "-" : ""
  return leadingMinus ? `-${digits}` : digits
}

export function SequenceGame({ onWin }: GameProps) {
  const puzzle = useStableRandom(() => buildRandomSequencePuzzle())

  const [value, setValue] = useState("")
  const [feedback, setFeedback] = useState<"bad" | null>(null)

  const sequenceText = [...puzzle.shown.map(String), "?"].join(", ")

  function check() {
    const n = Number.parseInt(value.trim(), 10)
    if (Number.isNaN(n)) {
      setFeedback("bad")
      return
    }
    if (n === puzzle.answer) {
      onWin?.({
        solutionText: puzzle.explain,
      })
    } else {
      setFeedback("bad")
    }
  }

  function appendDigit(d: string) {
    setFeedback(null)
    setValue((v) => {
      const neg = v.startsWith("-")
      const core = neg ? v.slice(1) : v
      if (core.length >= MAX_DIGITS) return v
      return neg ? `-${core}${d}` : `${v}${d}`
    })
  }

  function backspace() {
    setFeedback(null)
    setValue((v) => v.slice(0, -1))
  }

  function toggleLeadingMinus() {
    setFeedback(null)
    setValue((v) => {
      if (v.startsWith("-")) return v.slice(1)
      return v === "" ? "-" : `-${v}`
    })
  }

  return (
    <div className="flex flex-col gap-4 max-sm:gap-2">
      <p className="text-center font-mono text-base tracking-wide sm:text-lg">
        {sequenceText}
      </p>
      <div className="space-y-2">
        <Label htmlFor="seq-answer">Tu respuesta</Label>
        <Input
          id="seq-answer"
          inputMode="none"
          autoComplete="off"
          placeholder="Número"
          value={value}
          onChange={(e) => {
            setValue(sanitizeSignedIntegerInput(e.target.value))
            setFeedback(null)
          }}
          className="min-h-10 sm:min-h-11"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              e.stopPropagation()
              check()
            }
          }}
        />
        <NumericKeypad
          onDigit={appendDigit}
          onBackspace={backspace}
          onToggleSign={toggleLeadingMinus}
        />
      </div>
      <Button type="button" className="min-h-10 w-full sm:min-h-11" onClick={check}>
        Comprobar
      </Button>
      {feedback === "bad" && (
        <p className="text-center text-sm text-destructive">
          Aún no. Respira e inténtalo de nuevo.
        </p>
      )}
    </div>
  )
}
