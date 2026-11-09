import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { DEFAULT_PALETTE, PALETTES } from "@/lib/palettes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      themes={PALETTES.map((p) => p.id)}
      defaultTheme={DEFAULT_PALETTE}
      enableSystem={false}
      storageKey="ice-palette"
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
