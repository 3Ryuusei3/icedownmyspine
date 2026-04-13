import { useCallback, useEffect, useMemo, useState } from "react";
import { GamePicker } from "@/components/game-picker";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WinPayload } from "@/games/types";
import { getGameById, pickRandomGame, type GameId } from "@/lib/gameRegistry";

export function Home() {
  const initial = useMemo(() => pickRandomGame(), []);
  const [gameId, setGameId] = useState<GameId>(initial.id);
  const [session, setSession] = useState(0);
  const [replayNonce, setReplayNonce] = useState(0);
  const [winOpen, setWinOpen] = useState(false);
  const [winSolution, setWinSolution] = useState<string | null>(null);

  const game = getGameById(gameId);
  const GameComponent = game.component;

  useEffect(() => {
    document.title = "Hielo por la espalda";
  }, []);

  const swapGame = useCallback(() => {
    const next = pickRandomGame(gameId);
    setGameId(next.id);
    setSession((s) => s + 1);
  }, [gameId]);

  const selectGameFromMenu = useCallback((id: GameId) => {
    setGameId(id);
    setSession((s) => s + 1);
  }, []);

  const handleWin = useCallback((payload?: WinPayload) => {
    const text = payload?.solutionText;
    const solution =
      text === undefined || text === null || text === "" ? null : text;
    queueMicrotask(() => {
      setWinSolution(solution);
      setWinOpen(true);
    });
  }, []);

  const replayCurrentGame = useCallback(() => {
    setReplayNonce((n) => n + 1);
  }, []);

  const replaySameGame = useCallback(() => {
    setWinOpen(false);
    setWinSolution(null);
    replayCurrentGame();
  }, [replayCurrentGame]);

  const playAnotherGame = useCallback(() => {
    setWinOpen(false);
    setWinSolution(null);
    const next = pickRandomGame(gameId);
    setGameId(next.id);
    setSession((s) => s + 1);
  }, [gameId]);

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
        <header className="mb-6 flex shrink-0 flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 text-left">
            <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Hielo por la espalda
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md text-pretty text-sm leading-relaxed">
              Minijuegos sencillos para desviar la atención cuando sientes
              ansiedad u obsesión. No hay puntuación ni prisa.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <GamePicker currentId={gameId} onSelect={selectGameFromMenu} />
            <ModeToggle />
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto [-webkit-overflow-scrolling:touch]">
          <div className="mx-auto my-auto flex w-full min-w-0 flex-col gap-4 py-2">
            <Card className="border-border/60 bg-muted/50 shrink-0 shadow-sm dark:bg-muted/25">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl">{game.title}</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {game.description}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="shrink-0 overflow-hidden shadow-sm">
              <CardContent className="">
                <div className="flex flex-col items-center px-2 py-2">
                  <div className="w-full max-w-full">
                    <GameComponent
                      key={`${gameId}-${session}-${replayNonce}`}
                      onWin={handleWin}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex shrink-0 flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 w-full sm:flex-1"
            onClick={replayCurrentGame}
          >
            Volver a jugar a este juego
          </Button>
          <Button
            type="button"
            className="min-h-11 w-full sm:flex-1"
            onClick={swapGame}
          >
            Jugar a otro juego
          </Button>
        </div>
      </div>

      <Dialog
        open={winOpen}
        onOpenChange={(open) => {
          setWinOpen(open);
          if (!open) setWinSolution(null);
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>¡Muy bien!</DialogTitle>
            <DialogDescription>
              Has completado este minijuego. Tómate un respiro si lo necesitas.
            </DialogDescription>
          </DialogHeader>
          {winSolution !== null ? (
            <h3 className="text-balance whitespace-pre-line px-2 text-center text-lg leading-snug font-semibold text-emerald-600 dark:text-emerald-400">
              {winSolution}
            </h3>
          ) : null}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="min-h-11 w-full"
              onClick={replaySameGame}
            >
              Volver a jugar a este juego
            </Button>
            <Button
              type="button"
              className="min-h-11 w-full"
              onClick={playAnotherGame}
            >
              Jugar a otro juego
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
