import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullLetterKeypad } from "@/components/letter-keypad";
import { Input } from "@/components/ui/input";
import type { GameProps } from "@/games/types";
import miniWosData from "@/data/miniWosCombinations.json" with { type: "json" };
import { shuffle } from "@/lib/shuffle";
import { useStableRandom } from "@/hooks/use-stable-random";
import { cn } from "@/lib/utils";

const ENYE_HOLD = "\uE000";

function stripVowelAccentsKeepEnye(s: string, enyeChar: "ñ" | "Ñ") {
  let t = s.normalize("NFC").replace(/ñ/g, ENYE_HOLD).replace(/Ñ/g, ENYE_HOLD);
  t = t.normalize("NFD").replace(/\p{M}/gu, "");
  t = t.replaceAll(ENYE_HOLD, enyeChar);
  return t;
}

function normalizeWord(s: string) {
  return stripVowelAccentsKeepEnye(s, "ñ").toLowerCase().trim();
}

function inputToUpperNoAccents(s: string) {
  return stripVowelAccentsKeepEnye(s, "Ñ").toUpperCase();
}

function letterBagCounts(letters: readonly string[]) {
  const m = new Map<string, number>();
  for (const ch of letters) {
    m.set(ch, (m.get(ch) ?? 0) + 1);
  }
  return m;
}

function canSpellWithBag(word: string, letters: readonly string[]) {
  const bag = letterBagCounts(letters);
  const need = letterBagCounts([...word]);
  for (const [ch, n] of need) {
    if ((bag.get(ch) ?? 0) < n) return false;
  }
  return true;
}

/** No superar la bolsa de la ronda al añadir un carácter. */
function canAppendFromBag(
  current: string,
  ch: string,
  letters: readonly string[],
) {
  const maxBag = letterBagCounts(letters);
  const next = inputToUpperNoAccents(current + ch);
  const used = letterBagCounts([...next.normalize("NFC")]);
  for (const [c, n] of used) {
    if ((maxBag.get(c) ?? 0) < n) return false;
  }
  return true;
}

function sortWordsForGrid(words: readonly string[]) {
  return [...words].sort((a, b) => {
    if (a.length !== b.length) return a.length - b.length;
    return a.localeCompare(b, "es", { sensitivity: "base" });
  });
}

function wordGraphemeLen(s: string) {
  return [...s.normalize("NFC")].length;
}

const COL_COUNT = 2;

/** Incluye siempre la palabra base como jugable si no figura ya (misma forma normalizada). */
function mergePalabras(
  palabras: readonly string[],
  palabraBase: string,
): string[] {
  const list = [...palabras];
  const base = palabraBase.trim();
  const norms = new Set(list.map((p) => normalizeWord(p)));
  const baseNorm = normalizeWord(base);
  if (baseNorm.length === 0) return list;
  if (!norms.has(baseNorm)) {
    list.push(base);
  }
  return list;
}

const SHUFFLE_MS = 10_000;
const INPUT_FLASH_MS = 1_000;
const MIN_LETTERS = 4;

type InputFlash = "idle" | "error" | "success";

