import { ArrowRight } from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
} from "react"
import { Button } from "@/components/ui/button"
import { TextKeypad } from "@/components/text-keypad"
import type { GameProps } from "@/games/types"
import { useStableRandom } from "@/hooks/use-stable-random"
import { useLang } from "@/lib/language"
import { useStats } from "@/lib/stats"

const MAX_LENGTH = 240
/** Líneas visibles del campo antes de que aparezca el scroll. */
const MAX_LINES = 4

const COPY = {
  es: {
    start: "Escribe algo que te ronde la cabeza. No se guarda.",
    letGo: "Déjalo ir…",
    another: "Puedes soltar otro.",
    placeholder: "Lo que me preocupa…",
    aria: "Pensamiento que quieres soltar",
    release: "Soltar",
    total: (n: number) =>
      `En total has soltado ${n} ${n === 1 ? "pensamiento" : "pensamientos"}`,
  },
  en: {
    start: "Write something that's on your mind. Nothing is saved.",
    letGo: "Let it go…",
    another: "You can release another.",
    placeholder: "What's worrying me…",
    aria: "Thought you want to release",
    release: "Release",
    total: (n: number) =>
      `You've released ${n} ${n === 1 ? "thought" : "thoughts"} in total`,
  },
}

const BURST_COLORS = ["bg-primary", "bg-chart-3", "bg-chart-2", "bg-chart-1"]

const rand = (min: number, max: number) => min + Math.random() * (max - min)

/** Datos aleatorios de un «pop»: rayos, chispas que caen y brillos. */
function makeBurst() {
  const rays = Array.from({ length: 14 }, (_, i) => ({
    color: BURST_COLORS[i % BURST_COLORS.length]!,
    long: i % 2 === 0,
    style: {
      "--a": `${(i * 360) / 14 + rand(-7, 7)}deg`,
      "--r": `${rand(3.6, 5.2)}rem`,
    } as CSSProperties,
  }))
  const sparks = Array.from({ length: 20 }, (_, i) => {
    const angle = rand(0, Math.PI * 2)
    const dist = rand(2.2, 5)
    return {
      color: BURST_COLORS[i % BURST_COLORS.length]!,
      big: i % 3 === 0,
      style: {
        "--dx": `${(Math.cos(angle) * dist).toFixed(2)}rem`,
        "--dy": `${(Math.sin(angle) * dist).toFixed(2)}rem`,
        animationDelay: `${rand(0, 0.14).toFixed(2)}s`,
      } as CSSProperties,
    }
  })
  const twinkles = Array.from({ length: 9 }, (_, i) => {
    const angle = rand(0, Math.PI * 2)
    const dist = rand(1.8, 4.4)
    return {
      color: BURST_COLORS[i % BURST_COLORS.length]!,
      style: {
        "--dx": `${(Math.cos(angle) * dist).toFixed(2)}rem`,
        "--dy": `${(Math.sin(angle) * dist).toFixed(2)}rem`,
        animationDelay: `${rand(0.3, 0.6).toFixed(2)}s`,
      } as CSSProperties,
    }
  })
  return { rays, sparks, twinkles }
}

function Burst({ onEnd }: { onEnd: (e: AnimationEvent) => void }) {
  const { rays, sparks, twinkles } = useStableRandom(makeBurst)

  return (
    <div className="relative flex h-14 items-center justify-center" aria-hidden>
      <span className="animate-pop-flash bg-primary/30 absolute size-16 rounded-full blur-md" />
      <span className="animate-pop-ring border-primary/60 absolute size-10 rounded-full border-2" />
      <span className="animate-pop-ring-late border-chart-3/50 absolute size-10 rounded-full border" />
      {rays.map((r, i) => (
        <span
          key={`r${i}`}
          style={r.style}
          className={`animate-pop-ray ${r.color} absolute w-0.5 rounded-full ${r.long ? "h-4" : "h-2.5"}`}
        />
      ))}
      {sparks.map((p, i) => (
        <span
          key={`s${i}`}
          style={p.style}
          className={`animate-pop-spark ${p.color} absolute rounded-full ${p.big ? "size-2" : "size-1.5"}`}
        />
      ))}
      {twinkles.map((t, i) => (
        <span
          key={`t${i}`}
          style={t.style}
          className={`animate-pop-twinkle ${t.color} absolute size-1 rotate-45`}
        />
      ))}
      <span onAnimationEnd={onEnd} className="animate-pop-end absolute" />
    </div>
  )
}

