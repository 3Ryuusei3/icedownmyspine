import { useState, type AnimationEvent, type CSSProperties } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { GameProps } from "@/games/types"
import { useLang } from "@/lib/language"

const MAX_LENGTH = 100

const COPY = {
  es: {
    start: "Escribe algo que te ronde la cabeza. No se guarda.",
    letGo: "Déjalo ir…",
    released: (n: number) =>
      `Has soltado ${n} ${n === 1 ? "pensamiento" : "pensamientos"}. Puedes soltar otro.`,
    placeholder: "Lo que me preocupa…",
    aria: "Pensamiento que quieres soltar",
    release: "Soltar",
  },
  en: {
    start: "Write something that's on your mind. Nothing is saved.",
    letGo: "Let it go…",
    released: (n: number) =>
      `You've released ${n} ${n === 1 ? "thought" : "thoughts"}. You can release another.`,
    placeholder: "What's worrying me…",
    aria: "Thought you want to release",
    release: "Release",
  },
}

/** Rayitos del «pop»: diez destellos que salen en abanico desde el centro. */
const POP_RAYS = Array.from({ length: 10 }, (_, i) => ({
  "--a": `${i * 36 + 18}deg`,
}) as CSSProperties)

export function ReleaseThoughtsGame({ onComplete }: GameProps) {
  const { lang } = useLang()
  const c = COPY[lang]
  const [text, setText] = useState("")
  const [floating, setFloating] = useState<{ id: number; text: string } | null>(
    null,
  )
  const [popping, setPopping] = useState(false)
  const [released, setReleased] = useState(0)

  const busy = floating !== null
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
    if (e.animationName !== "pop-ring") return
    setFloating(null)
    setPopping(false)
  }

  let status = c.start
  if (busy) status = c.letGo
  else if (released > 0)
    status = c.released(released)

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
              <div className="relative flex h-14 items-center justify-center">
                <span className="animate-pop-glow bg-primary/25 absolute size-16 rounded-full blur-md" />
                <span className="animate-pop-ring border-primary/60 absolute size-10 rounded-full border-2" />
                <span
                  onAnimationEnd={onPopEnd}
                  className="animate-pop-ring-late border-primary/40 absolute size-10 rounded-full border"
                />
                {POP_RAYS.map((style, i) => (
                  <span
                    key={i}
                    style={style}
                    className="animate-pop-ray bg-primary/70 absolute h-3 w-0.5 rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <Input
        value={text}
        maxLength={MAX_LENGTH}
        autoComplete="off"
        placeholder={c.placeholder}
        aria-label={c.aria}
        className="h-10 sm:h-11"
        disabled={busy}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") release()
        }}
      />

      <Button
        type="button"
        className="min-h-10 w-full sm:min-h-11"
        disabled={!canRelease}
        onClick={release}
      >
        {c.release}
      </Button>
    </div>
  )
}
