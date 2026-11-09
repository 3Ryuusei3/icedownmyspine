import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GamePicker } from "@/components/game-picker";
import { SettingsDialog } from "@/components/settings-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WinPayload } from "@/games/types";
import { useRotation } from "@/hooks/use-rotation";
import { useUi } from "@/i18n/use-ui";
import { useLang, type Lang } from "@/lib/language";
import { recordPlay } from "@/lib/stats";
import { StartScreen } from "@/pages/StartScreen";
import {
  getGameById,
  isAvailable,
  pickRandomGame,
  type GameId,
} from "@/lib/gameRegistry";

const HOME_SEEN_KEY = "ice-home-seen";

/** Una vez vista la home, las siguientes veces la app abre directamente un juego al azar. */
function hasSeenHome() {
  try {
    return localStorage.getItem(HOME_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function Home() {
  const { lang, setLang } = useLang();
  const ui = useUi();
  const { enabled, setEnabled } = useRotation();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- solo la partida inicial
  const initial = useMemo(() => pickRandomGame(undefined, enabled, lang), []);
  const [gameId, setGameId] = useState<GameId>(initial.id);
  const [screen, setScreen] = useState<"home" | "game">(() =>
    hasSeenHome() ? "game" : "home",
  );
  const [session, setSession] = useState(0);
  const [replayNonce, setReplayNonce] = useState(0);
  const [winOpen, setWinOpen] = useState(false);
  const [winSolution, setWinSolution] = useState<string | null>(null);

  const game = getGameById(gameId);
  const GameComponent = game.component;
  const gameText = game.text[lang];

  useEffect(() => {
    document.title = ui.documentTitle;
  }, [ui.documentTitle]);

  const changeLanguage = useCallback(
    (next: Lang) => {
      setLang(next);
      // Un juego no disponible en el nuevo idioma se cambia por otro.
      if (!isAvailable(getGameById(gameId), next)) {
        setGameId(pickRandomGame(undefined, enabled, next).id);
      }
      setSession((s) => s + 1);
    },
    [setLang, gameId, enabled],
  );

  const swapGame = useCallback(() => {
    const next = pickRandomGame(gameId, enabled, lang);
    setGameId(next.id);
    setSession((s) => s + 1);
  }, [gameId, enabled, lang]);

  const selectGameFromMenu = useCallback((id: GameId) => {
    setGameId(id);
    setSession((s) => s + 1);
    setScreen("game");
  }, []);

  // Desde la home: un juego al azar de la rotación.
  const startRandom = useCallback(() => {
    const next = pickRandomGame(gameId, enabled, lang);
    setGameId(next.id);
    setSession((s) => s + 1);
    setScreen("game");
  }, [gameId, enabled, lang]);

  useEffect(() => {
    if (screen !== "home") return;
    try {
      localStorage.setItem(HOME_SEEN_KEY, "1");
    } catch {
      // sin almacenamiento: la home se mostrará siempre
    }
  }, [screen]);

  const goHome = useCallback(() => {
    setWinOpen(false);
    setWinSolution(null);
    setScreen("home");
  }, []);

  const startedAt = useRef(Date.now());
  const gameKey = `${gameId}-${session}-${replayNonce}-${lang}`;
  useEffect(() => {
    startedAt.current = Date.now();
  }, [gameKey]);

  // Partida completada sin modal (juegos de relajación).
  const handleComplete = useCallback(() => {
    recordPlay(gameId);
  }, [gameId]);

  const handleWin = useCallback((payload?: WinPayload) => {
    recordPlay(
      gameId,
      game.timed ? Date.now() - startedAt.current : undefined,
    );
    const text = payload?.solutionText;
    const solution =
      text === undefined || text === null || text === "" ? null : text;
    queueMicrotask(() => {
      setWinSolution(solution);
      setWinOpen(true);
    });
  }, [gameId, game.timed]);

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
    const next = pickRandomGame(gameId, enabled, lang);
    setGameId(next.id);
    setSession((s) => s + 1);
  }, [gameId, enabled, lang]);

  if (screen === "home") {
    return (
      <div className="bg-background text-foreground">
        <StartScreen
          currentId={gameId}
          enabled={enabled}
          onSelectGame={selectGameFromMenu}
          onRotationChange={setEnabled}
          onLanguageChange={changeLanguage}
          onPlay={startRandom}
        />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col px-3 py-3 sm:px-6 sm:py-10">
        <header className="mb-3 shrink-0 sm:mb-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <img
                src="/icon-192.png"
                alt=""
                aria-hidden
                className="size-6 shrink-0 rotate-[15deg] sm:size-8"
              />
              <h1 className="min-w-0 text-balance text-lg font-semibold tracking-tight sm:text-2xl">
                {gameText.title}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <GamePicker currentId={gameId} onSelect={selectGameFromMenu} />
              <SettingsDialog
                enabled={enabled}
                onChange={setEnabled}
                onLanguageChange={changeLanguage}
                onGoHome={goHome}
              />
            </div>
          </div>
          <p className="text-muted-foreground mt-2 text-pretty text-xs leading-snug sm:text-sm sm:leading-relaxed">
            {gameText.description}
          </p>
        </header>

        <div className="-mx-1 flex min-h-0 flex-1 flex-col overflow-y-auto px-1 [-webkit-overflow-scrolling:touch]">
          <div className="mx-auto my-auto flex w-full min-w-0 flex-col gap-2 py-1 sm:gap-4 sm:py-2">
            <Card className="max-sm:gap-2 max-sm:py-3 shrink-0 overflow-hidden shadow-sm sm:gap-4 sm:py-4">
              <CardContent className="max-sm:px-3 sm:px-4">
                <div className="flex flex-col items-center px-1 py-1 sm:px-2 sm:py-2">
                  <div className="w-full max-w-full">
                    <GameComponent
                      key={gameKey}
                      onWin={handleWin}
                      onComplete={handleComplete}
                      onSwapGame={swapGame}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-3 flex shrink-0 flex-row gap-2 sm:mt-6 sm:gap-3">
          <Button
            type="button"
            variant="secondary"
            className="min-h-10 min-w-0 flex-1 px-2 text-sm sm:min-h-11 sm:px-3 sm:text-base"
            onClick={replayCurrentGame}
            aria-label={ui.repeatGameAria}
          >
            {ui.repeatGame}
          </Button>
          <Button
            type="button"
            className="min-h-10 min-w-0 flex-1 px-2 text-sm sm:min-h-11 sm:px-3 sm:text-base"
            onClick={swapGame}
            aria-label={ui.playAnotherAria}
          >
            {ui.playAnother}
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
            <DialogTitle>{ui.winTitle}</DialogTitle>
            <DialogDescription>{ui.winDescription}</DialogDescription>
          </DialogHeader>
          {winSolution !== null ? (
            <h3 className="text-balance whitespace-pre-line px-2 text-center text-base leading-snug font-semibold text-emerald-600 sm:text-lg dark:text-emerald-400">
              {winSolution}
            </h3>
          ) : null}
          <div className="flex flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="min-h-10 min-w-0 flex-1 px-2 text-sm sm:min-h-11 sm:px-3 sm:text-base"
              onClick={replaySameGame}
              aria-label={ui.repeatGameAria}
            >
              {ui.repeat}
            </Button>
            <Button
              type="button"
              className="min-h-10 min-w-0 flex-1 px-2 text-sm sm:min-h-11 sm:px-3 sm:text-base"
              onClick={playAnotherGame}
              aria-label={ui.playAnotherAria}
            >
              {ui.another}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
