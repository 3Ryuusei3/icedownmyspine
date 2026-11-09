import type { Lang } from "@/lib/language"
import type { PaletteId } from "@/lib/palettes"

const es = {
  documentTitle: "Hielo por la espalda",
  subtitle:
    "Minijuegos sencillos para desviar la atención. No hay puntuación ni prisa.",
  repeatGame: "Repetir juego",
  repeatGameAria: "Volver a jugar a este juego",
  playAnother: "Jugar a otro",
  playAnotherAria: "Jugar a otro juego",
  winTitle: "¡Muy bien!",
  winDescription:
    "Has completado este minijuego. Tómate un respiro si lo necesitas.",
  repeat: "Repetir",
  another: "Otro",

  categories: { game: "Juegos", relax: "Relajación" },

  picker: {
    aria: "Elegir minijuego",
    title: "Minijuegos",
    description: "Elige uno; se cargará una partida nueva.",
  },

  palettes: {
    noche: "Medianoche",
    hielo: "Hielo",
    bosque: "Bosque",
    menta: "Menta",
    ciruela: "Ciruela",
    arena: "Arena",
    cacao: "Cacao",
    lavanda: "Lavanda",
  } satisfies Record<PaletteId, string>,

  settings: {
    aria: "Configuración",
    title: "Configuración",
    description: "Personaliza la app.",
    tabs: { general: "General", rotation: "Rotación", data: "Datos" },
    colors: "Colores",
    language: "Idioma",
    all: "Todos",
    games: "Juegos",
    relax: "Relajación",
    inRotation: (n: number) => `${n} en la rotación`,
    custom: (n: number) => `Personalizada: ${n} en la rotación`,
    spanishOnly: "Algunos juegos solo están disponibles en español.",
  },

  data: {
    intro:
      "Solo se guardan en este dispositivo y no se pueden exportar. Donde ves un tiempo, es tu mejor marca.",
    totalLabel: "Total",
    times: (n: number) => (n === 1 ? "1 vez" : `${n} veces`),
    never: "Sin jugar aún",
    best: "Mejor tiempo",
    reset: "Borrar estadísticas",
    confirm: "¿Seguro? No se puede deshacer.",
    confirmYes: "Sí, borrar",
    cancel: "Cancelar",
    lostNote:
      "Si borras los datos del navegador o desinstalas la app, se perderán.",
  },

  playback: {
    reset: "Reiniciar",
    start: "Empezar",
    pause: "Pausar",
    resume: "Continuar",
  },

  keypad: {
    numeric: "Teclado numérico",
    minus: "Signo menos al inicio del número",
    digit: (d: string) => `Dígito ${d}`,
    backspace: "Borrar último dígito",
  },
}

export type UiText = typeof es

const en: UiText = {
  documentTitle: "Ice Down Your Spine",
  subtitle:
    "Simple mini-games to take your mind off things. No scores, no rush.",
  repeatGame: "Restart game",
  repeatGameAria: "Play this game again",
  playAnother: "Play another",
  playAnotherAria: "Play a different game",
  winTitle: "Well done!",
  winDescription:
    "You've completed this mini-game. Take a breath if you need it.",
  repeat: "Again",
  another: "Another",

  categories: { game: "Games", relax: "Relaxation" },

  picker: {
    aria: "Choose a mini-game",
    title: "Mini-games",
    description: "Pick one; a new round will start.",
  },

  palettes: {
    noche: "Midnight",
    hielo: "Ice",
    bosque: "Forest",
    menta: "Mint",
    ciruela: "Plum",
    arena: "Sand",
    cacao: "Cocoa",
    lavanda: "Lavender",
  },

  settings: {
    aria: "Settings",
    title: "Settings",
    description: "Customize the app.",
    tabs: { general: "General", rotation: "Rotation", data: "Data" },
    colors: "Colors",
    language: "Language",
    all: "All",
    games: "Games",
    relax: "Relaxation",
    inRotation: (n) => `${n} in rotation`,
    custom: (n) => `Custom: ${n} in rotation`,
    spanishOnly: "Some games are only available in Spanish.",
  },

  data: {
    intro:
      "Saved only on this device and can't be exported. Where you see a time, it's your best.",
    totalLabel: "Total",
    times: (n) => (n === 1 ? "1 time" : `${n} times`),
    never: "Not played yet",
    best: "Best time",
    reset: "Clear stats",
    confirm: "Sure? This can't be undone.",
    confirmYes: "Yes, clear",
    cancel: "Cancel",
    lostNote:
      "If you clear your browser data or uninstall the app, they'll be lost.",
  },

  playback: {
    reset: "Restart",
    start: "Start",
    pause: "Pause",
    resume: "Resume",
  },

  keypad: {
    numeric: "Number keypad",
    minus: "Minus sign at the start of the number",
    digit: (d) => `Digit ${d}`,
    backspace: "Delete last digit",
  },
}

export const UI: Record<Lang, UiText> = { es, en }
