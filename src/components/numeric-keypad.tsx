import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUi } from "@/i18n/use-ui";

export type NumericKeypadProps = {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  digits?: readonly string[];
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  onToggleSign?: () => void;
};

const DEFAULT_DIGITS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
] as const;

export function NumericKeypad({
  onDigit,
  onBackspace,
  digits = DEFAULT_DIGITS,
  disabled = false,
  className,
  ariaLabel,
  onToggleSign,
}: NumericKeypadProps) {
  const ui = useUi().keypad;
  return (
    <div
      role="group"
      aria-label={ariaLabel ?? ui.numeric}
      aria-disabled={disabled}
      className={cn("flex w-full flex-row gap-1 sm:gap-1.5", className)}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {onToggleSign ? (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="min-h-10 min-w-0 flex-1 px-0 text-base font-semibold tabular-nums sm:min-h-11 sm:text-lg"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onToggleSign()}
          aria-label={ui.minus}
        >
          -
        </Button>
      ) : null}
      {digits.map((d) => (
        <Button
          key={d}
          type="button"
          variant="outline"
          disabled={disabled}
          className="min-h-10 flex-1 px-0 text-base font-semibold tabular-nums sm:min-h-11 sm:text-lg"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onDigit(d)}
          aria-label={ui.digit(d)}
        >
          {d}
        </Button>
      ))}
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className="min-h-10 flex-1 px-0 sm:min-h-11"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onBackspace}
        aria-label={ui.backspace}
      >
        <Delete className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
