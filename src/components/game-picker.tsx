import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { LayoutGrid } from "lucide-react"

type GamePickerProps = {
  currentId: GameId
  onSelect: (id: GameId) => void
}

const CATEGORIES: GameCategory[] = ["game", "relax"]

export function GamePicker({ currentId, onSelect }: GamePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="size-9 min-h-9 min-w-9 shrink-0 sm:size-11 sm:min-h-11 sm:min-w-11"
          aria-label="Elegir minijuego"
        >
          <LayoutGrid className="size-4 sm:size-5" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[90vh] gap-4 overflow-y-auto sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>Minijuegos</DialogTitle>
          <DialogDescription>
            Elige uno; se cargará una partida nueva.
          </DialogDescription>
        </DialogHeader>
        {CATEGORIES.map((category) => (
          <section key={category} className="flex flex-col gap-2">
            <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
              {GAMES.filter((g) => g.category === category).map((g) => (
                <Button
                  key={g.id}
                  type="button"
                  variant={g.id === currentId ? "secondary" : "outline"}
                  className="min-h-14 h-auto flex-col gap-0.5 whitespace-normal px-2 py-2 text-center text-xs leading-tight font-medium sm:min-h-16 sm:gap-1 sm:py-3 sm:text-sm"
                  onClick={() => {
                    onSelect(g.id)
                    setOpen(false)
                  }}
                >
                  <span>{g.title}</span>
                  {g.id === currentId ? (
                    <span className="text-muted-foreground text-xs font-normal">
                      Actual
                    </span>
                  ) : null}
                </Button>
              ))}
            </div>
          </section>
        ))}
      </DialogContent>
    </Dialog>
  )
}
