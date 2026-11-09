import type { ComponentType } from "react";
import type { Lang } from "@/lib/language";
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

export type GameText = { title: string; description: string };

export type GameDefinition = {
  id: GameId;
  category: GameCategory;
  /** Si el juego usa la línea de estado exterior (reserva su altura). */
  statusLine?: boolean;
  /** Si el tiempo de partida es significativo (se guarda el mejor tiempo). */
  timed?: boolean;
  /** Idiomas en los que está disponible; todos si se omite. */
  langs?: Lang[];
  text: Record<Lang, GameText>;
  component: ComponentType<GameProps>;
};

export const GAMES: GameDefinition[] = [
  {
    id: "sequence",
    category: "game",
    statusLine: true,
    text: {
      es: {
        title: "Siguiente número",
        description:
          "Completa la serie: averigua qué número falta al final. El patrón puede ser un salto fijo, saltos que alternan, cuadrados, productos u otras reglas.",
      },
      en: {
        title: "Next number",
        description:
          "Complete the series: figure out which number comes next. The pattern might be a fixed step, alternating steps, squares, products or other rules.",
      },
    },
    component: SequenceGame,
  },
  {
    id: "math",
    category: "game",
    statusLine: true,
    text: {
      es: {
        title: "Cuenta rápida",
        description:
          "Resuelve multiplicaciones y divisiones con resultado entero.",
      },
      en: {
        title: "Quick math",
        description:
          "Solve multiplications and divisions with whole-number results.",
      },
    },
    component: MathQuickGame,
  },
  {
    id: "count",
    category: "game",
    statusLine: true,
    text: {
      es: {
        title: "Contar emojis",
        description:
          "Verás muchos emojis repartidos por la pantalla, cuenta cuántas veces aparece el emoji seleccionado y ignora el resto.",
      },
      en: {
        title: "Count the emojis",
        description:
          "You'll see lots of emojis scattered around. Count how many times the chosen emoji appears and ignore the rest.",
      },
    },
    component: CountShapesGame,
  },
  {
    id: "anagram",
    category: "game",
    statusLine: true,
    langs: ["es"],
    text: {
      es: {
        title: "Mini-wos",
        description:
          "Con las letras de la ronda forma todas las palabras válidas de al menos cuatro letras. Las letras de arriba se barajan cada 10 segundos.",
      },
      en: {
        title: "Mini-wos",
        description:
          "Only available in Spanish.",
      },
    },
    component: MiniWosGame,
  },
  {
    id: "breathing",
    category: "relax",
    text: {
      es: {
        title: "Respiración guiada",
        description:
          "Sigue el círculo: inhala mientras se hincha, mantén el aire y exhala mientras se encoge. Antes de empezar puedes ajustar los segundos, si quieres pausa y el número de respiraciones. Puedes pausarlo cuando lo necesites.",
      },
      en: {
        title: "Guided breathing",
        description:
          "Follow the circle: breathe in as it grows, hold your breath, and breathe out as it shrinks. Before you start you can adjust the seconds, whether to pause, and the number of breaths. You can pause whenever you need.",
      },
    },
    component: BreathingGame,
  },
  {
    id: "letGo",
    category: "relax",
    text: {
      es: {
        title: "Soltar pensamientos",
        description:
          "Escribe algo que te ronde la cabeza y pulsa «Soltar»: se irá flotando hasta desvanecerse. No se guarda nada. Suelta los que quieras.",
      },
      en: {
        title: "Let go of thoughts",
        description:
          "Write something that's on your mind and press “Release”: it will float away until it fades. Nothing is saved. Release as many as you like.",
      },
    },
    component: ReleaseThoughtsGame,
  },
  {
    id: "grounding",
    category: "relax",
    text: {
      es: {
        title: "Grounding 5-4-3-2-1",
        description:
          "Ejercicio de anclaje para volver al cuerpo y al entorno: recorre los pasos 5-4-3-2-1. En cada uno escribe lo que ves, oyes, notas al tacto, hueles o saboreas (o piénsalo en silencio).",
      },
      en: {
        title: "Grounding 5-4-3-2-1",
        description:
          "A grounding exercise to come back to your body and surroundings: go through the 5-4-3-2-1 steps. In each one, write what you see, hear, feel, smell or taste (or just think it quietly).",
      },
    },
    component: GroundingGame,
  },
  {
    id: "sudoku9",
    category: "game",
    statusLine: true,
    timed: true,
    text: {
      es: {
        title: "Sudoku 9x9",
        description:
          "Rellena las celdas vacías para que cada fila, columna y bloque de 3x3 tenga los números del 1 al 9 sin repetir. Las celdas con número fijo no se pueden cambiar.",
      },
      en: {
        title: "Sudoku 9x9",
        description:
          "Fill the empty cells so every row, column and 3x3 block has the numbers 1 to 9 without repeats. The fixed numbers can't be changed.",
      },
    },
    component: Sudoku9Game,
  },
  {
    id: "memory",
    category: "game",
    timed: true,
    text: {
      es: {
        title: "Parejas de emojis",
        description:
          "Encuentra todas las parejas, toca dos cartas para voltearlas; si coinciden se quedan descubiertas.",
      },
      en: {
        title: "Emoji pairs",
        description:
          "Find all the pairs: tap two cards to flip them; if they match, they stay face up.",
      },
    },
    component: MemoryPairsGame,
  },
  {
    id: "orderTap",
    category: "game",
    statusLine: true,
    timed: true,
    text: {
      es: {
        title: "Ordena los números",
        description:
          "Pulsa los números en orden. Si pulsas un número que no toca, la ronda se reinicia desde el principio.",
      },
      en: {
        title: "Order the numbers",
        description:
          "Tap the numbers in order. If you tap one out of turn, the round starts over from the beginning.",
      },
    },
    component: OrderTapGame,
  },
  {
    id: "categoryNames",
    category: "relax",
    statusLine: true,
    text: {
      es: {
        title: "3 por categoría",
        description:
          "Nombra tres cosas que encajen con la categoría seleccionada.",
      },
      en: {
        title: "3 per category",
        description:
          "Name three things that fit the chosen category.",
      },
    },
    component: CategoryNamesGame,
  },
  {
    id: "compareNumbers",
    category: "game",
    statusLine: true,
    text: {
      es: {
        title: "¿Cuál es mayor?",
        description:
          "Elige la opción cuyo resultado sea el mayor.",
      },
      en: {
        title: "Which is bigger?",
        description:
          "Pick the option whose result is the biggest.",
      },
    },
    component: CompareNumbersGame,
  },
  {
    id: "simon",
    category: "game",
    text: {
      es: {
        title: "Simón",
        description:
          "Mira la secuencia de colores y repítela en el mismo orden. Son 3 niveles con 4 colores: la secuencia a recordar tiene 4, 5 y 6 pasos. Si fallas, puedes reintentar el nivel o reiniciar la partida.",
      },
      en: {
        title: "Simon",
        description:
          "Watch the sequence of colors and repeat it in the same order. There are 3 levels with 4 colors: the sequence to remember has 4, 5 and 6 steps. If you slip, you can retry the level or restart the game.",
      },
    },
    component: SimonGame,
  },
  {
    id: "memoryGrid",
    category: "game",
    text: {
      es: {
        title: "Cuadriculado",
        description:
          "Se iluminan entre 5 y 15 casillas de una cuadrícula de 5x5. Memorízalas y márcalas cuando se apaguen.",
      },
      en: {
        title: "Remember the grid",
        description:
          "Between 5 and 15 squares of a 5x5 grid light up. Memorize them and mark them once they turn off.",
      },
    },
    component: MemoryGridGame,
  },
];

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

/**
 * Elige un juego al azar entre los de la rotación (`allowedIds`; todos si se
 * omite), evitando repetir `excludeId` siempre que haya otra opción.
 */
export function isAvailable(game: GameDefinition, lang: Lang): boolean {
  return game.langs === undefined || game.langs.includes(lang);
}

export function pickRandomGame(
  excludeId: GameId | undefined,
  allowedIds: readonly GameId[] | undefined,
  lang: Lang,
): GameDefinition {
  const inLang = GAMES.filter((g) => isAvailable(g, lang));
  const rotation = allowedIds
    ? inLang.filter((g) => allowedIds.includes(g.id))
    : inLang;
  const base = rotation.length > 0 ? rotation : inLang;
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
