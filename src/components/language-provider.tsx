import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  LANG_STORAGE_KEY,
  LanguageContext,
  readInitialLang,
  type Lang,
} from "@/lib/language"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next)
    } catch {
      // se aplica igualmente en esta sesión
    }
  }, [])

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
