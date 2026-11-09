import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumericKeypad } from "@/components/numeric-keypad"
import type { GameProps } from "@/games/types"
import { useLang } from "@/lib/language"
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
const COPY = {
  es: {
    area: "Área con emojis para contar",
    amount: "Cantidad",
    placeholder: "Número",
    check: "Comprobar",
    wrong: "Cuenta otra vez con tranquilidad.",
    solution: (count: number, noun: string, emoji: string) =>
      `Había ${count} ${noun} (${emoji}).`,
  },
  en: {
    area: "Area with emojis to count",
    amount: "Amount",
    placeholder: "Number",
    check: "Check",
    wrong: "Count again, take your time.",
    solution: (count: number, noun: string, emoji: string) =>
      `There were ${count} ${noun} (${emoji}).`,
  },
}

const TARGET_TYPES = [
  { emoji: "🐱", noun: "gatos", question: "¿Cuántos gatos ves?", en: { noun: "cats", question: "How many cats do you see?" } },
  { emoji: "🐶", noun: "perros", question: "¿Cuántos perros ves?", en: { noun: "dogs", question: "How many dogs do you see?" } },
  { emoji: "⭐", noun: "estrellas", question: "¿Cuántas estrellas ves?", en: { noun: "stars", question: "How many stars do you see?" } },
  { emoji: "🌙", noun: "lunas", question: "¿Cuántas lunas ves?", en: { noun: "moons", question: "How many moons do you see?" } },
  { emoji: "🌸", noun: "flores", question: "¿Cuántas flores ves?", en: { noun: "flowers", question: "How many flowers do you see?" } },
  { emoji: "🍎", noun: "manzanas", question: "¿Cuántas manzanas ves?", en: { noun: "apples", question: "How many apples do you see?" } },
  { emoji: "🍕", noun: "porciones de pizza", question: "¿Cuántas pizzas ves?", en: { noun: "pizza slices", question: "How many pizza slices do you see?" } },
  { emoji: "🎈", noun: "globos", question: "¿Cuántos globos ves?", en: { noun: "balloons", question: "How many balloons do you see?" } },
  { emoji: "🎵", noun: "notas musicales", question: "¿Cuántas notas musicales ves?", en: { noun: "musical notes", question: "How many musical notes do you see?" } },
  { emoji: "⚽", noun: "balones", question: "¿Cuántos balones ves?", en: { noun: "balls", question: "How many balls do you see?" } },
  { emoji: "🦋", noun: "mariposas", question: "¿Cuántas mariposas ves?", en: { noun: "butterflies", question: "How many butterflies do you see?" } },
  { emoji: "🌈", noun: "arcoíris", question: "¿Cuántos arcoíris ves?", en: { noun: "rainbows", question: "How many rainbows do you see?" } },
  { emoji: "🍦", noun: "helados", question: "¿Cuántos helados ves?", en: { noun: "ice creams", question: "How many ice creams do you see?" } },
  { emoji: "🎁", noun: "regalos", question: "¿Cuántos regalos ves?", en: { noun: "presents", question: "How many presents do you see?" } },
  { emoji: "🚀", noun: "cohetes", question: "¿Cuántos cohetes ves?", en: { noun: "rockets", question: "How many rockets do you see?" } },
  { emoji: "🐸", noun: "ranas", question: "¿Cuántas ranas ves?", en: { noun: "frogs", question: "How many frogs do you see?" } },
  { emoji: "🍩", noun: "donuts", question: "¿Cuántos donuts ves?", en: { noun: "donuts", question: "How many donuts do you see?" } },
  { emoji: "💧", noun: "gotas", question: "¿Cuántas gotas ves?", en: { noun: "drops", question: "How many drops do you see?" } },
  { emoji: "🔔", noun: "campanas", question: "¿Cuántas campanas ves?", en: { noun: "bells", question: "How many bells do you see?" } },
  { emoji: "🌻", noun: "girasoles", question: "¿Cuántos girasoles ves?", en: { noun: "sunflowers", question: "How many sunflowers do you see?" } },
] as const

const POOL = TARGET_TYPES.map((t) => t.emoji)

/** 0–1 determinista a partir de semilla + índice (sin Math.random en render). */
function unitHash(seed: number, index: number, salt: number) {
  let h = (seed >>> 0) * 2654435761 + (index >>> 0) * 1597334677 + salt * 2246822519
  h >>>= 0
  return h / 0xffffffff
}