export function MiniWosGame({ onWin }: GameProps) {
  const combo = useStableRandom(() => {
    const list = miniWosData.combinations;
    return list[Math.floor(Math.random() * list.length)]!;
  });

  const palabrasCompletas = useMemo(
    () => mergePalabras(combo.palabras, combo.palabraBase),
    [combo.palabras, combo.palabraBase],
  );

  const sortedWords = useMemo(
    () => sortWordsForGrid(palabrasCompletas),
    [palabrasCompletas],
  );

  const gridRows = Math.max(1, Math.ceil(sortedWords.length / COL_COUNT));

  const [letterOrder, setLetterOrder] = useState(() =>
    shuffle([...combo.letras]),
  );
  const [shuffleNonce, setShuffleNonce] = useState(0);
  const [shuffleAnim, setShuffleAnim] = useState(false);
  const [found, setFound] = useState<Set<string>>(() => new Set());
  const [value, setValue] = useState("");
  const [inputFlash, setInputFlash] = useState<InputFlash>("idle");
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputWiggleRef = useRef<HTMLDivElement>(null);

  /** Letras que aparecen en alguna palabra con la longitud máxima de la ronda (empates incluidos). */
  const allowedFromLongestWords = useMemo(() => {
    let maxLen = 0;
    for (const w of palabrasCompletas) {
      const len = wordGraphemeLen(w);
      if (len > maxLen) maxLen = len;
    }
    const set = new Set<string>();
    for (const w of palabrasCompletas) {
      if (wordGraphemeLen(w) !== maxLen) continue;
      const upper = inputToUpperNoAccents(w);
      for (const ch of [...upper.normalize("NFC")]) {
        set.add(ch);
      }
    }
    return set;
  }, [palabrasCompletas]);

  function clearFlashTimer() {
    if (flashTimerRef.current !== null) {
      window.clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }
  }

  function flashError() {
    clearFlashTimer();
    setInputFlash("error");
    queueMicrotask(() => {
      const el = inputWiggleRef.current;
      if (!el) return;
      el.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-5px)" },
          { transform: "translateX(5px)" },
          { transform: "translateX(-4px)" },
          { transform: "translateX(4px)" },
          { transform: "translateX(-2px)" },
          { transform: "translateX(2px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 450, easing: "ease-in-out" },
      );
    });
    flashTimerRef.current = window.setTimeout(() => {
      setInputFlash("idle");
      flashTimerRef.current = null;
    }, INPUT_FLASH_MS);
  }

  useEffect(() => {
    return () => clearFlashTimer();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setShuffleAnim(true);
      setLetterOrder(shuffle([...combo.letras]));
      setShuffleNonce((n) => n + 1);
      window.setTimeout(() => setShuffleAnim(false), 480);
    }, SHUFFLE_MS);
    return () => window.clearInterval(id);
  }, [combo.letras]);

  const normToCanonical = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of palabrasCompletas) {
      m.set(normalizeWord(p), p);
    }
    return m;
  }, [palabrasCompletas]);

  function submit() {
    const raw = value.trim();
    if (raw === "") {
      flashError();
      return;
    }
    const letterCount = [...raw.normalize("NFC")].length;
    if (letterCount < MIN_LETTERS) {
      setValue("");
      flashError();
      return;
    }
    const key = normalizeWord(raw);
    const canonical = normToCanonical.get(key);
    if (canonical === undefined) {
      setValue("");
      flashError();
      return;
    }
    if (!canSpellWithBag(canonical, combo.letras)) {
      setValue("");
      flashError();
      return;
    }
    if (found.has(canonical)) {
      setValue("");
      flashError();
      return;
    }
    const next = new Set([...found, canonical]);
    setValue("");
    clearFlashTimer();
    setInputFlash("success");
    setFound(next);
    flashTimerRef.current = window.setTimeout(() => {
      setInputFlash("idle");
      flashTimerRef.current = null;
      if (next.size === palabrasCompletas.length) {
        onWin?.({
          solutionText: `Has encontrado las ${palabrasCompletas.length} palabras con «${combo.palabraBase}».`,
        });
      }
    }, INPUT_FLASH_MS);
  }

  function appendLetter(ch: string) {
    if (!canAppendFromBag(value, ch, combo.letras)) return;
    setValue(inputToUpperNoAccents(value + ch));
    clearFlashTimer();
    setInputFlash("idle");
  }

  function backspaceLetter() {
    setValue((v) => v.slice(0, -1));
    clearFlashTimer();
    setInputFlash("idle");
  }

  return (
    <div className="flex flex-col gap-4 max-sm:gap-2">
      <div
        className={cn(
          "border-border bg-muted/40 flex flex-wrap justify-center gap-1.5 rounded-xl border px-2 py-3 sm:gap-2 sm:px-3 sm:py-4",
          shuffleAnim && "animate-mini-wos-shuffle",
        )}
        aria-live="polite"
        aria-label="Letras disponibles"
      >
        {letterOrder.map((ch, i) => (
          <span
            key={`${shuffleNonce}-${i}-${ch}`}
            className="bg-card border-border flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-semibold uppercase tabular-nums sm:h-11 sm:min-w-11 sm:text-base"
          >
            {ch}
          </span>
        ))}
      </div>

      <div
        className="mx-auto grid w-full max-w-2xl grid-flow-col gap-x-6 gap-y-0.5 sm:gap-x-10"
        style={{
          gridTemplateRows: `repeat(${gridRows}, auto)`,
          gridTemplateColumns: `repeat(${COL_COUNT}, minmax(0, 1fr))`,
        }}
        role="list"
        aria-label="Palabras por longitud y orden alfabético (dos columnas)"
      >
        {sortedWords.map((word) => {
          const done = found.has(word);
          return (
            <div
              key={word}
              role="listitem"
              className="flex min-w-0 flex-row items-center justify-start gap-0.5"
            >
              {Array.from({ length: word.length }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "border-border flex h-8 w-7 shrink-0 items-center justify-center rounded border text-xs font-semibold uppercase sm:h-9 sm:w-8 sm:text-sm",
                    done
                      ? "border-emerald-600/40 bg-emerald-600/10 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-50"
                      : "bg-muted/60 text-muted-foreground",
                  )}
                >
                  {done ? word[i] : ""}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      <p className="text-muted-foreground text-center text-xs sm:text-sm">
        {found.size} / {palabrasCompletas.length} palabras
      </p>

      <div className="flex w-full max-w-2xl flex-col gap-2 self-center">
        <div className="flex flex-row items-center gap-2">
          <div ref={inputWiggleRef} className="min-w-0 flex-1">
            <Input
              id="mini-wos-input"
              inputMode="none"
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="Palabra…"
              value={value}
              onChange={(e) => {
                setValue(inputToUpperNoAccents(e.target.value));
                clearFlashTimer();
                setInputFlash("idle");
              }}
              aria-invalid={inputFlash === "error"}
              className={cn(
                "min-h-10 w-full transition-[color,box-shadow,background-color,border-color] duration-200 sm:min-h-11",
                inputFlash === "error" &&
                  "border-destructive bg-destructive/10 text-destructive ring-2 ring-destructive/35 dark:bg-destructive/20 dark:ring-destructive/45",
                inputFlash === "success" &&
                  "border-emerald-600 bg-emerald-600/15 text-emerald-950 ring-2 ring-emerald-600/35 dark:border-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-50 dark:ring-emerald-500/40",
              )}
              aria-label="Escribe una palabra"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  submit();
                }
              }}
            />
          </div>
          <Button
            type="button"
            size="icon"
            className="size-10 shrink-0 sm:size-11"
            onClick={submit}
            aria-label="Enviar palabra (o pulsa Enter)"
          >
            <ArrowRight className="size-5" aria-hidden />
          </Button>
        </div>
        <FullLetterKeypad
          isLetterDisabled={(ch) =>
            !allowedFromLongestWords.has(ch) ||
            !canAppendFromBag(value, ch, combo.letras)
          }
          onLetter={appendLetter}
          onBackspace={backspaceLetter}
          ariaLabel="Teclado: solo activas las letras que salen en las palabras más largas de la ronda"
        />
      </div>
    </div>
  );
}
