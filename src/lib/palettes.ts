export type PaletteId =
  | "noche"
  | "hielo"
  | "bosque"
  | "menta"
  | "cacao"
  | "arena"
  | "ciruela"
  | "lavanda"

export type Palette = {
  id: PaletteId
  /** Fondo y color de acento, solo para la muestra del selector. */
  background: string
  accent: string
  /** Color de la barra del navegador en móvil. */
  themeColor: string
}

export const DEFAULT_PALETTE: PaletteId = "noche"

/** De dos en dos, como se ven en la cuadrícula: clara a la izquierda, oscura a la derecha. */
export const PALETTES: Palette[] = [
  {
    id: "hielo",
    background: "oklch(0.982 0.007 232)",
    accent: "oklch(0.43 0.07 245)",
    themeColor: "#f6f9fb",
  },
  {
    id: "noche",
    background: "oklch(0.19 0.025 252)",
    accent: "oklch(0.82 0.08 228)",
    themeColor: "#11161f",
  },
  {
    id: "menta",
    background: "oklch(0.95 0.032 160)",
    accent: "oklch(0.45 0.09 160)",
    themeColor: "#e6f3ec",
  },
  {
    id: "bosque",
    background: "oklch(0.2 0.025 165)",
    accent: "oklch(0.82 0.08 155)",
    themeColor: "#121e19",
  },
  {
    id: "arena",
    background: "oklch(0.972 0.014 85)",
    accent: "oklch(0.5 0.07 65)",
    themeColor: "#f8f4ea",
  },
  {
    id: "cacao",
    background: "oklch(0.2 0.02 55)",
    accent: "oklch(0.8 0.08 75)",
    themeColor: "#1d1712",
  },
  {
    id: "lavanda",
    background: "oklch(0.942 0.024 300)",
    accent: "oklch(0.47 0.1 295)",
    themeColor: "#ebe6f4",
  },
  {
    id: "ciruela",
    background: "oklch(0.2 0.03 310)",
    accent: "oklch(0.8 0.09 305)",
    themeColor: "#1b1220",
  },
]