export function ReleaseThoughtsGame({ onComplete, onStatusChange }: GameProps) {
  const { lang } = useLang()
  const c = COPY[lang]
  const [text, setText] = useState("")
  const [floating, setFloating] = useState<{ id: number; text: string } | null>(
    null,
  )
  const [popping, setPopping] = useState(false)
  const [released, setReleased] = useState(0)

  // Cada pensamiento soltado cuenta como una partida de este juego en las estadísticas.
  const totalReleased = useStats().letGo?.plays ?? 0
  const busy = floating !== null
  // El total se muestra fuera de la caja, encima (lo pinta la página).
  const totalText = totalReleased > 0 ? c.total(totalReleased) : null
  useEffect(() => {
    onStatusChange?.(totalText)
  }, [totalText, onStatusChange])
  const fieldRef = useRef<HTMLTextAreaElement>(null)

  // El campo crece con el texto hasta MAX_LINES líneas; a partir de ahí, scroll.
  useEffect(() => {
    const el = fieldRef.current
    if (!el) return
    el.style.height = "auto"
    const cs = getComputedStyle(el)
    const line = parseFloat(cs.lineHeight) || 20
    const padding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
    const border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth)
    // scrollHeight ya incluye el relleno, pero no el borde.
    const wanted = el.scrollHeight + border
    const max = line * MAX_LINES + padding + border
    el.style.height = `${Math.min(wanted, max)}px`
  }, [text])
  const canRelease = text.trim() !== "" && !busy

  function release() {
    if (!canRelease) return
    setFloating({ id: released, text: text.trim() })
    setPopping(false)
    setReleased((n) => n + 1)
    onComplete?.()
    setText("")
  }

  // Al llegar arriba, el pensamiento hace «pop»; al acabar el pop se limpia.
  function onFloatEnd(e: AnimationEvent) {
    if (e.animationName === "float-up") setPopping(true)
  }

  function onPopEnd(e: AnimationEvent) {
    if (e.animationName !== "pop-end") return
    setFloating(null)
    setPopping(false)
  }

  let status = c.start
  if (busy) status = c.letGo
  else if (released > 0)
    status = c.another

  return (
    <div className="flex flex-col gap-4 max-sm:gap-3">
      <p className="text-muted-foreground min-h-10 text-center text-sm sm:min-h-5" aria-live="polite">
        {status}
      </p>

      <div
        className="relative mx-auto h-64 w-full max-w-sm overflow-hidden sm:h-72 sm:max-w-md"
        aria-hidden
      >
        {floating ? (
          <div
            key={floating.id}
            onAnimationEnd={onFloatEnd}
            className="animate-float-up absolute inset-x-6"
          >
            {!popping ? (
              <div className="animate-sway">
                <div className="animate-fade-soft border-border bg-card text-card-foreground rounded-2xl border px-4 py-3 text-center text-sm shadow-sm">
                  {floating.text}
                </div>
              </div>
            ) : (
              <Burst onEnd={onPopEnd} />
            )}
          </div>
        ) : null}
      </div>

      <div className="flex items-end gap-2">
        <textarea
          ref={fieldRef}
          rows={1}
          value={text}
          maxLength={MAX_LENGTH}
          inputMode="none"
          autoComplete="off"
          placeholder={c.placeholder}
          aria-label={c.aria}
          disabled={busy}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // Enter envía; Mayús+Enter no hace nada especial (no hay saltos de línea).
            if (e.key === "Enter") {
              e.preventDefault()
              release()
            }
          }}
          className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 min-h-10 w-full min-w-0 resize-none overflow-y-auto rounded-lg border bg-transparent px-2.5 py-2 text-[16px] leading-5 outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11 md:text-sm"
        />
        <Button
          type="button"
          size="icon"
          className="size-10 shrink-0 sm:size-11"
          disabled={!canRelease}
          onClick={release}
          aria-label={c.release}
          title={c.release}
        >
          <ArrowRight className="size-5" aria-hidden />
        </Button>
      </div>

      <TextKeypad
        value={text}
        onChange={setText}
        maxLength={MAX_LENGTH}
        disabled={busy}
      />
    </div>
  )
}
