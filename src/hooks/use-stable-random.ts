/* eslint-disable react-hooks/refs -- init estable para valores aleatorios con Strict Mode */
import { useRef } from "react"

/** Evita dos puzzles distintos si el inicializador de estado se invoca dos veces (Strict Mode). */
export function useStableRandom<T>(factory: () => T): T {
  const ref = useRef<T | null>(null)
  if (ref.current === null) {
    ref.current = factory()
  }
  return ref.current
}
