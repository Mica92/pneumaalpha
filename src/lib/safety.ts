// Safety layer: runs before any philosophical routing.
// Pure, client-safe module — no server imports.

export type SafetyKind = "crisis" | "off_domain";

export type CrisisResource = {
  country: string;
  name: { es: string; en: string };
  contact: string;
  note: { es: string; en: string };
};

/** Resources are configuration, never embedded in model prompts. */
export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    country: "CL",
    name: {
      es: "Línea de Prevención del Suicidio (Salud Responde)",
      en: "Suicide Prevention Line (Salud Responde), Chile",
    },
    contact: "*4141 · 600 360 7777",
    note: {
      es: "Gratuita, 24 horas, todos los días.",
      en: "Free, 24 hours, every day.",
    },
  },
  {
    country: "INTL",
    name: {
      es: "Directorio internacional de líneas de ayuda",
      en: "International helpline directory",
    },
    contact: "findahelpline.com",
    note: {
      es: "Busca una línea de ayuda en tu país.",
      en: "Find a helpline in your country.",
    },
  },
];

const RISK_PATTERNS = [
  /\bsuicid/i,
  /quiero\s+(morir|desaparecer)/i,
  /\bmatarme\b/i,
  /quitarme\s+la\s+vida/i,
  /acabar\s+con\s+mi\s+vida/i,
  /no\s+quiero\s+(seguir\s+)?(vivir|existir)/i,
  /(hacerme|haciéndome)\s+daño/i,
  /\bautolesi/i,
  /kill\s+myself/i,
  /end\s+my\s+life/i,
  /want\s+to\s+die/i,
  /\bself[-\s]?harm/i,
];

/** Academic/literary framings that should not trigger the crisis card. */
const RISK_EXEMPTIONS =
  /(camus|s[ií]sifo|sisyphus|s[ée]neca|hume|d[uú]rkheim|ensayo|tesis|novela|literatura|el?\s+concepto\s+de|filos[oó]ficamente|argumento\s+de)/i;

const OFF_DOMAIN_PATTERNS = [
  /escrib(e|eme|ir)\s+(un\s+)?(c[oó]digo|script|programa|funci[oó]n)/i,
  /\bwrite\s+(me\s+)?(some\s+)?code\b/i,
  /(resuelve|calcula)\s+(esta|este|la|el)?\s*(ecuaci[oó]n|integral|derivada|problema\s+de\s+matem)/i,
  /cu[aá]nto\s+es\s+\d/i,
  /(qu[eé]|c[oó]mo\s+est[aá])\s+(el\s+)?(clima|tiempo)\s+(en|hoy)/i,
  /trad[uú]ce(me)?\s+(esto|este|el)/i,
  /(precio|cotizaci[oó]n)\s+(del?\s+)?(bitcoin|d[oó]lar|euro)/i,
  /dame\s+(la\s+)?receta/i,
];

export function detectSafety(text: string): SafetyKind | null {
  const t = (text ?? "").trim();
  if (!t) return null;
  if (RISK_PATTERNS.some((r) => r.test(t)) && !RISK_EXEMPTIONS.test(t)) return "crisis";
  if (OFF_DOMAIN_PATTERNS.some((r) => r.test(t))) return "off_domain";
  return null;
}

/** Directive appended to the system prompt when a conversation shows risk. */
export function crisisDirective(lang: "es" | "en"): string {
  return lang === "es"
    ? `\n\n[CUIDADO — PRIORIDAD ABSOLUTA]
La persona ha expresado algo que puede indicar riesgo para su vida o su integridad.
Deja de lado el personaje filosófico y responde como alguien presente y sobrio:
- Reconoce lo que dijo, sin dramatizar, sin embellecer la desesperanza y sin citas.
- No interpretes, no des consejos, no propongas ejercicios filosóficos.
- Dile con claridad que hay ayuda inmediata y gratuita: en Chile, la Línea de Prevención del Suicidio *4141 o 600 360 7777, 24 horas; en otros países, findahelpline.com.
- Invítala a hablar con alguien de confianza ahora mismo.
- Máximo cinco frases. Sin preguntas retóricas ni contrapregunta final.`
    : `\n\n[CARE — ABSOLUTE PRIORITY]
The person has said something that may indicate risk to their life or safety.
Set the philosophical persona aside and answer as someone present and sober:
- Acknowledge what they said, without drama, without aestheticising despair, without quotes.
- Do not interpret, advise, or propose philosophical exercises.
- State clearly that immediate free help exists: in Chile, the Suicide Prevention Line *4141 or 600 360 7777, 24 hours; elsewhere, findahelpline.com.
- Invite them to talk to someone they trust right now.
- Five sentences maximum. No rhetorical questions, no closing counter-question.`;
}

/** Directive appended when the request is outside what Pneum does. */
export function offDomainDirective(lang: "es" | "en"): string {
  return lang === "es"
    ? `\n\n[LÍMITE DE DOMINIO]
Lo que pide parece estar fuera de lo que hace Pneum (programación, cálculos, datos actuales, traducciones o información general).
Dilo en una frase, sin disculpas largas, y ofrece lo que sí puedes: pensar con la persona el problema o la decisión que hay detrás de esa tarea.`
    : `\n\n[DOMAIN LIMIT]
The request seems outside what Pneum does (programming, calculations, current data, translations or general information).
Say so in one sentence, without long apologies, and offer what you can: thinking through the problem or decision behind that task.`;
}
