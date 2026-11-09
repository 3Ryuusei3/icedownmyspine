import { createContext, useContext } from "react"

export type Lang = "es" | "en"

export const LANGS: { id: Lang; name: string }[] = [
  { id: "es", name: "Español" },
  { id: "en", name: "English" },
]

export const LANG_STORAGE_KEY = "ice-lang"

/** Idioma guardado; si no hay, el del navegador (inglés si empieza por «en»). */
export function readInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY)
    if (stored === "es" || stored === "en") return stored
  } catch {
    // sin almacenamiento: se usa el idioma del navegador
  }
  return typeof navigator !== "undefined" &&
    navigator.language.toLowerCase().startsWith("en")
    ? "en"
    : "es"
}

type LanguageContextValue = { lang: Lang; setLang: (lang: Lang) => void }

export const LanguageContext = createContext<LanguageContextValue>({
  lang: "es",
  setLang: () => {},
})

export const useLang = () => useContext(LanguageContext)
