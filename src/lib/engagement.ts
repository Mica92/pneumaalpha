// Engagement scaffolding for the chat surface.
// Bilingual topics, daily dilemmas, root questions and per-topic
// continuation suggestions. Static for now — can be replaced by
// model-generated suggestions later.

import type { Language } from "@/lib/i18n";

export type TopicId = "work" | "love" | "fear" | "purpose" | "adventure" | "growth";

export type Topic = {
  id: TopicId;
  emoji: string;
  label: { es: string; en: string };
  prompt: { es: string; en: string };
};

export const TOPICS: Topic[] = [
  {
    id: "work",
    emoji: "◇",
    label: { es: "Trabajo", en: "Work" },
    prompt: {
      es: "Hablemos sobre el trabajo y lo que hago con mis días.",
      en: "Let's talk about work and what I do with my days.",
    },
  },
  {
    id: "love",
    emoji: "○",
    label: { es: "Amor", en: "Love" },
    prompt: {
      es: "Hablemos del amor: lo que busco, lo que temo, lo que sostengo.",
      en: "Let's talk about love: what I seek, what I fear, what I sustain.",
    },
  },
  {
    id: "fear",
    emoji: "△",
    label: { es: "Miedo", en: "Fear" },
    prompt: {
      es: "Quiero hablar de un miedo que me acompaña últimamente.",
      en: "I want to talk about a fear that's been with me lately.",
    },
  },
  {
    id: "purpose",
    emoji: "◎",
    label: { es: "Propósito", en: "Purpose" },
    prompt: {
      es: "Hablemos sobre el propósito y si tiene sentido buscarlo.",
      en: "Let's talk about purpose and whether it makes sense to look for it.",
    },
  },
  {
    id: "adventure",
    emoji: "—",
    label: { es: "Aventura", en: "Adventure" },
    prompt: {
      es: "Hablemos de la aventura y del riesgo en mi vida.",
      en: "Let's talk about adventure and risk in my life.",
    },
  },
  {
    id: "growth",
    emoji: "⌇",
    label: { es: "Crecimiento", en: "Growth" },
    prompt: {
      es: "Hablemos de cómo se crece de verdad, sin engañarse.",
      en: "Let's talk about how one truly grows, without self-deception.",
    },
  },
];

// Continuation chips per topic — three short follow-ups.
const CONTINUATIONS: Record<TopicId, { es: string[]; en: string[] }> = {
  work: {
    es: [
      "¿Cómo salgo de esta frustración?",
      "Dame un ejemplo de alguien que lo superó.",
      "¿Qué crítica le harías a tu propio consejo?",
    ],
    en: [
      "How do I get out of this frustration?",
      "Give me an example of someone who overcame this.",
      "What critique would you make of your own advice?",
    ],
  },
  love: {
    es: [
      "¿Cómo distingo amor de costumbre?",
      "¿Qué harías tú en mi lugar?",
      "Dame una pregunta incómoda que deba hacerme.",
    ],
    en: [
      "How do I tell love apart from habit?",
      "What would you do in my place?",
      "Give me an uncomfortable question I should ask myself.",
    ],
  },
  fear: {
    es: [
      "¿Y si el miedo tiene razón?",
      "¿Cómo se atraviesa sin negarlo?",
      "Dime algo que me sorprenda sobre este miedo.",
    ],
    en: [
      "What if the fear is right?",
      "How do I move through it without denying it?",
      "Tell me something surprising about this fear.",
    ],
  },
  purpose: {
    es: [
      "¿Y si no hay un propósito que descubrir?",
      "¿Cómo distingo vocación de capricho?",
      "Dame un paso pequeño para hoy.",
    ],
    en: [
      "What if there's no purpose to discover?",
      "How do I tell vocation from whim?",
      "Give me one small step for today.",
    ],
  },
  adventure: {
    es: [
      "¿Cómo sé si es valentía o huida?",
      "¿Qué pierdo si no me arriesgo?",
      "Dame un ejemplo concreto de buena aventura.",
    ],
    en: [
      "How do I know if it's courage or flight?",
      "What do I lose if I don't take the risk?",
      "Give me a concrete example of good adventure.",
    ],
  },
  growth: {
    es: [
      "¿Estoy creciendo o sólo ocupado?",
      "¿Qué hábito debería abandonar?",
      "Dame una idea que me incomode.",
    ],
    en: [
      "Am I growing or just busy?",
      "What habit should I abandon?",
      "Give me an idea that makes me uncomfortable.",
    ],
  },
};

const DEFAULT_CONTINUATIONS = {
  es: [
    "¿Puedes profundizar en eso?",
    "Dame un ejemplo concreto.",
    "¿Qué pregunta debería hacerme yo?",
  ],
  en: [
    "Can you go deeper on that?",
    "Give me a concrete example.",
    "What question should I be asking myself?",
  ],
};

export function getContinuations(topic: TopicId | null, lang: Language): string[] {
  if (!topic) return DEFAULT_CONTINUATIONS[lang];
  return CONTINUATIONS[topic][lang];
}

// Six universal self-help "root questions".
export const ROOT_QUESTIONS: { es: string; en: string }[] = [
  { es: "¿Por qué me siento así?", en: "Why do I feel this way?" },
  { es: "¿Qué harías tú en mi lugar?", en: "What would you do in my place?" },
  { es: "¿Estoy viviendo con autenticidad?", en: "Am I living authentically?" },
  { es: "¿Cómo vería esto un estoico?", en: "How would a Stoic see this?" },
  { es: "¿Qué es una buena vida para ti?", en: "What is a good life, for you?" },
  {
    es: "Dame una idea que me sorprenda sobre mi situación.",
    en: "Give me an idea that surprises me about my situation.",
  },
];

// Rotating daily dilemmas.
const DILEMMAS: { es: string; en: string }[] = [
  { es: "¿Hago lo que debo o lo que deseo?", en: "Do I do what I must, or what I desire?" },
  { es: "¿Perdono o me alejo?", en: "Do I forgive, or do I walk away?" },
  { es: "¿Estoy creciendo o sólo ocupado?", en: "Am I growing, or just busy?" },
  {
    es: "¿El éxito me hace feliz o sólo me distrae?",
    en: "Does success make me happy, or only distract me?",
  },
  {
    es: "¿Hablo por convicción o por miedo al silencio?",
    en: "Do I speak from conviction, or from fear of silence?",
  },
  {
    es: "¿Estoy eligiendo mi vida, o sólo reaccionando?",
    en: "Am I choosing my life, or only reacting?",
  },
  { es: "¿Qué parte de mí estoy postergando?", en: "What part of myself am I postponing?" },
];

export function getDailyDilemma(lang: Language, date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const day = Math.floor(diff / 86400000);
  const d = DILEMMAS[day % DILEMMAS.length];
  return d[lang];
}

export function getDailyDilemmaPrompt(lang: Language, date = new Date()): string {
  const q = getDailyDilemma(lang, date);
  return lang === "es"
    ? `Quiero conversar sobre el dilema de hoy: ${q}`
    : `I'd like to talk about today's dilemma: ${q}`;
}
