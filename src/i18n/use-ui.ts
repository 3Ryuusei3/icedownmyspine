import { useLang } from "@/lib/language"
import { UI } from "@/i18n/ui"

/** Textos generales de la interfaz en el idioma activo. */
export function useUi() {
  return UI[useLang().lang]
}
