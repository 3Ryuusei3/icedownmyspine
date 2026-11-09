import { ArrowBigUp, Delete } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useLang } from "@/lib/language"
import { cn } from "@/lib/utils"

type TextKeypadProps = {
  value: string
  onChange: (next: string) => void
  maxLength: number
  disabled?: boolean
  className?: string
}

const DIGITS = "1234567890".split("")
const ROWS = ["qwertyuiop".split(""), "asdfghjkl".split("")]
const BOTTOM_LETTERS = "zxcvbnm".split("")

const ACCENTS: Record<string, string> = {
  a: "á",
  e: "é",
  i: "í",
  o: "ó",
  u: "ú",
  A: "Á",
  E: "É",
  I: "Í",
  O: "Ó",
  U: "Ú",
}

const COPY = {
  es: {
    group: "Teclado",
    shift: "Mayúscula",
    accent: "Tilde",
    delete: "Borrar",
    space: "Espacio",
  },
  en: {
    group: "Keyboard",
    shift: "Shift",
    accent: "Accent",
    delete: "Delete",
    space: "Space",
  },
}

const KEY =
  "min-h-10 min-w-0 flex-1 px-0 text-base font-semibold sm:min-h-11 sm:text-lg"

/**
 * Teclado en pantalla para escribir texto libre sin que el móvil abra su
 * teclado (así el foco del campo no se pierde). Mayúscula al empezar y tras
 * un punto, tecla de tilde en español.
 */
export function TextKeypad({
  value,
  onChange,
  maxLength,
  disabled = false,
  className,
}: TextKeypadProps) {
  const { lang } = useLang()
  const c = COPY[lang]
  const [shift, setShift] = useState(false)
  const [accent, setAccent] = useState(false)

  const autoCaps = value === "" || /[.!?¿¡]\s$/.test(value)
  const upper = shift || autoCaps

  function insert(text: string) {
    if (value.length + text.length > maxLength) return
    onChange(value + text)
  }

  function onLetter(letter: string) {
    let ch = upper ? letter.toUpperCase() : letter
    if (accent) ch = ACCENTS[ch] ?? ch
    insert(ch)
    setShift(false)
    setAccent(false)
  }

  function onSpace() {
    if (value === "" || value.endsWith(" ")) return
    insert(" ")
  }

  const keep = (e: { preventDefault: () => void }) => e.preventDefault()

  const letterKey = (ch: string) => (
    <Button
      key={ch}
      type="button"
      variant="outline"
      disabled={disabled}
      className={KEY}
      onMouseDown={keep}
      onClick={() => onLetter(ch)}
    >
      {upper ? ch.toUpperCase() : ch}
    </Button>
  )

  const charKey = (ch: string) => (
    <Button
      key={ch}
      type="button"
      variant="outline"
      disabled={disabled}
      className={KEY}
      onMouseDown={keep}
      onClick={() => insert(ch)}
    >
      {ch}
    </Button>
  )

  return (
    <div
      role="group"
      aria-label={c.group}
      className={cn("flex w-full flex-col gap-1.5 sm:gap-2", className)}
    >
      <div className="flex flex-row gap-1 sm:gap-1.5">{DIGITS.map(charKey)}</div>
      <div className="flex flex-row gap-1 sm:gap-1.5">{ROWS[0]!.map(letterKey)}</div>
      <div className="flex flex-row gap-1 sm:gap-1.5">
        {ROWS[1]!.map(letterKey)}
        {lang === "es" ? letterKey("ñ") : null}
      </div>
      <div className="flex flex-row gap-1 sm:gap-1.5">
        <Button
          type="button"
          variant={shift ? "default" : "outline"}
          disabled={disabled}
          className={cn(KEY, "flex-[1.4]")}
          onMouseDown={keep}
          onClick={() => setShift((s) => !s)}
          aria-label={c.shift}
          aria-pressed={shift}
        >
          <ArrowBigUp className="size-5" aria-hidden />
        </Button>
        {BOTTOM_LETTERS.map(letterKey)}
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(KEY, "flex-[1.4]")}
          onMouseDown={keep}
          onClick={() => onChange(value.slice(0, -1))}
          aria-label={c.delete}
        >
          <Delete className="size-5" aria-hidden />
        </Button>
      </div>
      <div className="flex flex-row gap-1 sm:gap-1.5">
        {lang === "es" ? (
          <Button
            type="button"
            variant={accent ? "default" : "outline"}
            disabled={disabled}
            className={cn(KEY, "flex-[1.2]")}
            onMouseDown={keep}
            onClick={() => setAccent((a) => !a)}
            aria-label={c.accent}
            aria-pressed={accent}
          >
            ´
          </Button>
        ) : null}
        {charKey(",")}
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(KEY, "flex-[5]")}
          onMouseDown={keep}
          onClick={onSpace}
          aria-label={c.space}
        />
        {charKey(".")}
        {charKey("?")}
        {charKey("!")}
      </div>
    </div>
  )
}
