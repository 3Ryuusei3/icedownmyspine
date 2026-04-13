import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { GameProps } from "@/games/types"

/** Margen interior (0–1): fuera de aquí cuenta como tocar el borde. */
const MARGIN = 0.1
/** Distancia normalizada para considerar que sigues al objetivo. */
const CATCH = 0.13
const WIN_MS = 5000

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

export function FollowDotGame({ onWin }: GameProps) {
  const areaRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef({
    x: 0.45,
    y: 0.55,
    vx: 0.22,
    vy: 0.17,
  })
  const playerRef = useRef({ x: 0.5, y: 0.5 })
  const overlapMsRef = useRef(0)
  const wonRef = useRef(false)
  const rafRef = useRef(0)

  const [player, setPlayer] = useState({ x: 0.5, y: 0.5 })
  const [target, setTarget] = useState({ x: 0.45, y: 0.55 })
  const [progress, setProgress] = useState(0)
  const [borderFlash, setBorderFlash] = useState(false)

  const onWinRef = useRef(onWin)
  useEffect(() => {
    onWinRef.current = onWin
  }, [onWin])

  const touchToNorm = useCallback((clientX: number, clientY: number) => {
    const el = areaRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const nx = clamp((clientX - rect.left) / rect.width, 0, 1)
    const ny = clamp((clientY - rect.top) / rect.height, 0, 1)
    playerRef.current = { x: nx, y: ny }
    setPlayer({ x: nx, y: ny })
  }, [])

  useEffect(() => {
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.12)
      last = now

      const t = targetRef.current
      t.x += t.vx * dt
      t.y += t.vy * dt
      const lo = MARGIN
      const hi = 1 - MARGIN
      if (t.x < lo) {
        t.x = lo
        t.vx *= -1
      } else if (t.x > hi) {
        t.x = hi
        t.vx *= -1
      }
      if (t.y < lo) {
        t.y = lo
        t.vy *= -1
      } else if (t.y > hi) {
        t.y = hi
        t.vy *= -1
      }

      const p = playerRef.current
      const inSafe =
        p.x >= MARGIN && p.x <= 1 - MARGIN && p.y >= MARGIN && p.y <= 1 - MARGIN
      const dist = Math.hypot(p.x - t.x, p.y - t.y)

      if (!inSafe) {
        overlapMsRef.current = 0
        setProgress(0)
        setBorderFlash(true)
        window.setTimeout(() => setBorderFlash(false), 280)
      } else if (dist < CATCH) {
        overlapMsRef.current += dt * 1000
        if (overlapMsRef.current >= WIN_MS && !wonRef.current) {
          wonRef.current = true
          cancelAnimationFrame(rafRef.current)
          onWinRef.current?.({
            solutionText:
              "Has seguido el punto azul unos segundos sin salirte del área segura.",
          })
          return
        }
      } else {
        overlapMsRef.current = 0
      }

      setTarget({ x: t.x, y: t.y })
      setProgress(Math.min(100, (overlapMsRef.current / WIN_MS) * 100))
      if (!wonRef.current) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm leading-relaxed">
        El <strong className="text-foreground">punto azul</strong> se mueve.
        Con el dedo mueve el <strong className="text-foreground">punto verde</strong>{" "}
        para mantenerte cerca del azul. Si te acercas demasiado al borde rojo,
        se reinicia la barra de progreso.
      </p>
      <div
        className="bg-muted/20 relative mx-auto h-56 w-full max-w-sm touch-none select-none overflow-hidden rounded-xl border-2 border-red-500/50 sm:h-64"
        ref={areaRef}
        role="application"
        aria-label="Zona: sigue el punto azul con el verde"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => {
          if (!e.isPrimary) return
          if (e.pointerType === "mouse" && e.button !== 0) return
          e.preventDefault()
          e.currentTarget.setPointerCapture(e.pointerId)
          touchToNorm(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
          e.preventDefault()
          touchToNorm(e.clientX, e.clientY)
        }}
        onPointerUp={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId)
          }
        }}
        onPointerCancel={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId)
          }
        }}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-3 rounded-lg border-2 border-dashed border-red-400/60",
            borderFlash && "animate-pulse border-red-600",
          )}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500 shadow-md ring-2 ring-white/80"
          style={{
            left: `${target.x * 100}%`,
            top: `${target.y * 100}%`,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 shadow-md ring-2 ring-white/90"
          style={{
            left: `${player.x * 100}%`,
            top: `${player.y * 100}%`,
          }}
          aria-hidden
        />
      </div>
      <div className="space-y-1">
        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            className="h-full bg-emerald-500 transition-[width] duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-muted-foreground text-center text-xs">
          Progreso al mantenerte cerca del azul (sin tocar el borde)
        </p>
      </div>
    </div>
  )
}
