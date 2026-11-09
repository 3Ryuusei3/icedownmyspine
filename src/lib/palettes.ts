export type PaletteId = "noche" | "hielo" | "bosque" | "arena" | "lavanda"

export type Palette = {
  id: PaletteId
  name: string
  /** Fondo y color de acento, solo para la muestra del selector. */
  background: string
  accent: string
  /** Color de la barra del navegador en móvil. */
  themeColor: string
}

export const DEFAULT_PALETTE: PaletteId = "noche"

export const PALETTES: Palette[] = [
  {
    id: "noche",
    name: "Noche",
    background: "oklch(0.19 0.025 252)",
    accent: "oklch(0.82 0.08 228)",
    themeColor: "#11161f",
  },
  {
    id: "hielo",
    name: "Hielo",
    background: "oklch(0.982 0.007 232)",
    accent: "oklch(0.43 0.07 245)",
    themeColor: "#f6f9fb",
  },
  {
    id: "bosque",
    name: "Bosque",
    background: "oklch(0.2 0.025 165)",
    accent: "oklch(0.82 0.08 155)",
    themeColor: "#121e19",
  },
  {
    id: "arena",
    name: "Arena",
    background: "oklch(0.972 0.014 85)",
    accent: "oklch(0.5 0.07 65)",
    themeColor: "#f8f4ea",
  },
  {
    id: "lavanda",
    name: "Lavanda",
    background: "oklch(0.942 0.024 300)",
    accent: "oklch(0.47 0.1 295)",
    themeColor: "#ebe6f4",
  },
]