/** Reparto en cuadrícula barajada: un emoji por celda, jitter pequeño ( roce entre vecinos, no montones). */
const GRID_COLS = 16
const GRID_ROWS = 12
const GRID_SLOTS = GRID_COLS * GRID_ROWS

function layoutGridPositions(seed: number, count: number) {
  const slotOrder = shuffle(
    Array.from({ length: GRID_SLOTS }, (_, i) => i),
  ).slice(0, count)

  const padX = 4.5
  const padY = 4.5
  const cellW = (100 - 2 * padX) / GRID_COLS
  const cellH = (100 - 2 * padY) / GRID_ROWS
  const jitterScale = 0.36

  return slotOrder.map((slot, i) => {
    const c = slot % GRID_COLS
    const r = Math.floor(slot / GRID_COLS)
    const cx = padX + (c + 0.5) * cellW
    const cy = padY + (r + 0.5) * cellH
    const jitterX = (unitHash(seed, i, 11) - 0.5) * cellW * jitterScale
    const jitterY = (unitHash(seed, i, 17) - 0.5) * cellH * jitterScale
    const x = Math.min(97, Math.max(3, cx + jitterX))
    const y = Math.min(97, Math.max(3, cy + jitterY))
    return { left: `${x}%`, top: `${y}%` }
  })
}

type PlacedEmoji = {
  emoji: string
  key: string
  style: { left: string; top: string }
}

export function CountShapesGame({ onWin }: GameProps) {
  const { lang } = useLang()
  const c = COPY[lang]
  const round = useStableRandom(() => {
    const target =
      TARGET_TYPES[Math.floor(Math.random() * TARGET_TYPES.length)]!
    const distractorPool = POOL.filter((e) => e !== target.emoji)
    const targetCount = randomInt(5, 20)
    const decoyCount = Math.min(
      randomInt(
        Math.max(48, Math.floor(targetCount * 4)),
        Math.max(72, Math.floor(targetCount * 6)),
      ),
      GRID_SLOTS - targetCount,
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
    const positions = layoutGridPositions(seed, emojis.length)
    const placed: PlacedEmoji[] = emojis.map((emoji, i) => ({
      emoji,
      key: `e-${seed}-${i}-${emoji}`,
      style: positions[i]!,
    }))

    return {
      target,
      targetCount,
      placed,
    }
  })

  const [value, setValue] = useState("")
  const [feedback, setFeedback] = useState<"bad" | null>(null)

  function appendDigit(d: string) {
    setFeedback(null)
    setValue((v) => (v.length >= 4 ? v : v + d))
  }

  function backspace() {
    setFeedback(null)
    setValue((v) => v.slice(0, -1))
  }

  function check() {
    const n = Number.parseInt(value.trim(), 10)
    if (Number.isNaN(n)) {
      setFeedback("bad")
      return
    }
    if (n === round.targetCount) {
      onWin?.({
        solutionText: c.solution(
          round.targetCount,
          lang === "en" ? round.target.en.noun : round.target.noun,
          round.target.emoji,
        ),
      })
    } else {
      setFeedback("bad")
    }
  }

  return (
    <div className="flex flex-col gap-4 max-sm:gap-2">
      <p className="text-center text-base font-medium text-pretty sm:text-lg">
        {lang === "en" ? round.target.en.question : round.target.question}
      </p>
      <div
        className="border-border bg-muted/30 relative mx-auto aspect-[3/2] w-full max-w-md overflow-hidden rounded-xl border sm:aspect-[4/3]"
        role="img"
        aria-label={c.area}
      >
        {round.placed.map((p) => (
          <span
            key={p.key}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 select-none text-lg leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:text-3xl dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.75)]"
            style={{ left: p.style.left, top: p.style.top }}
            aria-hidden
          >
            {p.emoji}
          </span>
        ))}
      </div>
      <div className="space-y-2">
        <Label htmlFor="count-answer">{c.amount}</Label>
        <Input
          id="count-answer"
          inputMode="none"
          autoComplete="off"
          placeholder={c.placeholder}
          value={value}
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
        <NumericKeypad onDigit={appendDigit} onBackspace={backspace} />
      </div>
      <Button type="button" className="min-h-10 w-full text-sm sm:min-h-11 sm:text-base" onClick={check}>
        {c.check}
      </Button>
      <p
        className={`text-center text-sm text-destructive ${feedback === "bad" ? "" : "invisible"}`}
      >
        {c.wrong}
      </p>
    </div>
  )
}
