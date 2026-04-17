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
  | "compareNumbers";

export type GameDefinition = {
  id: GameId;
  title: string;
  description: string;
  component: ComponentType<GameProps>;
};

export const GAMES: GameDefinition[] = [
  {
    id: "sequence",
    title: "Siguiente número",
    description:
      "Completa la serie: averigua qué número falta al final. El patrón puede ser un salto fijo, saltos que alternan, cuadrados, productos u otras reglas.",
    component: SequenceGame,
  },
  {
    id: "math",
    title: "Cuenta rápida",
    description: "Resuelve multiplicaciones y divisiones con resultado entero.",
    component: MathQuickGame,
  },
  {
    id: "count",
    title: "Contar emojis",
    description:
      "Verás muchos emojis repartidos por la pantalla, cuenta cuántas veces aparece el emoji seleccionado y ignora el resto.",
    component: CountShapesGame,
  },
  {
    id: "anagram",
    title: "Mini-wos",
    description:
      "Con las letras de la ronda forma todas las palabras válidas de al menos cuatro letras. Las letras de arriba se barajan cada 10 segundos.",
    component: MiniWosGame,
  },
  {
    id: "grounding",
    title: "Grounding 5-4-3-2-1",
    description:
      "Ejercicio de anclaje para volver al cuerpo y al entorno: recorre los pasos 5-4-3-2-1. En cada uno escribe lo que ves, oyes, notas al tacto, hueles o saboreas (o piénsalo en silencio).",
    component: GroundingGame,
  },
  {
    id: "sudoku9",
    title: "Sudoku 9x9",
    description:
      "Rellena las celdas vacías para que cada fila, columna y bloque de 3x3 tenga los números del 1 al 9 sin repetir. Las celdas con número fijo no se pueden cambiar.",
    component: Sudoku9Game,
  },
  {
    id: "memory",
    title: "Parejas de emojis",
    description:
      "Encuentra todas las parejas, toca dos cartas para voltearlas; si coinciden se quedan descubiertas.",
    component: MemoryPairsGame,
  },
  {
    id: "orderTap",
    title: "Ordena los números",
    description:
      "Pulsa los números en orden. Si pulsas un número que no toca, la ronda se reinicia desde el principio.",
    component: OrderTapGame,
  },
  {
    id: "categoryNames",
    title: "3 por categoría",
    description: "Nombra tres cosas que encajen con la categoría seleccionada.",
    component: CategoryNamesGame,
  },
  {
    id: "compareNumbers",
    title: "¿Cuál es mayor?",
    description: "Elige la opción cuyo resultado sea el mayor.",
    component: CompareNumbersGame,
  },
];

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function pickRandomGame(excludeId?: GameId): GameDefinition {
  const pool =
    excludeId === undefined ? GAMES : GAMES.filter((g) => g.id !== excludeId);
  if (pool.length === 0) {
    return GAMES[randomInt(GAMES.length)]!;
  }
  return pool[randomInt(pool.length)]!;
}

export function getGameById(id: GameId): GameDefinition {
  return GAMES.find((g) => g.id === id) ?? GAMES[0]!;
}
