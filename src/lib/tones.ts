export type ToneId =
  | "analitico"
  | "poetico"
  | "mando"
  | "pragmatico"
  | "estoico"
  | "socratico"
  | "compasivo"
  | "provocador";

type L = { es: string; en: string };

export type Tone = {
  id: ToneId;
  label: L;
  hint: L;
  directive: L;
};

export const TONES: Tone[] = [
  {
    id: "analitico",
    label: { es: "Analítico", en: "Analytical" },
    hint: { es: "Argumentos, distinciones, precisión.", en: "Arguments, distinctions, precision." },
    directive: {
      es: "Habla de forma analítica: distingue conceptos, nombra el supuesto oculto y razona paso a paso, con precisión y sin adornos.",
      en: "Speak analytically: distinguish concepts, name the hidden assumption, and reason step by step with precision and no ornament.",
    },
  },
  {
    id: "poetico",
    label: { es: "Poético", en: "Poetic" },
    hint: { es: "Imagen, metáfora, ritmo.", en: "Image, metaphor, rhythm." },
    directive: {
      es: "Habla con registro poético: una imagen concreta por respuesta, ritmo cuidado, frases con aire. Nunca vaguedad decorativa.",
      en: "Speak in a poetic register: one concrete image per reply, careful rhythm, sentences with air. Never decorative vagueness.",
    },
  },
  {
    id: "mando",
    label: { es: "De mando", en: "Commanding" },
    hint: { es: "Directo, imperativo, sin rodeos.", en: "Direct, imperative, no detours." },
    directive: {
      es: "Habla en tono de mando: imperativo, breve, sin rodeos ni matices defensivos. Di qué hacer y por qué, con autoridad serena.",
      en: "Speak in a commanding tone: imperative, brief, no hedging. Say what to do and why, with calm authority.",
    },
  },
  {
    id: "pragmatico",
    label: { es: "Pragmático", en: "Pragmatic" },
    hint: { es: "Pasos concretos y aplicables.", en: "Concrete, applicable steps." },
    directive: {
      es: "Habla de forma pragmática: aterriza la idea en algo que la persona pueda hacer o probar esta semana. Concreto, útil, sin listas.",
      en: "Speak pragmatically: land the idea in something the person can do or test this week. Concrete, useful, no lists.",
    },
  },
  {
    id: "estoico",
    label: { es: "Estoico", en: "Stoic" },
    hint: { es: "Sobriedad, aceptación, disciplina.", en: "Sobriety, acceptance, discipline." },
    directive: {
      es: "Habla con sobriedad estoica: separa lo que depende de la persona de lo que no, sin dramatismo ni consuelo fácil.",
      en: "Speak with stoic sobriety: separate what depends on the person from what does not, without drama or easy comfort.",
    },
  },
  {
    id: "socratico",
    label: { es: "Socrático", en: "Socratic" },
    hint: { es: "Casi solo preguntas.", en: "Almost only questions." },
    directive: {
      es: "Habla al modo socrático: afirma lo mínimo y avanza preguntando, para que la persona descubra su propio supuesto.",
      en: "Speak Socratically: assert the minimum and advance by asking, so the person uncovers their own assumption.",
    },
  },
  {
    id: "compasivo",
    label: { es: "Compasivo", en: "Compassionate" },
    hint: { es: "Cercano, cuidadoso.", en: "Close, careful." },
    directive: {
      es: "Habla con cercanía y cuidado: reconoce lo que pesa antes de pensar con la persona. Cálido, nunca condescendiente.",
      en: "Speak with closeness and care: acknowledge what weighs before thinking alongside the person. Warm, never condescending.",
    },
  },
  {
    id: "provocador",
    label: { es: "Provocador", en: "Provocative" },
    hint: { es: "Incomoda para hacer pensar.", en: "Unsettles to make you think." },
    directive: {
      es: "Habla de forma provocadora: cuestiona la premisa de la persona, incomoda con elegancia. Nunca insultes ni humilles.",
      en: "Speak provocatively: challenge the person's premise, unsettle with elegance. Never insult or humiliate.",
    },
  },
];

const TONE_MAP = new Map(TONES.map((t) => [t.id, t]));

export function isToneId(value: unknown): value is ToneId {
  return typeof value === "string" && TONE_MAP.has(value as ToneId);
}

export function getTone(id: ToneId): Tone {
  return TONE_MAP.get(id)!;
}

export function toneDirective(id: string | undefined, lang: "es" | "en"): string | null {
  if (!isToneId(id)) return null;
  const tone = getTone(id);
  const header =
    lang === "en"
      ? "═══ THE PERSON'S PREFERRED REGISTER ═══"
      : "═══ REGISTRO PREFERIDO POR LA PERSONA ═══";
  const footer =
    lang === "en"
      ? "Adapt the register, never your identity: your convictions, temperament and closing counter-question stay intact."
      : "Adapta el registro, nunca tu identidad: tus convicciones, tu temperamento y tu contrapregunta final se mantienen intactos.";
  return `${header}\n${tone.directive[lang]}\n${footer}`;
}

const STORAGE_KEY = "pneuma.tone";

export function loadStoredTone(): ToneId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isToneId(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function storeTone(id: ToneId | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
