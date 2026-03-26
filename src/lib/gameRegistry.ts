import type { ComponentType } from "react"
import { AnagramGame } from "@/games/AnagramGame"
import { CategoryNamesGame } from "@/games/CategoryNamesGame"
import { CountShapesGame } from "@/games/CountShapesGame"
import { FollowDotGame } from "@/games/FollowDotGame"
import { GroundingGame } from "@/games/GroundingGame"
import { MathQuickGame } from "@/games/MathQuickGame"
import { MemoryPairsGame } from "@/games/MemoryPairsGame"
import { OrderTapGame } from "@/games/OrderTapGame"
import { SequenceGame } from "@/games/SequenceGame"
import { Sudoku4Game } from "@/games/Sudoku4Game"
import type { GameProps } from "@/games/types"

export type GameId =
  | "sudoku4"
  | "math"
  | "sequence"
  | "count"
  | "grounding"
  | "anagram"
  | "memory"
  | "orderTap"
  | "categoryNames"
  | "followDot"

export type GameDefinition = {
  id: GameId
  title: string
  description: string
  component: ComponentType<GameProps>
}

export const GAMES: GameDefinition[] = [
  {
    id: "sequence",
    title: "Siguiente número",
    description:
      "Series con distintas reglas: saltos fijos, alternos, cuadráticas…",
    component: SequenceGame,
  },
  {
    id: "math",
    title: "Cuenta rápida",
    description: "Operaciones sencillas para enfocarte.",
    component: MathQuickGame,
  },
  {
    id: "count",
    title: "Contar emojis",
    description: "Cada partida te pide un emoji distinto; hay entre 5 y 20.",
    component: CountShapesGame,
  },
  {
    id: "anagram",
    title: "Anagrama",
    description: "Ordena las letras para formar la palabra.",
    component: AnagramGame,
  },
  {
    id: "grounding",
    title: "Grounding 5-4-3-2-1",
    description: "Ancoraje guiado: volver al cuerpo y al entorno.",
    component: GroundingGame,
  },
  {
    id: "sudoku4",
    title: "Sudoku 4×4",
    description: "Rellena la cuadrícula (bloques 2×2).",
    component: Sudoku4Game,
  },
  {
    id: "memory",
    title: "Parejas de emojis",
    description: "16 cartas, 8 parejas. Memoriza y empareja.",
    component: MemoryPairsGame,
  },
  {
    id: "orderTap",
    title: "1 al 16 en orden",
    description:
      "Toca del 1 al 16; un fallo reinicia la ronda (misma disposición).",
    component: OrderTapGame,
  },
  {
    id: "categoryNames",
    title: "3 por categoría",
    description:
      "Frutas, colores, animales… Escribe tres cosas según el enunciado.",
    component: CategoryNamesGame,
  },
  {
    id: "followDot",
    title: "Seguir el punto",
    description:
      "Mueve el punto verde con el dedo siguiendo el azul sin acercarte al borde.",
    component: FollowDotGame,
  },
]

function randomInt(max: number) {
  return Math.floor(Math.random() * max)
}

export function pickRandomGame(excludeId?: GameId): GameDefinition {
  const pool =
    excludeId === undefined
      ? GAMES
      : GAMES.filter((g) => g.id !== excludeId)
  if (pool.length === 0) {
    return GAMES[randomInt(GAMES.length)]!
  }
  return pool[randomInt(pool.length)]!
}

export function getGameById(id: GameId): GameDefinition {
  return GAMES.find((g) => g.id === id) ?? GAMES[0]!
}
