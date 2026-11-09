import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { GameProps } from "@/games/types"
import { useLang } from "@/lib/language"
import { useStableRandom } from "@/hooks/use-stable-random"

const COPY = {
  es: {
    first: "Primera…",
    second: "Segunda…",
    third: "Tercera…",
    done: "He puesto tres cosas",
    hint: "Rellena las tres casillas.",
    solution: (title: string, a: string, b: string, c: string) =>
      `Categoría: «${title}». Tus tres: ${a}, ${b}, ${c}.`,
  },
  en: {
    first: "First…",
    second: "Second…",
    third: "Third…",
    done: "I've written three things",
    hint: "Fill in all three boxes.",
    solution: (title: string, a: string, b: string, c: string) =>
      `Category: “${title}”. Your three: ${a}, ${b}, ${c}.`,
  },
}

const PROMPTS = [
  {
    title: "3 frutas",
    instruction: "Nombra 3 frutas.",
    en: { title: "3 fruits", instruction: "Name 3 fruits." },
  },
  {
    title: "Cosas azules",
    instruction: "Escribe 3 cosas que sean de color azul o lo parezcan.",
    en: { title: "Blue things", instruction: "Write 3 things that are blue or look blue." },
  },
  {
    title: "3 animales",
    instruction: "Nombra 3 animales que se te ocurran.",
    en: { title: "3 animals", instruction: "Name 3 animals that come to mind." },
  },
  {
    title: "En la cocina",
    instruction: "3 cosas que sueles ver en una cocina.",
    en: { title: "In the kitchen", instruction: "3 things you usually see in a kitchen." },
  },
  {
    title: "3 emociones",
    instruction: "Nombra 3 emociones o sensaciones.",
    en: { title: "3 emotions", instruction: "Name 3 emotions or feelings." },
  },
  {
    title: "Lugares",
    instruction: "3 lugares (reales o imaginarios) donde te gustaría estar.",
    en: { title: "Places", instruction: "3 places (real or imaginary) where you'd like to be." },
  },
  {
    title: "Sonidos",
    instruction: "3 sonidos que conozcas o te gusten.",
    en: { title: "Sounds", instruction: "3 sounds you know or like." },
  },
  {
    title: "Objetos redondos",
    instruction: "3 objetos que tengan forma más o menos redonda.",
    en: { title: "Round objects", instruction: "3 objects that are more or less round." },
  },
  {
    title: "Verduras o hortalizas",
    instruction: "Nombra 3 verduras u hortalizas.",
    en: { title: "Vegetables", instruction: "Name 3 vegetables." },
  },
  {
    title: "Cosas suaves",
    instruction: "3 cosas que al tacto se noten suaves.",
    en: { title: "Soft things", instruction: "3 things that feel soft to the touch." },
  },
  {
    title: "Transporte",
    instruction: "3 medios de transporte.",
    en: { title: "Transport", instruction: "3 means of transport." },
  },
  {
    title: "Películas o series",
    instruction: "3 películas o series que recuerdes (el título vale).",
    en: { title: "Movies or shows", instruction: "3 movies or shows you remember (the title counts)." },
  },
] as const

export function CategoryNamesGame({ onWin }: GameProps) {
  const { lang } = useLang()
  const t = COPY[lang]
  const basePrompt = useStableRandom(
    () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]!,
  )

  const prompt = lang === "en" ? basePrompt.en : basePrompt

  const [a, setA] = useState("")
  const [b, setB] = useState("")
  const [c, setC] = useState("")
  const [submitHint, setSubmitHint] = useState(false)

  function check() {
    const ok =
      a.trim().length > 0 && b.trim().length > 0 && c.trim().length > 0
    if (!ok) {
      setSubmitHint(true)
      return
    }
    setSubmitHint(false)
    onWin?.({
      solutionText: t.solution(prompt.title, a.trim(), b.trim(), c.trim()),
    })
  }

  return (
    <div className="flex w-full flex-col gap-4 max-sm:gap-2">
      <div>
        <p className="text-foreground max-sm:text-sm text-base font-medium leading-snug sm:text-lg">
          {prompt.instruction}
        </p>
      </div>

      <div className="flex flex-col gap-3 max-sm:gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="cat-1">1</Label>
          <Input
            id="cat-1"
            value={a}
            onChange={(e) => {
              setA(e.target.value)
              setSubmitHint(false)
            }}
            className="min-h-10 sm:min-h-11"
            autoComplete="off"
            placeholder={t.first}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-2">2</Label>
          <Input
            id="cat-2"
            value={b}
            onChange={(e) => {
              setB(e.target.value)
              setSubmitHint(false)
            }}
            className="min-h-10 sm:min-h-11"
            autoComplete="off"
            placeholder={t.second}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-3">3</Label>
          <Input
            id="cat-3"
            value={c}
            onChange={(e) => {
              setC(e.target.value)
              setSubmitHint(false)
            }}
            className="min-h-10 sm:min-h-11"
            autoComplete="off"
            placeholder={t.third}
          />
        </div>
      </div>

      <Button type="button" className="min-h-10 w-full text-sm sm:min-h-11 sm:text-base" onClick={check}>
        {t.done}
      </Button>
      <p
        className={`text-destructive text-center text-sm ${submitHint ? "" : "invisible"}`}
      >
        {t.hint}
      </p>
    </div>
  )
}
