import type { ComponentType } from "react"
import { MiniWosGame } from "@/games/MiniWosGame"
import { CategoryNamesGame } from "@/games/CategoryNamesGame"
import { CountShapesGame } from "@/games/CountShapesGame"
import { CompareNumbersGame } from "@/games/CompareNumbersGame"
import { GroundingGame } from "@/games/GroundingGame"
import { MathQuickGame } from "@/games/MathQuickGame"
import { MemoryPairsGame } from "@/games/MemoryPairsGame"
import { OrderTapGame } from "@/games/OrderTapGame"
import { SequenceGame } from "@/games/SequenceGame"
import { Sudoku9Game } from "@/games/Sudoku9Game"
import type { GameProps } from "@/games/types"

export type GameId =
  | "sudoku9"
  | "math"
  | "sequence"
  | "count"
  | "grounding"
  | "anagram"
  | "memory"
  | "orderTap"
  | "categoryNames"
  | "compareNumbers"

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
    description:
      "Multiplicaciones y divisiones enteras (divisor 3, 4 o 5; dividendo ≥ 90). Filtro: todo, solo × o solo ÷.",
    component: MathQuickGame,
  },
  {
    id: "count",
    title: "Contar emojis",
    description:
      "Cuenta un emoji entre muchos otros (5–20 objetivos); repartidos para poder distinguirlos.",
    component: CountShapesGame,
  },
  {
    id: "anagram",
    title: "Mini-wos",
    description:
      "Forma todas las palabras posibles con las letras; rejilla por longitud y orden alfabético.",
    component: MiniWosGame,
  },
  {
    id: "grounding",
    title: "Grounding 5-4-3-2-1",
    description: "Ancoraje guiado: volver al cuerpo y al entorno.",
    component: GroundingGame,
  },
  {
    id: "sudoku9",
    title: "Sudoku 9×9",
    description: "Rellena la cuadrícula (bloques 3×3); puzles con muchas pistas.",
    component: Sudoku9Game,
  },
  {
    id: "memory",
    title: "Parejas de emojis",
    description: "16 cartas, 8 parejas. Memoriza y empareja.",
    component: MemoryPairsGame,
  },
  {
    id: "orderTap",
    title: "Ordena los números",
    description:
      "Toca 25 números consecutivos en orden (p. ej. del 21 al 45); un fallo reinicia desde el primero.",
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
    id: "compareNumbers",
    title: "¿Cuál es mayor?",
    description:
      "Tres operaciones A, B y C: dos resultados parecidos y uno claramente menor; elige la mayor.",
    component: CompareNumbersGame,
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
