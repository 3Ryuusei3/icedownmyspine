import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { GameProps } from "@/games/types"
import { useStableRandom } from "@/hooks/use-stable-random"

const WORDS = [
  "GATO",
  "LUNA",
  "MESA",
  "AMOR",
  "CASA",
  "CINE",
  "MANO",
  "SILLA",
  "NUBE",
  "PLATO",
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function normalizeAnswer(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
}

export function AnagramGame({ onWin }: GameProps) {
  const { word, scrambled } = useStableRandom(() => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)]!
    const letters = w.split("")
    let s = shuffle(letters).join("")
    let guard = 0
    while (s === w && guard++ < 20) {
      s = shuffle(letters).join("")
    }
    return { word: w, scrambled: s }
  })

  const [value, setValue] = useState("")
  const [feedback, setFeedback] = useState<"bad" | null>(null)

  function check() {
    if (normalizeAnswer(value) === normalizeAnswer(word)) {
      onWin?.({
        solutionText: `La palabra era «${word}».`,
      })
    } else {
      setFeedback("bad")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm leading-relaxed">
        Las letras están mezcladas. Escribe la palabra en español.
      </p>
      <p
        className="text-center font-mono text-2xl font-semibold tracking-[0.2em]"
        aria-live="polite"
      >
        {scrambled.split("").join(" · ")}
      </p>
      <div className="space-y-2">
        <Label htmlFor="anagram-answer">Palabra</Label>
        <Input
          id="anagram-answer"
          autoComplete="off"
          autoCapitalize="characters"
          placeholder="Escribe aquí"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setFeedback(null)
          }}
          className="min-h-11 text-base"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              e.stopPropagation()
              check()
            }
          }}
        />
      </div>
      <Button type="button" className="min-h-11 w-full" onClick={check}>
        Comprobar
      </Button>
      {feedback === "bad" && (
        <p className="text-center text-sm text-destructive">
          Prueba otra combinación. No hay prisa.
        </p>
      )}
    </div>
  )
}
