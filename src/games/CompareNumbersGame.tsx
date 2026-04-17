import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { GameProps } from "@/games/types";
import { useStableRandom } from "@/hooks/use-stable-random";
import { shuffle } from "@/lib/shuffle";
import { cn } from "@/lib/utils";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type RawPair = {
  labelL: string;
  labelR: string;
  valueL: number;
  valueR: number;
};

const GAP_MIN = 2;
const GAP_MAX = 11;
const CLEAR_BELOW_MIN = 15;
const CLEAR_BELOW_MAX = 44;

function labelAsOperation(n: number): string {
  const roll = randomInt(0, 4);
  if (roll === 0 && n >= 20) {
    const a = randomInt(9, n - 9);
    const b = n - a;
    if (b >= 8) return `${a} + ${b}`;
  }
  if (roll === 1) {
    const k = randomInt(8, Math.min(42, Math.max(8, n)));
    return `${n + k} − ${k}`;
  }
  if (roll === 2) {
    for (let t = 0; t < 24; t++) {
      const a = randomInt(6, 15);
      if (n % a !== 0) continue;
      const b = n / a;
      if (b >= 6 && b <= 22) return `${a} × ${b}`;
    }
  }
  const d = randomInt(4, 9);
  return `${n * d} ÷ ${d}`;
}

function genTwoNumbers(): RawPair {
  for (let t = 0; t < 50; t++) {
    const a = randomInt(48, 138);
    const delta = randomInt(GAP_MIN, GAP_MAX);
    const b = a + (Math.random() < 0.5 ? delta : -delta);
    if (b >= 40 && b <= 165) {
      return {
        labelL: labelAsOperation(a),
        labelR: labelAsOperation(b),
        valueL: a,
        valueR: b,
      };
    }
  }
  const a = 80;
  const b = a + randomInt(GAP_MIN, GAP_MAX);
  return {
    labelL: labelAsOperation(a),
    labelR: labelAsOperation(b),
    valueL: a,
    valueR: b,
  };
}

function genTwoProducts(): RawPair {
  for (let t = 0; t < 80; t++) {
    const a1 = randomInt(8, 16);
    const b1 = randomInt(10, 18);
    const a2 = randomInt(8, 16);
    const b2 = randomInt(10, 18);
    const v1 = a1 * b1;
    const v2 = a2 * b2;
    const d = Math.abs(v1 - v2);
    if (d >= GAP_MIN && d <= GAP_MAX) {
      return {
        labelL: `${a1} × ${b1}`,
        labelR: `${a2} × ${b2}`,
        valueL: v1,
        valueR: v2,
      };
    }
  }
  return genTwoNumbers();
}

function genSumVsProduct(): RawPair {
  for (let t = 0; t < 80; t++) {
    const a = randomInt(24, 50);
    const b = randomInt(24, 50);
    const p1 = randomInt(9, 15);
    const p2 = randomInt(10, 17);
    const s = a + b;
    const pr = p1 * p2;
    const d = Math.abs(s - pr);
    if (d >= GAP_MIN && d <= GAP_MAX) {
      return {
        labelL: `${a} + ${b}`,
        labelR: `${p1} × ${p2}`,
        valueL: s,
        valueR: pr,
      };
    }
  }
  return genTwoNumbers();
}

function genTwoDivisions(): RawPair {
  for (let t = 0; t < 40; t++) {
    const d1 = randomInt(5, 9);
    const d2 = randomInt(5, 9);
    const q1 = randomInt(14, 24);
    const delta = randomInt(GAP_MIN, GAP_MAX);
    const q2 = q1 + (Math.random() < 0.5 ? delta : -delta);
    if (q2 < 12 || q2 > 28) continue;
    const n1 = q1 * d1;
    const n2 = q2 * d2;
    return {
      labelL: `${n1} ÷ ${d1}`,
      labelR: `${n2} ÷ ${d2}`,
      valueL: q1,
      valueR: q2,
    };
  }
  return genTwoNumbers();
}

function genNumberVsProduct(): RawPair {
  for (let t = 0; t < 80; t++) {
    const a = randomInt(9, 16);
    const b = randomInt(10, 17);
    const pr = a * b;
    const delta = randomInt(GAP_MIN, GAP_MAX);
    const n = pr + (Math.random() < 0.5 ? delta : -delta);
    if (n < 55 || n > 165) continue;
    return {
      labelL: labelAsOperation(n),
      labelR: `${a} × ${b}`,
      valueL: n,
      valueR: pr,
    };
  }
  return genTwoNumbers();
}

function genSubtractionVsSum(): RawPair {
  for (let t = 0; t < 80; t++) {
    const a = randomInt(58, 92);
    const b = randomInt(16, 36);
    const c = randomInt(28, 54);
    const d = randomInt(28, 54);
    const diff = a - b;
    const s = c + d;
    if (diff <= 0) continue;
    const gap = Math.abs(diff - s);
    if (gap >= GAP_MIN && gap <= GAP_MAX) {
      return {
        labelL: `${a} − ${b}`,
        labelR: `${c} + ${d}`,
        valueL: diff,
        valueR: s,
      };
    }
  }
  return genTwoNumbers();
}

