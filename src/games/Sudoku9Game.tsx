import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GameProps } from "@/games/types";
import {
  formatSudoku9Lines,
  isValidCompletedSudoku9,
  respectsSudoku9Givens,
} from "@/lib/sudoku9Validate";
import { pickSudoku9Puzzle } from "@/lib/sudoku9Presets";

const SIZE = 9;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

/** Último dígito 1–9 aunque el input envíe varios caracteres (sustitución en móvil). */
function parseCellDigit(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  const last = digits.slice(-1);
  if (last === "") return null;
  const n = Number.parseInt(last, 10);
  if (n >= 1 && n <= 9) return n;
  return null;
}

export function Sudoku9Game({ onWin }: GameProps) {
  const [{ puzzle, cells }, setPuzzleState] = useState(() => {
    const p = pickSudoku9Puzzle();
    return { puzzle: p, cells: [...p.initial] as number[] };
  });

  const [feedback, setFeedback] = useState<"bad" | null>(null);

  function setCell(i: number, raw: string) {
    if (puzzle.initial[i] !== 0) return;
    const trimmed = raw.trim();
    if (trimmed === "") {
      setPuzzleState((s) => {
        const n = [...s.cells];
        n[i] = 0;
        return { ...s, cells: n };
      });
      setFeedback(null);
      return;
    }
    const num = parseCellDigit(raw);
    if (num !== null) {
      setPuzzleState((s) => {
        const n = [...s.cells];
        n[i] = num;
        return { ...s, cells: n };
      });
      setFeedback(null);
    }
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
    <div className="flex flex-col gap-4 max-sm:gap-2">
      <p className="text-muted-foreground max-sm:text-xs max-sm:leading-snug text-sm leading-relaxed">
        Cada fila, columna y bloque 3×3 debe tener los dígitos 1–9 sin repetir.
      </p>
      <div
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
            return (
              <div
                key={i}
                className={`bg-card ${br ? "border-r-border border-r-2" : ""} ${bb ? "border-b-border border-b-2" : ""} flex aspect-square min-w-0 items-center justify-center p-px sm:p-0.5`}
                role="gridcell"
              >
                {fixed ? (
                  <span className="text-xs font-semibold tabular-nums sm:text-sm">
                    {puzzle.initial[i]}
                  </span>
                ) : (
                  <Input
                    inputMode="numeric"
                    maxLength={2}
                    aria-label={`Celda fila ${ri + 1} columna ${ci + 1}`}
                    className="h-full min-h-0 w-full min-w-0 rounded-none border-0 bg-transparent p-0 text-center text-[13px] shadow-none focus-visible:ring-1 sm:text-sm"
                    value={val === 0 ? "" : String(val)}
                    onChange={(e) => setCell(i, e.target.value)}
                  />
                )}
              </div>
            );
          }),
        )}
      </div>
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
