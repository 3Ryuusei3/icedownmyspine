import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { GameProps } from "@/games/types"
import { useStableRandom } from "@/hooks/use-stable-random"

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/** Cada entrada: emoji a contar y texto para la pregunta / solución */
const TARGET_TYPES = [
  { emoji: "🐱", noun: "gatos", question: "¿Cuántos gatos ves?" },
  { emoji: "🐶", noun: "perros", question: "¿Cuántos perros ves?" },
  { emoji: "⭐", noun: "estrellas", question: "¿Cuántas estrellas ves?" },
  { emoji: "🌙", noun: "lunas", question: "¿Cuántas lunas ves?" },
  { emoji: "🌸", noun: "flores", question: "¿Cuántas flores ves?" },
  { emoji: "🍎", noun: "manzanas", question: "¿Cuántas manzanas ves?" },
  { emoji: "🍕", noun: "porciones de pizza", question: "¿Cuántas pizzas ves?" },
  { emoji: "🎈", noun: "globos", question: "¿Cuántos globos ves?" },
  { emoji: "🎵", noun: "notas musicales", question: "¿Cuántas notas musicales ves?" },
  { emoji: "⚽", noun: "balones", question: "¿Cuántos balones ves?" },
  { emoji: "🦋", noun: "mariposas", question: "¿Cuántas mariposas ves?" },
  { emoji: "🌈", noun: "arcoíris", question: "¿Cuántos arcoíris ves?" },
  { emoji: "🍦", noun: "helados", question: "¿Cuántos helados ves?" },
  { emoji: "🎁", noun: "regalos", question: "¿Cuántos regalos ves?" },
  { emoji: "🚀", noun: "cohetes", question: "¿Cuántos cohetes ves?" },
  { emoji: "🐸", noun: "ranas", question: "¿Cuántas ranas ves?" },
  { emoji: "🍩", noun: "donuts", question: "¿Cuántos donuts ves?" },
  { emoji: "💧", noun: "gotas", question: "¿Cuántas gotas ves?" },
  { emoji: "🔔", noun: "campanas", question: "¿Cuántas campanas ves?" },
  { emoji: "🌻", noun: "girasoles", question: "¿Cuántos girasoles ves?" },
] as const

const POOL = TARGET_TYPES.map((t) => t.emoji)

function randomPosition(seed: number) {
  const x = 6 + ((seed * 17) % 78)
  const y = 5 + ((seed * 23) % 82)
  return { left: `${x}%`, top: `${y}%` }
}

type PlacedEmoji = { emoji: string; key: string; style: { left: string; top: string } }

export function CountShapesGame({ onWin }: GameProps) {
  const round = useStableRandom(() => {
    const target =
      TARGET_TYPES[Math.floor(Math.random() * TARGET_TYPES.length)]!
    const distractorPool = POOL.filter((e) => e !== target.emoji)
    const targetCount = randomInt(5, 20)
    const decoyCount = randomInt(
      Math.max(4, Math.floor(targetCount * 0.35)),
      Math.max(6, Math.floor(targetCount * 0.75)),
    )

    const emojis: string[] = []
    for (let i = 0; i < targetCount; i++) emojis.push(target.emoji)
    for (let i = 0; i < decoyCount; i++) {
      emojis.push(
        distractorPool[Math.floor(Math.random() * distractorPool.length)]!,
      )
    }
    shuffle(emojis)

    const seed = randomInt(1, 999)
    const placed: PlacedEmoji[] = emojis.map((emoji, i) => ({
      emoji,
      key: `e-${seed}-${i}-${emoji}`,
      style: randomPosition(seed + i * 37),
    }))

    return {
      target,
      targetCount,
      placed,
    }
  })

  const [value, setValue] = useState("")
  const [feedback, setFeedback] = useState<"bad" | null>(null)

  function check() {
    const n = Number.parseInt(value.trim(), 10)
    if (Number.isNaN(n)) {
      setFeedback("bad")
      return
    }
    if (n === round.targetCount) {
      onWin?.({
        solutionText: `Había ${round.targetCount} ${round.target.noun} (${round.target.emoji}).`,
      })
    } else {
      setFeedback("bad")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm leading-relaxed">
        {round.target.question} Cuenta solo ese emoji e ignora el resto.
      </p>
      <div
        className="border-border bg-muted/30 relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-xl border"
        role="img"
        aria-label="Área con emojis para contar"
      >
        {round.placed.map((p) => (
          <span
            key={p.key}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 select-none text-2xl leading-none sm:text-3xl"
            style={{ left: p.style.left, top: p.style.top }}
            aria-hidden
          >
            {p.emoji}
          </span>
        ))}
      </div>
      <div className="space-y-2">
        <Label htmlFor="count-answer">Cantidad</Label>
        <Input
          id="count-answer"
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
          Cuenta otra vez con tranquilidad.
        </p>
      )}
    </div>
  )
}
