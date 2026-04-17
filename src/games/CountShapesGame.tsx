import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumericKeypad } from "@/components/numeric-keypad"
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
  const [padOpen, setPadOpen] = useState(false)
  const answerBlockRef = useRef<HTMLDivElement>(null)

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
        solutionText: `Había ${round.targetCount} ${round.target.noun} (${round.target.emoji}).`,
      })
    } else {
      setFeedback("bad")
    }
  }

  return (
    <div className="flex flex-col gap-4 max-sm:gap-2">
      <p className="text-muted-foreground max-sm:text-xs max-sm:leading-snug text-sm leading-relaxed">
        {round.target.question} Cuenta solo ese emoji e ignora el resto.
      </p>
      <div
        className="border-border bg-muted/30 relative mx-auto aspect-[3/2] w-full max-w-md overflow-hidden rounded-xl border sm:aspect-[4/3]"
        role="img"
        aria-label="Área con emojis para contar"
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
      <div ref={answerBlockRef} className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="count-answer">Cantidad</Label>
          <Input
            id="count-answer"
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
          Cuenta otra vez con tranquilidad.
        </p>
      )}
    </div>
  )
}
