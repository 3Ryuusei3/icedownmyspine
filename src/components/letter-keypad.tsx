import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const SPANISH_QWERTY_ROWS: readonly (readonly string[])[] = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
  ["", "Z", "X", "C", "V", "B", "N", "M"],
] as const;

export type FullLetterKeypadProps = {
  isLetterDisabled: (ch: string) => boolean;
  onLetter: (ch: string) => void;
  onBackspace: () => void;
  className?: string;
  ariaLabel?: string;
};

export function FullLetterKeypad({
  isLetterDisabled,
  onLetter,
  onBackspace,
  className,
  ariaLabel = "Teclado de letras",
}: FullLetterKeypadProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("flex w-full flex-col gap-1.5 sm:gap-2", className)}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {SPANISH_QWERTY_ROWS.map((row, ri) => {
        const isBottomRow = ri === SPANISH_QWERTY_ROWS.length - 1;
        return (
          <div
            key={ri}
            className="flex w-full max-w-2xl flex-row justify-center gap-1 self-center sm:gap-1.5"
          >
            {row.map((ch) => {
              const disabled = isLetterDisabled(ch);
              return (
                <Button
                  key={`${ri}-${ch}`}
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  className="min-h-10 min-w-0 flex-1 px-0 text-base font-semibold uppercase sm:min-h-11 sm:text-lg"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onLetter(ch)}
                  aria-label={
                    disabled ? `Letra ${ch} (no disponible)` : `Letra ${ch}`
                  }
                >
                  {ch}
                </Button>
              );
            })}
            {isBottomRow ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-10 min-w-0 flex-1 px-0 sm:min-h-11"
                onMouseDown={(e) => e.preventDefault()}
                onClick={onBackspace}
                aria-label="Borrar última letra"
              >
                <Delete className="size-4" aria-hidden />
              </Button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export type LetterKeypadProps = {
  letters: readonly string[];
  onLetter: (ch: string) => void;
  onBackspace: () => void;
  isLetterDisabled?: (ch: string) => boolean;
  className?: string;
  ariaLabel?: string;
};

export function LetterKeypad({
  letters,
  onLetter,
  onBackspace,
  isLetterDisabled,
  className,
  ariaLabel = "Teclado de letras",
}: LetterKeypadProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "flex w-full flex-row flex-wrap justify-center gap-1 sm:gap-1.5",
        className,
      )}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {letters.map((ch) => {
        const disabled = isLetterDisabled?.(ch) ?? false;
        return (
          <Button
            key={ch}
            type="button"
            variant="outline"
            disabled={disabled}
            className="min-h-10 min-w-10 px-0 text-base font-semibold uppercase sm:min-h-11 sm:min-w-11 sm:text-lg"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onLetter(ch)}
            aria-label={`Letra ${ch}`}
          >
            {ch}
          </Button>
        );
      })}
      <Button
        type="button"
        variant="outline"
        className="min-h-10 min-w-10 px-0 sm:min-h-11 sm:min-w-11"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onBackspace}
        aria-label="Borrar última letra"
      >
        <Delete className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
