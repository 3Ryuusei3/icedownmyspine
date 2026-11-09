import { Check, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, type ReactNode } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUi } from "@/i18n/use-ui"
import {
  GAMES,
  isAvailable,
  type GameCategory,
  type GameId,
} from "@/lib/gameRegistry"
import { LANGS, useLang, type Lang } from "@/lib/language"
import { DEFAULT_PALETTE, PALETTES } from "@/lib/palettes"
import { formatDuration, resetStats, useStats } from "@/lib/stats"

type SettingsDialogProps = {
  enabled: GameId[]
  onChange: (ids: GameId[]) => void
  onLanguageChange: (lang: Lang) => void
  /** Botón que abre los ajustes; por defecto, un botón con icono. */
  trigger?: ReactNode
  /** Si se indica, la pestaña General muestra un botón para volver a la home. */
  onGoHome?: () => void
}

const idsOf = (category?: GameCategory) =>
  GAMES.filter((g) => category === undefined || g.category === category).map(
    (g) => g.id,
  )

const sameSet = (a: GameId[], b: GameId[]) =>
  a.length === b.length && a.every((id) => b.includes(id))

const CATEGORIES: GameCategory[] = ["game", "relax"]

function ColorsSection() {
  const ui = useUi()
  const { theme, setTheme } = useTheme()
  const current = theme ?? DEFAULT_PALETTE

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{ui.settings.colors}</h3>
      <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
        {PALETTES.map((p) => {
          const on = p.id === current
          return (
            <Button
              key={p.id}
              type="button"
              variant="outline"
              aria-pressed={on}
              className={cn(
                "h-auto min-h-14 justify-start gap-3 border-2 px-3 py-2 text-sm font-medium",
                on
                  ? "border-primary bg-accent text-accent-foreground hover:bg-accent dark:border-primary dark:bg-accent dark:hover:bg-accent"
                  : "text-muted-foreground",
              )}
              onClick={() => setTheme(p.id)}
            >
              <span
                aria-hidden
                className="border-border relative size-7 shrink-0 overflow-hidden rounded-full border"
                style={{ background: p.background }}
              >
                <span
                  className="absolute inset-y-0 right-0 w-1/2"
                  style={{ background: p.accent }}
                />
              </span>
              <span className="flex-1 text-left">{ui.palettes[p.id]}</span>
              <Check
                aria-hidden
                className={cn("size-4 shrink-0", on ? "text-primary" : "invisible")}
              />
            </Button>
          )
        })}
      </div>
    </section>
  )
}

function LanguageSection({
  onLanguageChange,
}: Pick<SettingsDialogProps, "onLanguageChange">) {
  const ui = useUi()
  const { lang } = useLang()

  return (
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
  )
}

function GeneralTab({
  onLanguageChange,
  onGoHome,
}: Pick<SettingsDialogProps, "onLanguageChange" | "onGoHome">) {
  const ui = useUi()

  return (
    <div className="flex flex-col gap-5">
      <ColorsSection />
      <LanguageSection onLanguageChange={onLanguageChange} />
      {onGoHome ? (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">{ui.settings.home}</h3>
          <Button
            type="button"
            variant="secondary"
            className="min-h-10 w-full text-sm sm:min-h-11"
            onClick={onGoHome}
          >
            {ui.settings.goHome}
          </Button>
        </section>
      ) : null}
    </div>
  )
}

function RotationTab({
  enabled,
  onChange,
}: Pick<SettingsDialogProps, "enabled" | "onChange">) {
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
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-2">
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
                        ? "border-primary bg-accent text-accent-foreground hover:bg-accent disabled:opacity-100 dark:border-primary dark:bg-accent dark:hover:bg-accent"
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
    </div>
  )
}

function DataTab() {
  const ui = useUi()
  const { lang } = useLang()
  const stats = useStats()
  const [confirming, setConfirming] = useState(false)

  const total = GAMES.reduce((n, g) => n + (stats[g.id]?.plays ?? 0), 0)

  return (
    <div className="flex flex-col gap-3">
      {CATEGORIES.map((category) => (
        <section key={category} className="flex flex-col">
          <h3 className="text-muted-foreground mb-0.5 text-[11px] font-medium tracking-wide uppercase">
            {ui.categories[category]}
          </h3>
          <ul className="flex flex-col">
            {GAMES.filter(
              (g) => g.category === category && isAvailable(g, lang),
            ).map((g) => {
              const s = stats[g.id]
              return (
                <li
                  key={g.id}
                  className="border-border/60 flex items-baseline justify-between gap-3 border-b py-1 text-[13px] last:border-b-0"
                >
                  <span className="min-w-0 truncate">{g.text[lang].title}</span>
                  <span className="text-muted-foreground shrink-0 text-right text-xs tabular-nums">
                    {s ? ui.data.times(s.plays) : ui.data.never}
                    {s?.bestMs !== undefined
                      ? ` · ${formatDuration(s.bestMs)}`
                      : ""}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      <section className="flex flex-col gap-2">
        <p className="flex items-baseline justify-between gap-3 text-sm font-bold">
          <span>{ui.data.totalLabel}</span>
          <span className="tabular-nums">{ui.data.times(total)}</span>
        </p>
        {confirming ? (
          <>
            <p className="text-destructive text-sm">{ui.data.confirm}</p>
            <div className="flex flex-row gap-2">
              <Button
                type="button"
                variant="secondary"
                className="min-h-10 min-w-0 flex-1 px-2 text-sm"
                onClick={() => setConfirming(false)}
              >
                {ui.data.cancel}
              </Button>
              <Button
                type="button"
                className="min-h-10 min-w-0 flex-1 px-2 text-sm"
                onClick={() => {
                  resetStats()
                  setConfirming(false)
                }}
              >
                {ui.data.confirmYes}
              </Button>
            </div>
          </>
        ) : (
          <Button
            type="button"
            variant="secondary"
            className="min-h-10 w-full text-sm"
            disabled={total === 0}
            onClick={() => setConfirming(true)}
          >
            {ui.data.reset}
          </Button>
        )}
        <p className="text-muted-foreground text-[11px] leading-snug">
          {ui.data.intro} {ui.data.lostNote}
        </p>
      </section>
    </div>
  )
}

export function SettingsDialog(props: SettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const ui = useUi()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {props.trigger ?? (
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="size-9 min-h-9 min-w-9 shrink-0 sm:size-11 sm:min-h-11 sm:min-w-11"
            aria-label={ui.settings.aria}
          >
            <Settings className="size-4 sm:size-5" aria-hidden />
          </Button>
        )}
      </DialogTrigger>
      {/* Altura fija: al cambiar de pestaña el diálogo no cambia de tamaño. */}
      <DialogContent
        className="flex h-[min(92vh,46rem)] flex-col gap-3 sm:max-w-xl"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>{ui.settings.title}</DialogTitle>
          <DialogDescription>{ui.settings.description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">{ui.settings.tabs.general}</TabsTrigger>
            <TabsTrigger value="rotation">{ui.settings.tabs.rotation}</TabsTrigger>
            <TabsTrigger value="data">{ui.settings.tabs.data}</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <GeneralTab
              onLanguageChange={props.onLanguageChange}
              onGoHome={
                props.onGoHome
                  ? () => {
                      setOpen(false)
                      props.onGoHome?.()
                    }
                  : undefined
              }
            />
          </TabsContent>
          <TabsContent value="rotation">
            <RotationTab enabled={props.enabled} onChange={props.onChange} />
          </TabsContent>
          <TabsContent value="data">
            <DataTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
