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
    current: "Actual",
  },

  palettePicker: { aria: "Elegir paleta de colores" },
  palettes: {
    noche: "Noche",
    hielo: "Hielo",
    bosque: "Bosque",
    arena: "Arena",
    lavanda: "Lavanda",
  } satisfies Record<PaletteId, string>,

  settings: {
    aria: "Configuración",
    title: "Configuración",
    description: "Elige el idioma y qué juegos salen al pulsar «Jugar a otro».",
    language: "Idioma",
    rotation: "Rotación",
    all: "Todos",
    games: "Juegos",
    relax: "Relajación",
    inRotation: (n: number) => `${n} en la rotación`,
    custom: (n: number) => `Personalizada: ${n} en la rotación`,
    spanishOnly: "Algunos juegos solo están disponibles en español.",
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
    current: "Current",
  },

  palettePicker: { aria: "Choose a color palette" },
  palettes: {
    noche: "Night",
    hielo: "Ice",
    bosque: "Forest",
    arena: "Sand",
    lavanda: "Lavender",
  },

  settings: {
    aria: "Settings",
    title: "Settings",
    description: "Choose the language and which games come up on “Play another”.",
    language: "Language",
    rotation: "Rotation",
    all: "All",
    games: "Games",
    relax: "Relaxation",
    inRotation: (n) => `${n} in rotation`,
    custom: (n) => `Custom: ${n} in rotation`,
    spanishOnly: "Some games are only available in Spanish.",
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
