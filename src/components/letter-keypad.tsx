import { Delete } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type LetterKeypadProps = {
  letters: readonly string[]
  onLetter: (ch: string) => void
  onBackspace: () => void
  /** Si devuelve true, la tecla no se puede pulsar (p. ej. bolsa agotada). */
  isLetterDisabled?: (ch: string) => boolean
  className?: string
  ariaLabel?: string
}

/**
 * Teclas de letras + borrar, para usar bajo un input con `inputMode="none"`.
 * Igual que el teclado numérico: evita robar foco al input del padre.
 */
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
        const disabled = isLetterDisabled?.(ch) ?? false
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
        )
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
  )
}
