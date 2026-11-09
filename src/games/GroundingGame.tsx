import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import type { GameProps } from "@/games/types"
import { useLang } from "@/lib/language"

const STEPS = [
  {
    count: 5,
    title: "5 cosas que ves",
    hint: "Mira a tu alrededor y nómbralas en voz baja o escríbelas.",
    placeholders: [
      "Veo…",
      "Veo…",
      "Veo…",
      "Veo…",
      "Veo…",
    ],
    en: {
      title: "5 things you see",
      hint: "Look around you and name them quietly or write them down.",
      placeholders: ["I see…", "I see…", "I see…", "I see…", "I see…"],
    },
  },
  {
    count: 4,
    title: "4 cosas que oyes",
    hint: "Pueden ser lejanas o suaves: el aire, un pájaro, el tráfico…",
    placeholders: ["Oigo…", "Oigo…", "Oigo…", "Oigo…"],
    en: {
      title: "4 things you hear",
      hint: "They can be distant or soft: the air, a bird, traffic…",
      placeholders: ["I hear…", "I hear…", "I hear…", "I hear…"],
    },
  },
  {
    count: 3,
    title: "3 cosas que sientes al tacto",
    hint: "La ropa, el suelo bajo los pies, un objeto cerca de ti…",
    placeholders: ["Siento…", "Siento…", "Siento…"],
    en: {
      title: "3 things you feel by touch",
      hint: "Your clothes, the floor under your feet, an object near you…",
      placeholders: ["I feel…", "I feel…", "I feel…"],
    },
  },
  {
    count: 2,
    title: "2 cosas que hueles",
    hint: "Si no percibes olor, puedes imaginar uno agradable.",
    placeholders: ["Huelo…", "Huelo…"],
    en: {
      title: "2 things you smell",
      hint: "If you can't smell anything, you can imagine a pleasant scent.",
      placeholders: ["I smell…", "I smell…"],
    },
  },
  {
    count: 1,
    title: "1 cosa que saboreas",
    hint: "Un sorbo de agua, el sabor residual en la boca…",
    placeholders: ["Saboreo…"],
    en: {
      title: "1 thing you taste",
      hint: "A sip of water, the lingering taste in your mouth…",
      placeholders: ["I taste…"],
    },
  },
] as const

const COPY = {
  es: {
    finished:
      "Has completado el recorrido 5-4-3-2-1. Estás aquí, en el presente. Puedes quedarte un momento respirando despacio o repetir el ejercicio si te ayuda.",
    repeat: "Repetir grounding",
    next: "Siguiente",
    finish: "Terminar",
  },
  en: {
    finished:
      "You've completed the 5-4-3-2-1 exercise. You're here, in the present. You can stay a moment breathing slowly or repeat the exercise if it helps.",
    repeat: "Repeat grounding",
    next: "Next",
    finish: "Finish",
  },
}

/** No usamos `onWin` para no tapar la pantalla final; solo avisamos con `onComplete`. */
export function GroundingGame({ onComplete }: GameProps) {
  const { lang } = useLang()
  const c = COPY[lang]
  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  const base = STEPS[stepIndex]!
  const step = lang === "en" ? base.en : base
  const progress = done ? 100 : (stepIndex / STEPS.length) * 100

  function fieldId(i: number) {
    return `ground-${stepIndex}-${i}`
  }

  function next() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((s) => s + 1)
    } else {
      setDone(true)
      onComplete?.()
    }
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4 max-sm:gap-2 text-center">
        <Progress value={100} className="h-2" />
        <p className="text-muted-foreground max-sm:text-xs max-sm:leading-snug text-sm leading-relaxed">
          {c.finished}
        </p>
        <Button
          type="button"
          variant="secondary"
          className="min-h-10 w-full text-sm sm:min-h-11 sm:text-base"
          onClick={() => {
            setStepIndex(0)
            setValues({})
            setDone(false)
          }}
        >
          {c.repeat}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-sm:gap-2">
      <Progress value={progress} className="h-2" />
      <div>
        <h3 className="text-base font-medium sm:text-lg">{step.title}</h3>
        <p className="text-muted-foreground mt-1 max-sm:text-xs max-sm:leading-snug text-sm leading-relaxed">
          {step.hint}
        </p>
      </div>
      <div className="flex flex-col gap-3 max-sm:gap-2">
        {step.placeholders.map((ph, i) => (
          <div key={fieldId(i)} className="space-y-1.5">
            <Label htmlFor={fieldId(i)} className="sr-only">
              {ph}
            </Label>
            <Input
              id={fieldId(i)}
              placeholder={ph}
              value={values[fieldId(i)] ?? ""}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  [fieldId(i)]: e.target.value,
                }))
              }
              className="min-h-10 sm:min-h-11"
              autoComplete="off"
            />
          </div>
        ))}
      </div>
      <Button type="button" className="min-h-10 w-full text-sm sm:min-h-11 sm:text-base" onClick={next}>
        {stepIndex < STEPS.length - 1 ? c.next : c.finish}
      </Button>
    </div>
  )
}
