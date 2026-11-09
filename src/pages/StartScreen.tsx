import { LayoutGrid, Settings } from "lucide-react"
import { GamePicker } from "@/components/game-picker"
import { SettingsDialog } from "@/components/settings-dialog"
import { Button } from "@/components/ui/button"
import { useUi } from "@/i18n/use-ui"
import type { GameId } from "@/lib/gameRegistry"
import type { Lang } from "@/lib/language"

type StartScreenProps = {
  currentId: GameId
  enabled: GameId[]
  onSelectGame: (id: GameId) => void
  onRotationChange: (ids: GameId[]) => void
  onLanguageChange: (lang: Lang) => void
  onPlay: () => void
}

const SMALL_BTN = "min-h-11 min-w-0 flex-1 gap-2 px-2 text-sm sm:text-base"

/** Pantalla de inicio: un botón grande para jugar y accesos al catálogo y a los ajustes. */
export function StartScreen({
  currentId,
  enabled,
  onSelectGame,
  onRotationChange,
  onLanguageChange,
  onPlay,
}: StartScreenProps) {
  const ui = useUi()

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col items-center justify-center gap-8 px-4 py-8 text-center">
      <div className="flex flex-col items-center gap-3">
        <img
          src="/icon-192.png"
          alt=""
          aria-hidden
          className="size-20 rotate-[15deg] sm:size-24"
        />
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Ice Down Your Spine
        </h1>
        <p className="text-muted-foreground max-w-xs text-pretty text-sm leading-relaxed">
          {ui.subtitle}
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button
          type="button"
          className="min-h-14 w-full text-lg"
          onClick={onPlay}
        >
          {ui.home.play}
        </Button>

        <div className="flex flex-row gap-2 pt-1">
          <GamePicker
            currentId={currentId}
            onSelect={onSelectGame}
            trigger={
              <Button type="button" variant="outline" className={SMALL_BTN}>
                <LayoutGrid aria-hidden className="size-4" />
                {ui.home.catalog}
              </Button>
            }
          />
          <SettingsDialog
            enabled={enabled}
            onChange={onRotationChange}
            onLanguageChange={onLanguageChange}
            trigger={
              <Button type="button" variant="outline" className={SMALL_BTN}>
                <Settings aria-hidden className="size-4" />
                {ui.home.settings}
              </Button>
            }
          />
        </div>
      </div>
    </div>
  )
}
