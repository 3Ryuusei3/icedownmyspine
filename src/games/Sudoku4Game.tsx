import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GameProps } from "@/games/types";
import {
  formatSudoku4Lines,
  isValidCompletedSudoku4,
  respectsSudokuGivens,
} from "@/lib/sudoku4Validate";
import { SUDOKU4_PUZZLES } from "@/lib/sudoku4Presets";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function pickPuzzle() {
  return SUDOKU4_PUZZLES[Math.floor(Math.random() * SUDOKU4_PUZZLES.length)]!;
}

/** Último dígito 1–4 aunque el input envíe varios caracteres (sustitución en móvil). */
function parseCellDigit(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  const last = digits.slice(-1);
  if (last === "") return null;
  const n = Number.parseInt(last, 10);
  if (n >= 1 && n <= 4) return n;
  return null;
}

export function Sudoku4Game({ onWin }: GameProps) {
  const [{ puzzle, cells }, setPuzzleState] = useState(() => {
    const p = pickPuzzle();
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
      respectsSudokuGivens(cells, puzzle.initial) &&
      isValidCompletedSudoku4(cells);
    if (ok) {
      setFeedback(null);
      onWin?.({
        solutionText: formatSudoku4Lines(puzzle.solution),
      });
    } else {
      setFeedback("bad");
    }
  }

  const rows = chunk(cells, 4);

  return (
    <div className="flex flex-col gap-4 max-sm:gap-2">
      <p className="text-muted-foreground max-sm:text-xs max-sm:leading-snug text-sm leading-relaxed">
        Cada fila, columna y bloque debe tener 1, 2, 3 y 4 sin repetir.
      </p>
      <div
        className="border-border bg-border mx-auto grid w-full max-w-xs grid-cols-4 gap-px overflow-hidden rounded-xl border-2 p-0.5 sm:p-1"
        role="grid"
        aria-label="Sudoku 4 por 4"
      >
        {rows.map((row, ri) =>
          row.map((val, ci) => {
            const i = ri * 4 + ci;
            const fixed = puzzle.initial[i] !== 0;
            const br = ci === 1;
            const bb = ri === 1;
            return (
              <div
                key={i}
                className={`bg-card ${br ? "border-r-border border-r-2" : ""} ${bb ? "border-b-border border-b-2" : ""} flex aspect-square items-center justify-center p-0.5`}
                role="gridcell"
              >
                {fixed ? (
                  <span className="text-base font-semibold tabular-nums sm:text-lg">
                    {puzzle.initial[i]}
                  </span>
                ) : (
                  <Input
                    inputMode="numeric"
                    maxLength={2}
                    aria-label={`Celda fila ${ri + 1} columna ${ci + 1}`}
                    className="h-full min-h-0 w-full rounded-none border-0 bg-transparent text-center text-[16px] shadow-none focus-visible:ring-2 sm:text-lg"
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
