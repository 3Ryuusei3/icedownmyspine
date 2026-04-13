import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { GameProps } from "@/games/types"
import { useStableRandom } from "@/hooks/use-stable-random"
import { shuffle } from "@/lib/shuffle"

const EMOJI_POOL = [
  "🐱",
  "🐶",
  "🦊",
  "🐸",
  "🐼",
  "🐨",
  "🦁",
  "🐙",
  "🦋",
  "🌸",
  "🌙",
  "⭐",
  "🍎",
  "🍕",
  "🍦",
  "🎈",
  "🎁",
  "🚀",
  "⚽",
  "🎵",
  "💧",
  "🔔",
  "🌈",
  "🌻",
]

type Card = { emoji: string; key: string }

function buildDeck(): Card[] {
  const eight = shuffle([...EMOJI_POOL]).slice(0, 8)
  const pairs: Card[] = []
  eight.forEach((emoji, pi) => {
    pairs.push({ emoji, key: `${pi}-a` }, { emoji, key: `${pi}-b` })
  })
  return shuffle(pairs)
}

export function MemoryPairsGame({ onWin }: GameProps) {
  const deck = useStableRandom(() => buildDeck())

  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(() => new Set())
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearFlipTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => () => clearFlipTimeout(), [clearFlipTimeout])

  function tryWin(nextMatched: Set<number>) {
    if (nextMatched.size === 16) {
      clearFlipTimeout()
      onWin?.({
        solutionText: "Encontraste las 8 parejas. ¡Buena memoria!",
      })
    }
  }

  function onCardClick(index: number) {
    if (matched.has(index)) return
    if (flipped.includes(index)) return
    if (flipped.length >= 2) return

    clearFlipTimeout()

    if (flipped.length === 0) {
      setFlipped([index])
      return
    }

    const first = flipped[0]!
    const second = index
    const a = deck[first]!.emoji
    const b = deck[second]!.emoji

    if (a === b) {
      const next = new Set(matched)
      next.add(first)
      next.add(second)
      setMatched(next)
      setFlipped([])
      tryWin(next)
    } else {
      setFlipped([first, second])
      timeoutRef.current = setTimeout(() => {
        setFlipped([])
        timeoutRef.current = null
      }, 650)
    }
  }

  return (
    <div className="flex flex-col gap-4 max-sm:gap-2">
      <p className="text-muted-foreground max-sm:text-xs max-sm:leading-snug text-sm leading-relaxed">
        Hay 8 parejas de emojis. Toca dos cartas para voltearlas; si coinciden
        se quedan descubiertas.
      </p>
      <div
        className="mx-auto grid w-full max-w-sm grid-cols-4 gap-1.5 sm:max-w-md sm:gap-3"
        role="grid"
        aria-label="Cartas de memoria"
      >
        {deck.map((card, i) => {
          const isUp = flipped.includes(i) || matched.has(i)
          return (
            <button
              key={card.key}
              type="button"
              role="gridcell"
              aria-label={
                matched.has(i)
                  ? `Pareja encontrada: ${card.emoji}`
                  : isUp
                    ? card.emoji
                    : "Carta boca abajo"
              }
              disabled={matched.has(i)}
              onClick={() => onCardClick(i)}
              className={cn(
                "flex aspect-square min-h-[2.75rem] items-center justify-center rounded-xl border-2 text-xl transition-all duration-150 sm:min-h-16 sm:text-3xl",
                matched.has(i)
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-border bg-card hover:bg-muted/60 active:scale-[0.98]",
                !isUp && "bg-muted/80",
              )}
            >
              {isUp ? (
                <span aria-hidden>{card.emoji}</span>
              ) : (
                <span className="text-muted-foreground text-lg font-medium sm:text-xl">
                  ?
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
