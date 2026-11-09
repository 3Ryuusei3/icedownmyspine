import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { LanguageProvider } from "@/components/language-provider"
import { ThemeColorSync } from "@/components/theme-color-sync"
import { ThemeProvider } from "@/components/theme-provider"
import App from "./App.tsx"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <ThemeColorSync />
        <App />
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>,
)
