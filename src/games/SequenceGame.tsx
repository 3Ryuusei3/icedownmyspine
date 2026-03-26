import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { GameProps } from "@/games/types"
import { useStableRandom } from "@/hooks/use-stable-random"
import { buildRandomSequencePuzzle } from "@/lib/sequencePuzzle"

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

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm leading-relaxed">
        ¿Qué número sigue? El patrón puede ser una suma fija, saltos que
        alternan, cuadrados, productos… Tómate un momento para mirar la serie.
      </p>
      <p className="text-center font-mono text-lg tracking-wide">
        {sequenceText}
      </p>
      <div className="space-y-2">
        <Label htmlFor="seq-answer">Tu respuesta</Label>
        <Input
          id="seq-answer"
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
          Aún no. Respira e inténtalo de nuevo.
        </p>
      )}
    </div>
  )
}
