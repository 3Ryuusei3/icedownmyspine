import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { NumericKeypad } from "@/components/numeric-keypad";
import type { GameProps } from "@/games/types";
import { cn } from "@/lib/utils";
import {
  formatSudoku9Lines,
  isValidCompletedSudoku9,
  respectsSudoku9Givens,
} from "@/lib/sudoku9Validate";
import { pickSudoku9Puzzle } from "@/lib/sudoku9Presets";

const SIZE = 9;
const SUDOKU_DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export function Sudoku9Game({ onWin }: GameProps) {
  const [{ puzzle, cells }, setPuzzleState] = useState(() => {
    const p = pickSudoku9Puzzle();
    return { puzzle: p, cells: [...p.initial] as number[] };
  });

  const [feedback, setFeedback] = useState<"bad" | null>(null);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  function writeCell(i: number, value: number) {
    if (puzzle.initial[i] !== 0) return;
    setPuzzleState((s) => {
      const n = [...s.cells];
      n[i] = value;
      return { ...s, cells: n };
    });
    setFeedback(null);
  }

  function onCellMouseDown(i: number, e: React.MouseEvent) {
    if (puzzle.initial[i] !== 0) return;
    e.preventDefault();
    setActiveCell(i);
  }

  function onKeypadDigit(d: string) {
    if (activeCell === null) return;
    const n = Number.parseInt(d, 10);
    if (n >= 1 && n <= 9) writeCell(activeCell, n);
  }

  function onKeypadBackspace() {
    if (activeCell === null) return;
    writeCell(activeCell, 0);
  }

  function check() {
    if (cells.some((c) => c === 0)) {
      setFeedback("bad");
      return;
    }
    const ok =
      respectsSudoku9Givens(cells, puzzle.initial) &&
      isValidCompletedSudoku9(cells);
    if (ok) {
      setFeedback(null);
      onWin?.({
        solutionText: formatSudoku9Lines(puzzle.solution),
      });
    } else {
      setFeedback("bad");
    }
  }

  const rows = chunk(cells, SIZE);

  return (
    <div
      className="flex flex-col gap-4 max-sm:gap-2"
      onMouseDown={(e) => {
        if (!gridRef.current) return;
        if (!gridRef.current.contains(e.target as Node)) {
          setActiveCell(null);
        }
      }}
    >
      <p className="text-muted-foreground max-sm:text-xs max-sm:leading-snug text-sm leading-relaxed">
        Cada fila, columna y bloque 3×3 debe tener los dígitos 1–9 sin repetir.
      </p>
      <div
        ref={gridRef}
        className="border-border bg-border mx-auto grid w-full max-w-md grid-cols-9 gap-px overflow-hidden rounded-xl border-2 p-0.5 sm:max-w-lg sm:p-1"
        role="grid"
        aria-label="Sudoku 9 por 9"
      >
        {rows.map((row, ri) =>
          row.map((val, ci) => {
            const i = ri * SIZE + ci;
            const fixed = puzzle.initial[i] !== 0;
            const br = ci % 3 === 2 && ci < SIZE - 1;
            const bb = ri % 3 === 2 && ri < SIZE - 1;
            const isActive = activeCell === i;
            return (
              <div
                key={i}
                className={cn(
                  "bg-card flex aspect-square min-w-0 items-center justify-center p-px sm:p-0.5",
                  br && "border-r-border border-r-2",
                  bb && "border-b-border border-b-2",
                  isActive && "ring-primary/60 ring-2 ring-inset",
                )}
                role="gridcell"
              >
                {fixed ? (
                  <span className="text-xs font-semibold tabular-nums sm:text-sm">
                    {puzzle.initial[i]}
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-label={`Celda fila ${ri + 1} columna ${ci + 1}${val === 0 ? ", vacía" : `, valor ${val}`}`}
                    className="h-full w-full touch-manipulation select-none bg-transparent text-center text-[13px] tabular-nums outline-none sm:text-sm"
                    onMouseDown={(e) => onCellMouseDown(i, e)}
                  >
                    {val === 0 ? "" : val}
                  </button>
                )}
              </div>
            );
          }),
        )}
      </div>
      {activeCell !== null && (
        <NumericKeypad
          digits={SUDOKU_DIGITS}
          onDigit={onKeypadDigit}
          onBackspace={onKeypadBackspace}
        />
      )}
      <Button
        type="button"
        className="min-h-10 w-full sm:min-h-11"
        onClick={check}
      >
        Comprobar solución
      </Button>
      {feedback === "bad" && (
        <p className="text-center text-sm text-destructive">
          Revisa celdas vacías o números repetidos en fila, columna o bloque.
        </p>
      )}
    </div>
  );
}
