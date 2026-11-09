import { useState, type AnimationEvent, type CSSProperties } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const MAX_LENGTH = 100

/** Rayitos del «pop»: diez destellos que salen en abanico desde el centro. */
const POP_RAYS = Array.from({ length: 10 }, (_, i) => ({
  "--a": `${i * 36 + 18}deg`,
}) as CSSProperties)

export function ReleaseThoughtsGame() {
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

  let status = "Escribe algo que te ronde la cabeza. No se guarda."
  if (busy) status = "Déjalo ir…"
  else if (released > 0)
    status = `Has soltado ${released} ${released === 1 ? "pensamiento" : "pensamientos"}. Puedes soltar otro.`

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
        placeholder="Lo que me preocupa…"
        aria-label="Pensamiento que quieres soltar"
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
        Soltar
      </Button>
    </div>
  )
}
