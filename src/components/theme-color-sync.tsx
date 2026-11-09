import { useTheme } from "next-themes"
import { useEffect } from "react"
import { DEFAULT_PALETTE, PALETTES } from "@/lib/palettes"

/** Ajusta el color de la barra del navegador en móvil a la paleta activa. */
export function ThemeColorSync() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // Un valor guardado que ya no existe (p. ej. de versiones antiguas) vuelve a la paleta por defecto.
    if (theme && !PALETTES.some((p) => p.id === theme)) {
      setTheme(DEFAULT_PALETTE)
      return
    }
    const palette =
      PALETTES.find((p) => p.id === theme) ??
      PALETTES.find((p) => p.id === DEFAULT_PALETTE)
    if (!palette) return
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", palette.themeColor)
  }, [theme, setTheme])

  return null
}
