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
import {
  CATEGORY_LABELS,
  GAMES,
  type GameCategory,
  type GameId,
} from "@/lib/gameRegistry"

type SettingsDialogProps = {
  enabled: GameId[]
  onChange: (ids: GameId[]) => void
}

const idsOf = (category?: GameCategory) =>
  GAMES.filter((g) => category === undefined || g.category === category).map(
    (g) => g.id,
  )

const PRESETS: { label: string; ids: GameId[] }[] = [
  { label: "Todos", ids: idsOf() },
  { label: "Juegos", ids: idsOf("game") },
  { label: "Relajación", ids: idsOf("relax") },
]

const sameSet = (a: GameId[], b: GameId[]) =>
  a.length === b.length && a.every((id) => b.includes(id))

const CATEGORIES: GameCategory[] = ["game", "relax"]

export function SettingsDialog({ enabled, onChange }: SettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const activePreset = PRESETS.find((p) => sameSet(p.ids, enabled))

  function toggle(id: GameId) {
    if (enabled.includes(id)) {
      if (enabled.length === 1) return
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
          aria-label="Configuración"
        >
          <Settings className="size-4 sm:size-5" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[90vh] gap-4 overflow-y-auto sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>Configuración</DialogTitle>
          <DialogDescription>
            Elige qué juegos salen al pulsar «Jugar a otro».
          </DialogDescription>
        </DialogHeader>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Rotación</h3>
          <div className="flex flex-row gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                type="button"
                variant={activePreset?.label === p.label ? "default" : "secondary"}
                className="min-h-10 min-w-0 flex-1 px-2 text-sm sm:min-h-11"
                aria-pressed={activePreset?.label === p.label}
                onClick={() => onChange(p.ids)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <p className="text-muted-foreground min-h-4 text-xs">
            {activePreset
              ? `${enabled.length} en la rotación`
              : `Personalizada: ${enabled.length} en la rotación`}
          </p>
        </section>

        {CATEGORIES.map((category) => (
          <section key={category} className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">{CATEGORY_LABELS[category]}</h3>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
              {GAMES.filter((g) => g.category === category).map((g) => {
                const on = enabled.includes(g.id)
                return (
                  <Button
                    key={g.id}
                    type="button"
                    variant="outline"
                    aria-pressed={on}
                    disabled={on && enabled.length === 1}
                    className={cn(
                      "h-auto min-h-12 justify-between gap-2 whitespace-normal border-2 px-3 py-2 text-left text-xs leading-tight font-medium sm:text-sm",
                      on
                        ? "border-primary bg-accent text-accent-foreground hover:bg-accent disabled:opacity-100"
                        : "text-muted-foreground",
                    )}
                    onClick={() => toggle(g.id)}
                  >
                    <span>{g.title}</span>
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
