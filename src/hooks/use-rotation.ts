import { useCallback, useState } from "react"
import { GAMES, type GameId } from "@/lib/gameRegistry"

/** Guardamos los juegos desactivados: así los juegos nuevos entran solos. */
const STORAGE_KEY = "ice-rotation-off"

const ALL_IDS: GameId[] = GAMES.map((g) => g.id)

function load(): GameId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const valid = ALL_IDS.filter((id) => !parsed.includes(id))
        if (valid.length > 0) return valid
      }
    }
  } catch {
    // sin almacenamiento o datos corruptos: rotación completa
  }
  return ALL_IDS
}

/** Juegos que entran en la rotación aleatoria (se guarda en el navegador). */
export function useRotation() {
  const [enabled, setEnabledState] = useState<GameId[]>(load)

  const setEnabled = useCallback((ids: GameId[]) => {
    const next = ALL_IDS.filter((id) => ids.includes(id))
    if (next.length === 0) return
    setEnabledState(next)
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(ALL_IDS.filter((id) => !next.includes(id))),
      )
    } catch {
      // se aplica igualmente en esta sesión
    }
  }, [])

  return { enabled, setEnabled }
}
