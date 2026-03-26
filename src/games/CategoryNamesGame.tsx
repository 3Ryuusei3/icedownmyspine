import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { GameProps } from "@/games/types"
import { useStableRandom } from "@/hooks/use-stable-random"

const PROMPTS = [
  {
    title: "3 frutas",
    instruction: "Nombra 3 frutas.",
  },
  {
    title: "Cosas azules",
    instruction: "Escribe 3 cosas que sean de color azul o lo parezcan.",
  },
  {
    title: "3 animales",
    instruction: "Nombra 3 animales que se te ocurran.",
  },
  {
    title: "En la cocina",
    instruction: "3 cosas que sueles ver en una cocina.",
  },
  {
    title: "3 emociones",
    instruction: "Nombra 3 emociones o sensaciones.",
  },
  {
    title: "Lugares",
    instruction: "3 lugares (reales o imaginarios) donde te gustaría estar.",
  },
  {
    title: "Sonidos",
    instruction: "3 sonidos que conozcas o te gusten.",
  },
  {
    title: "Objetos redondos",
    instruction: "3 objetos que tengan forma más o menos redonda.",
  },
  {
    title: "Verduras o hortalizas",
    instruction: "Nombra 3 verduras u hortalizas.",
  },
  {
    title: "Cosas suaves",
    instruction: "3 cosas que al tacto se noten suaves.",
  },
  {
    title: "Transporte",
    instruction: "3 medios de transporte.",
  },
  {
    title: "Películas o series",
    instruction: "3 películas o series que recuerdes (el título vale).",
  },
] as const

export function CategoryNamesGame({ onWin }: GameProps) {
  const prompt = useStableRandom(
    () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]!,
  )

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
      solutionText: `Categoría: «${prompt.title}». Tus tres: ${a.trim()}, ${b.trim()}, ${c.trim()}.`,
    })
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <p className="text-foreground font-medium">{prompt.instruction}</p>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          No hay respuestas incorrectas: lo importante es nombrar tres cosas.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cat-1">1</Label>
          <Input
            id="cat-1"
            value={a}
            onChange={(e) => {
              setA(e.target.value)
              setSubmitHint(false)
            }}
            className="min-h-11 text-base"
            autoComplete="off"
            placeholder="Primera…"
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
            className="min-h-11 text-base"
            autoComplete="off"
            placeholder="Segunda…"
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
            className="min-h-11 text-base"
            autoComplete="off"
            placeholder="Tercera…"
          />
        </div>
      </div>

      <Button type="button" className="min-h-11 w-full" onClick={check}>
        He puesto tres cosas
      </Button>
      {submitHint ? (
        <p className="text-destructive text-center text-sm">
          Rellena las tres casillas.
        </p>
      ) : null}
    </div>
  )
}
