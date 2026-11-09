import { useSyncExternalStore } from "react"
import type { GameId } from "@/lib/gameRegistry"

/**
 * Estadísticas personales: se guardan solo en este dispositivo (localStorage),
 * no se envían a ningún sitio ni se pueden exportar.
 */
const STORAGE_KEY = "ice-stats"

export type GameStat = {
  /** Veces que se ha completado. */
  plays: number
  /** Mejor tiempo en ms (solo juegos con tiempo). */
  bestMs?: number
}

export type Stats = Partial<Record<GameId, GameStat>>

const listeners = new Set<() => void>()
let cache: Stats | null = null

function read(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Stats
      }
    }
  } catch {
    // sin almacenamiento o datos corruptos: se empieza de cero
  }
  return {}
}

function getSnapshot(): Stats {
  cache ??= read()
  return cache
}

function write(next: Stats) {
  cache = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // se mantiene en memoria durante esta sesión
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Suma una partida completada y, si hay tiempo, actualiza el mejor. */
export function recordPlay(id: GameId, durationMs?: number) {
  const current = getSnapshot()
  const prev = current[id] ?? { plays: 0 }
  const next: GameStat = { plays: prev.plays + 1 }
  const best =
    durationMs === undefined
      ? prev.bestMs
      : prev.bestMs === undefined
        ? durationMs
        : Math.min(prev.bestMs, durationMs)
  if (best !== undefined) next.bestMs = best
  write({ ...current, [id]: next })
}

export function resetStats() {
  write({})
}

export function useStats(): Stats {
  return useSyncExternalStore(subscribe, getSnapshot, () => ({}))
}

/** 83000 → «1:23». */
export function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, "0")}`
}
