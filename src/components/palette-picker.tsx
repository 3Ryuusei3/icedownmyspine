import { Check, Palette as PaletteIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUi } from "@/i18n/use-ui"
import { PALETTES } from "@/lib/palettes"

const subscribe = () => () => {}
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

const TRIGGER_CLASS =
  "size-9 min-h-9 min-w-9 shrink-0 sm:size-11 sm:min-h-11 sm:min-w-11"

export function PalettePicker() {
  const { theme, setTheme } = useTheme()
  const ui = useUi()
  const mounted = useMounted()

  const current = PALETTES.find((p) => p.id === theme) ?? PALETTES[0]!

  useEffect(() => {
    if (!mounted) return
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", current.themeColor)
  }, [mounted, current])

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        className={TRIGGER_CLASS}
        disabled
        aria-hidden
      />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className={TRIGGER_CLASS}
          aria-label={ui.palettePicker.aria}
        >
          <PaletteIcon className="size-4 sm:size-5" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {PALETTES.map((p) => (
          <DropdownMenuItem
            key={p.id}
            className="min-h-9 gap-2.5"
            onSelect={() => setTheme(p.id)}
          >
            <span
              aria-hidden
              className="border-border relative size-5 shrink-0 overflow-hidden rounded-full border"
              style={{ background: p.background }}
            >
              <span
                className="absolute inset-y-0 right-0 w-1/2"
                style={{ background: p.accent }}
              />
            </span>
            <span className="flex-1">{ui.palettes[p.id]}</span>
            {p.id === current.id ? <Check aria-hidden /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