function buildRawPair(): RawPair {
  const pick = randomInt(0, 5);
  if (pick === 0) return genTwoNumbers();
  if (pick === 1) return genTwoProducts();
  if (pick === 2) return genSumVsProduct();
  if (pick === 3) return genTwoDivisions();
  if (pick === 4) return genNumberVsProduct();
  return genSubtractionVsSum();
}

type ComparePuzzle = {
  labelA: string;
  valueA: number;
  labelB: string;
  valueB: number;
  labelC: string;
  valueC: number;
};

function buildPuzzle(): ComparePuzzle {
  let p = buildRawPair();
  let guard = 0;
  while (p.valueL === p.valueR && guard++ < 24) {
    p = buildRawPair();
  }
  const gap = Math.abs(p.valueL - p.valueR);
  if (gap < GAP_MIN || gap > GAP_MAX) {
    p = genTwoNumbers();
  }
  if (Math.random() < 0.5) {
    p = {
      labelL: p.labelR,
      labelR: p.labelL,
      valueL: p.valueR,
      valueR: p.valueL,
    };
  }

  const lo = Math.min(p.valueL, p.valueR);
  const ceiling = lo - CLEAR_BELOW_MIN;
  let valueLow: number;
  if (ceiling < 10) {
    valueLow = Math.max(5, lo - CLEAR_BELOW_MAX);
  } else {
    valueLow = randomInt(8, ceiling);
  }
  if (valueLow >= lo - 10) {
    valueLow = Math.max(5, lo - CLEAR_BELOW_MIN);
  }

  const labelLow = labelAsOperation(valueLow);

  const triple = shuffle([
    { label: p.labelL, value: p.valueL },
    { label: p.labelR, value: p.valueR },
    { label: labelLow, value: valueLow },
  ]);

  return {
    labelA: triple[0]!.label,
    valueA: triple[0]!.value,
    labelB: triple[1]!.label,
    valueB: triple[1]!.value,
    labelC: triple[2]!.label,
    valueC: triple[2]!.value,
  };
}

export function CompareNumbersGame({ onWin }: GameProps) {
  const puzzle = useStableRandom(() => buildPuzzle());

  const [wrong, setWrong] = useState(false);

  function choose(letter: "A" | "B" | "C") {
    const values = [
      { letter: "A" as const, v: puzzle.valueA },
      { letter: "B" as const, v: puzzle.valueB },
      { letter: "C" as const, v: puzzle.valueC },
    ];
    const maxV = Math.max(puzzle.valueA, puzzle.valueB, puzzle.valueC);
    const winners = values.filter((x) => x.v === maxV);
    const correctLetter = winners.length === 1 ? winners[0]!.letter : null;
    const correct = correctLetter === letter;

    if (correct) {
      const sorted = [puzzle.valueA, puzzle.valueB, puzzle.valueC].sort(
        (a, b) => b - a,
      );
      onWin?.({
        solutionText: `Correcto: ${maxV} es la mayor (las otras dan ${sorted[1]} y ${sorted[2]}).`,
      });
    } else {
      setWrong(true);
      window.setTimeout(() => setWrong(false), 500);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button
          type="button"
          variant="outline"
          className={cn(
            "border-border hover:bg-muted/80 flex min-h-24 flex-col justify-center gap-1 rounded-xl border-2 px-3 py-4 text-base",
            wrong && "animate-pulse",
          )}
          onClick={() => choose("A")}
        >
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            A
          </span>
          <span className="text-foreground font-mono text-xl font-semibold tabular-nums sm:text-2xl">
            {puzzle.labelA}
          </span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "border-border hover:bg-muted/80 flex min-h-24 flex-col justify-center gap-1 rounded-xl border-2 px-3 py-4 text-base",
            wrong && "animate-pulse",
          )}
          onClick={() => choose("B")}
        >
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            B
          </span>
          <span className="text-foreground font-mono text-xl font-semibold tabular-nums sm:text-2xl">
            {puzzle.labelB}
          </span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "border-border hover:bg-muted/80 flex min-h-24 flex-col justify-center gap-1 rounded-xl border-2 px-3 py-4 text-base",
            wrong && "animate-pulse",
          )}
          onClick={() => choose("C")}
        >
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            C
          </span>
          <span className="text-foreground font-mono text-xl font-semibold tabular-nums sm:text-2xl">
            {puzzle.labelC}
          </span>
        </Button>
      </div>
      {wrong ? (
        <p className="text-destructive text-center text-sm" role="status">
          Repasa el cálculo y elige otra vez.
        </p>
      ) : null}
    </div>
  );
}
