import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { GameProps } from "@/games/types";
import { useStableRandom } from "@/hooks/use-stable-random";
import { shuffle } from "@/lib/shuffle";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type OrderRound = {
  start: number;
  end: number;
  numbers: number[];
  layout: number[];
};

const COUNT = 25;

function buildOrderRound(): OrderRound {
  const start = randomInt(1, 100 - (COUNT - 1));
  const end = start + (COUNT - 1);
  const numbers = Array.from({ length: COUNT }, (_, i) => start + i);
  return {
    start,
    end,
    numbers,
    layout: shuffle([...numbers]),
  };
}

export function OrderTapGame({ onWin }: GameProps) {
  const round = useStableRandom(() => buildOrderRound());

  const [nextExpected, setNextExpected] = useState(round.start);
  const [completed, setCompleted] = useState<Set<number>>(() => new Set());
  const [wrongFlash, setWrongFlash] = useState(false);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current !== null) {
        clearTimeout(flashTimeoutRef.current);
      }
    };
  }, []);

  function onCell(n: number) {
    if (n === nextExpected) {
      setWrongFlash(false);
      if (flashTimeoutRef.current !== null) {
        clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = null;
      }
      if (n === round.end) {
        setCompleted(new Set(round.numbers));
        onWin?.({
          solutionText: `Orden correcto: del ${round.start} al ${round.end} (${COUNT} números) sin fallar en esta disposición.`,
        });
      } else {
        setCompleted((prev) => new Set([...prev, n]));
        setNextExpected(n + 1);
      }
    } else {
      setNextExpected(round.start);
      setCompleted(new Set());
      setWrongFlash(true);
      if (flashTimeoutRef.current !== null) {
        clearTimeout(flashTimeoutRef.current);
      }
      flashTimeoutRef.current = setTimeout(() => {
        setWrongFlash(false);
        flashTimeoutRef.current = null;
      }, 450);
    }
  }

  const gridLabel = `Cuadrícula del ${round.start} al ${round.end}`;

  return (
    <div className="flex flex-col gap-4 max-sm:gap-2">
      <p className="text-muted-foreground max-sm:text-xs max-sm:leading-snug text-sm leading-relaxed">
        Pulsa los números del <strong>{round.start}</strong> al{" "}
        <strong>{round.end}</strong> en orden. Si te equivocas, vuelves a
        empezar.
      </p>
      {wrongFlash ? (
        <p
          className="text-destructive animate-pulse text-center text-sm font-medium"
          aria-live="polite"
        >
          Orden incorrecto — empieza otra vez por el {round.start}.
        </p>
      ) : null}
      <div
        className="mx-auto grid w-full max-w-sm grid-cols-5 gap-1.5 sm:max-w-md sm:gap-2.5"
        role="grid"
        aria-label={gridLabel}
      >
        {round.layout.map((n, i) => {
          const isDone = completed.has(n);
          return (
            <button
              key={`${i}-${n}`}
              type="button"
              role="gridcell"
              aria-label={`Número ${n}${isDone ? ", ya acertado" : ""}`}
              onClick={() => onCell(n)}
              className={cn(
                "border-border flex aspect-square min-h-10 items-center justify-center rounded-lg border-2 text-sm font-semibold tabular-nums transition-colors active:scale-[0.98] sm:min-h-14 sm:text-lg",
                isDone &&
                  "border-emerald-600/50 bg-emerald-600/15 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-100",
                !isDone && "bg-card hover:bg-muted/70",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
