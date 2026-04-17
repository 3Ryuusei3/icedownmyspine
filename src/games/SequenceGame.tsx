import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumericKeypad } from "@/components/numeric-keypad"
import type { GameProps } from "@/games/types"
import { useStableRandom } from "@/hooks/use-stable-random"
import { buildRandomSequencePuzzle } from "@/lib/sequencePuzzle"

export function SequenceGame({ onWin }: GameProps) {
  const puzzle = useStableRandom(() => buildRandomSequencePuzzle())

  const [value, setValue] = useState("")
  const [feedback, setFeedback] = useState<"bad" | null>(null)
  const [padOpen, setPadOpen] = useState(false)
  const answerBlockRef = useRef<HTMLDivElement>(null)

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
    setValue((v) => (v.length >= 9 ? v : v + d))
  }

  function backspace() {
    setFeedback(null)
    setValue((v) => v.slice(0, -1))
  }

  return (
    <div className="flex flex-col gap-4 max-sm:gap-2">
      <p className="text-muted-foreground max-sm:text-xs max-sm:leading-snug text-sm leading-relaxed">
        ¿Qué número sigue? El patrón puede ser una suma fija, saltos que
        alternan, cuadrados, productos… Tómate un momento para mirar la serie.
      </p>
      <p className="text-center font-mono text-base tracking-wide sm:text-lg">
        {sequenceText}
      </p>
      <div ref={answerBlockRef} className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="seq-answer">Tu respuesta</Label>
          <Input
            id="seq-answer"
            inputMode="none"
            autoComplete="off"
            placeholder="Número"
            value={value}
            onFocus={() => setPadOpen(true)}
            onBlur={(e) => {
              const next = e.relatedTarget as Node | null
              if (next && answerBlockRef.current?.contains(next)) return
              if (next !== null) {
                setPadOpen(false)
                return
              }
              window.setTimeout(() => {
                const el = document.activeElement as Node | null
                if (el && answerBlockRef.current?.contains(el)) return
                setPadOpen(false)
              }, 0)
            }}
            onChange={(e) => {
              setValue(e.target.value.replace(/\D/g, ""))
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
          {padOpen && (
            <NumericKeypad onDigit={appendDigit} onBackspace={backspace} />
          )}
        </div>
        <Button type="button" className="min-h-10 w-full sm:min-h-11" onClick={check}>
          Comprobar
        </Button>
      </div>
      {feedback === "bad" && (
        <p className="text-center text-sm text-destructive">
          Aún no. Respira e inténtalo de nuevo.
        </p>
      )}
    </div>
  )
}
