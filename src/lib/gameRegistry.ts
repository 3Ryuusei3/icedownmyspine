import type { ComponentType } from "react";
import { MiniWosGame } from "@/games/MiniWosGame";
import { CategoryNamesGame } from "@/games/CategoryNamesGame";
import { CountShapesGame } from "@/games/CountShapesGame";
import { CompareNumbersGame } from "@/games/CompareNumbersGame";
import { GroundingGame } from "@/games/GroundingGame";
import { MathQuickGame } from "@/games/MathQuickGame";
import { MemoryPairsGame } from "@/games/MemoryPairsGame";
import { OrderTapGame } from "@/games/OrderTapGame";
import { SequenceGame } from "@/games/SequenceGame";
import { Sudoku9Game } from "@/games/Sudoku9Game";
import { BreathingGame } from "@/games/BreathingGame";
import { ReleaseThoughtsGame } from "@/games/ReleaseThoughtsGame";
import { SimonGame } from "@/games/SimonGame";
import { MemoryGridGame } from "@/games/MemoryGridGame";
import type { GameProps } from "@/games/types";

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
  | "simon"
  | "memoryGrid"
  | "breathing"
  | "letGo";

export type GameCategory = "game" | "relax";

export const CATEGORY_LABELS: Record<GameCategory, string> = {
  game: "Juegos",
  relax: "Relajación",
};

export type GameDefinition = {
  id: GameId;
  category: GameCategory;
  title: string;
  description: string;
  component: ComponentType<GameProps>;
};

export const GAMES: GameDefinition[] = [
  {
    id: "sequence",
    category: "game",
    title: "Siguiente número",
    description:
      "Completa la serie: averigua qué número falta al final. El patrón puede ser un salto fijo, saltos que alternan, cuadrados, productos u otras reglas.",
    component: SequenceGame,
  },
  {
    id: "math",
    category: "game",
    title: "Cuenta rápida",
    description: "Resuelve multiplicaciones y divisiones con resultado entero.",
    component: MathQuickGame,
  },
  {
    id: "count",
    category: "game",
    title: "Contar emojis",
    description:
      "Verás muchos emojis repartidos por la pantalla, cuenta cuántas veces aparece el emoji seleccionado y ignora el resto.",
    component: CountShapesGame,
  },
  {
    id: "anagram",
    category: "game",
    title: "Mini-wos",
    description:
      "Con las letras de la ronda forma todas las palabras válidas de al menos cuatro letras. Las letras de arriba se barajan cada 10 segundos.",
    component: MiniWosGame,
  },
  {
    id: "grounding",
    category: "relax",
    title: "Grounding 5-4-3-2-1",
    description:
      "Ejercicio de anclaje para volver al cuerpo y al entorno: recorre los pasos 5-4-3-2-1. En cada uno escribe lo que ves, oyes, notas al tacto, hueles o saboreas (o piénsalo en silencio).",
    component: GroundingGame,
  },
  {
    id: "sudoku9",
    category: "game",
    title: "Sudoku 9x9",
    description:
      "Rellena las celdas vacías para que cada fila, columna y bloque de 3x3 tenga los números del 1 al 9 sin repetir. Las celdas con número fijo no se pueden cambiar.",
    component: Sudoku9Game,
  },
  {
    id: "memory",
    category: "game",
    title: "Parejas de emojis",
    description:
      "Encuentra todas las parejas, toca dos cartas para voltearlas; si coinciden se quedan descubiertas.",
    component: MemoryPairsGame,
  },
  {
    id: "orderTap",
    category: "game",
    title: "Ordena los números",
    description:
      "Pulsa los números en orden. Si pulsas un número que no toca, la ronda se reinicia desde el principio.",
    component: OrderTapGame,
  },
  {
    id: "categoryNames",
    category: "relax",
    title: "3 por categoría",
    description: "Nombra tres cosas que encajen con la categoría seleccionada.",
    component: CategoryNamesGame,
  },
  {
    id: "compareNumbers",
    category: "game",
    title: "¿Cuál es mayor?",
    description: "Elige la opción cuyo resultado sea el mayor.",
    component: CompareNumbersGame,
  },
  {
    id: "simon",
    category: "game",
    title: "Simón",
    description:
      "Mira la secuencia de colores y repítela en el mismo orden. Son 3 niveles con 4 colores: la secuencia a recordar tiene 4, 5 y 6 pasos. Si fallas, puedes reintentar el nivel o reiniciar la partida.",
    component: SimonGame,
  },
  {
    id: "memoryGrid",
    category: "game",
    title: "Cuadriculado",
    description:
      "Se iluminan entre 5 y 15 casillas de una cuadrícula de 5x5. Memorízalas y márcalas cuando se apaguen.",
    component: MemoryGridGame,
  },
  {
    id: "breathing",
    category: "relax",
    title: "Respiración guiada",
    description:
      "Sigue el círculo: inhala mientras se hincha, mantén el aire y exhala mientras se encoge. Antes de empezar puedes ajustar los segundos, si quieres pausa y el número de respiraciones. Puedes pausarlo cuando lo necesites.",
    component: BreathingGame,
  },
  {
    id: "letGo",
    category: "relax",
    title: "Soltar pensamientos",
    description:
      "Escribe algo que te ronde la cabeza y pulsa «Soltar»: se irá flotando hasta desvanecerse. No se guarda nada. Suelta los que quieras.",
    component: ReleaseThoughtsGame,
  },
];

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

/**
 * Elige un juego al azar entre los de la rotación (`allowedIds`; todos si se
 * omite), evitando repetir `excludeId` siempre que haya otra opción.
 */
export function pickRandomGame(
  excludeId?: GameId,
  allowedIds?: readonly GameId[],
): GameDefinition {
  const rotation = allowedIds
    ? GAMES.filter((g) => allowedIds.includes(g.id))
    : GAMES;
  const base = rotation.length > 0 ? rotation : GAMES;
  const pool =
    excludeId === undefined ? base : base.filter((g) => g.id !== excludeId);
  if (pool.length === 0) {
    return base[randomInt(base.length)]!;
  }
  return pool[randomInt(pool.length)]!;
}

export function getGameById(id: GameId): GameDefinition {
  return GAMES.find((g) => g.id === id) ?? GAMES[0]!;
}
