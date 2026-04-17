import { Delete } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type NumericKeypadProps = {
  onDigit: (digit: string) => void
  onBackspace: () => void
  /** Dígitos disponibles en orden de izquierda a derecha. */
  digits?: readonly string[]
  /** Si es true, todas las teclas están deshabilitadas (p. ej. sudoku sin celda). */
  disabled?: boolean
  className?: string
  /** Etiqueta accesible del grupo. */
  ariaLabel?: string
}

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
] as const

/**
 * Teclado numérico de una sola fila para usar bajo un input que tenga
 * `inputMode="none"`, evitando así el teclado del sistema en móvil.
 *
 * Los botones usan `onMouseDown` con `preventDefault` para no robar el foco
 * al input asociado (el caret sigue visible y el botón de enviar del input
 * Enter del teclado físico sigue funcionando).
 */
export function NumericKeypad({
  onDigit,
  onBackspace,
  digits = DEFAULT_DIGITS,
  disabled = false,
  className,
  ariaLabel = "Teclado numérico",
}: NumericKeypadProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={cn(
        "flex w-full flex-row gap-1 sm:gap-1.5",
        className,
      )}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {digits.map((d) => (
        <Button
          key={d}
          type="button"
          variant="outline"
          disabled={disabled}
          className="min-h-10 flex-1 px-0 text-base font-semibold tabular-nums sm:min-h-11 sm:text-lg"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onDigit(d)}
          aria-label={`Dígito ${d}`}
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
        aria-label="Borrar último dígito"
      >
        <Delete className="size-4" aria-hidden />
      </Button>
    </div>
  )
}
