import { Check, Settings } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useUi } from "@/i18n/use-ui"
import { GAMES, isAvailable, type GameCategory, type GameId } from "@/lib/gameRegistry"
import { LANGS, useLang, type Lang } from "@/lib/language"

type SettingsDialogProps = {
  enabled: GameId[]
  onChange: (ids: GameId[]) => void
  onLanguageChange: (lang: Lang) => void
}

const idsOf = (category?: GameCategory) =>
  GAMES.filter((g) => category === undefined || g.category === category).map(
    (g) => g.id,
  )

const sameSet = (a: GameId[], b: GameId[]) =>
  a.length === b.length && a.every((id) => b.includes(id))

const CATEGORIES: GameCategory[] = ["game", "relax"]

export function SettingsDialog({
  enabled,
  onChange,
  onLanguageChange,
}: SettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const ui = useUi()
  const { lang } = useLang()

  const available = GAMES.filter((g) => isAvailable(g, lang))
  const availableIds = available.map((g) => g.id)
  // Los juegos no disponibles en este idioma no cuentan, pero se conservan.
  const effective = enabled.filter((id) => availableIds.includes(id))
  const hasHidden = available.length < GAMES.length

  const presets: { key: string; label: string; ids: GameId[] }[] = [
    { key: "all", label: ui.settings.all, ids: idsOf() },
    { key: "game", label: ui.settings.games, ids: idsOf("game") },
    { key: "relax", label: ui.settings.relax, ids: idsOf("relax") },
  ]
  const activePreset = presets.find((p) =>
    sameSet(
      p.ids.filter((id) => availableIds.includes(id)),
      effective,
    ),
  )

  function toggle(id: GameId) {
    if (effective.includes(id)) {
      if (effective.length === 1) return
      onChange(enabled.filter((x) => x !== id))
    } else {
      onChange([...enabled, id])
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="size-9 min-h-9 min-w-9 shrink-0 sm:size-11 sm:min-h-11 sm:min-w-11"
          aria-label={ui.settings.aria}
        >
          <Settings className="size-4 sm:size-5" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[90vh] gap-4 overflow-y-auto sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>{ui.settings.title}</DialogTitle>
          <DialogDescription>{ui.settings.description}</DialogDescription>
        </DialogHeader>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">{ui.settings.language}</h3>
          <div className="flex flex-row gap-2">
            {LANGS.map((l) => (
              <Button
                key={l.id}
                type="button"
                variant={lang === l.id ? "default" : "secondary"}
                className="min-h-10 min-w-0 flex-1 px-2 text-sm sm:min-h-11"
                aria-pressed={lang === l.id}
                onClick={() => lang !== l.id && onLanguageChange(l.id)}
              >
                {l.name}
              </Button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">{ui.settings.rotation}</h3>
          <div className="flex flex-row gap-2">
            {presets.map((p) => (
              <Button
                key={p.key}
                type="button"
                variant={activePreset?.key === p.key ? "default" : "secondary"}
                className="min-h-10 min-w-0 flex-1 px-2 text-sm sm:min-h-11"
                aria-pressed={activePreset?.key === p.key}
                onClick={() => onChange(p.ids)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <p className="text-muted-foreground min-h-4 text-xs">
            {activePreset
              ? ui.settings.inRotation(effective.length)
              : ui.settings.custom(effective.length)}
            {hasHidden ? ` · ${ui.settings.spanishOnly}` : ""}
          </p>
        </section>

        {CATEGORIES.map((category) => (
          <section key={category} className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">{ui.categories[category]}</h3>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
              {available
                .filter((g) => g.category === category)
                .map((g) => {
                  const on = effective.includes(g.id)
                  return (
                    <Button
                      key={g.id}
                      type="button"
                      variant="outline"
                      aria-pressed={on}
                      disabled={on && effective.length === 1}
                      className={cn(
                        "h-auto min-h-12 justify-between gap-2 whitespace-normal border-2 px-3 py-2 text-left text-xs leading-tight font-medium sm:text-sm",
                        on
                          ? "border-primary bg-accent text-accent-foreground hover:bg-accent disabled:opacity-100"
                          : "text-muted-foreground",
                      )}
                      onClick={() => toggle(g.id)}
                    >
                      <span>{g.text[lang].title}</span>
                      <Check
                        aria-hidden
                        className={cn("size-4 shrink-0", on ? "text-primary" : "invisible")}
                      />
                    </Button>
                  )
                })}
            </div>
          </section>
        ))}
      </DialogContent>
    </Dialog>
  )
}
