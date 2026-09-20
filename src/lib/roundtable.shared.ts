// Shared, client-safe helpers for the Mesa Redonda (round table) mode.
// Kept out of *.functions.ts so server-function splitting stays safe.

import { PHILOSOPHERS, buildSystemPrompt, type PhilosopherId } from "@/lib/philosophers";

export type Language = "es" | "en";

export type RoundtableTurn = {
  philosopher: PhilosopherId;
  text: string;
};

export const MAX_SEATS = 4;

const TABLE_RULES: Record<Language, string> = {
  es: `═══ MESA REDONDA ═══
Estás sentado en una mesa con otros pensadores, convocados por una persona que ha traído un tema.
— Hablas SOLO por ti. Nunca escribas la intervención de otro ni narres la escena.
— Si alguien ya habló antes que tú en esta ronda, respóndele por su nombre al menos una vez: dale la razón, matiza o contradícelo con franqueza.
— Máximo 120 palabras. Dos párrafos cortos como mucho.
— No saludes ni te presentes. Entra directo a la idea.
— Cierra con una frase que empuje la discusión (puede ser una pregunta a otro pensador o a quien convocó la mesa).`,
  en: `═══ ROUND TABLE ═══
You are seated at a table with other thinkers, convened by a person who brought a topic.
— You speak ONLY for yourself. Never write another thinker's turn and never narrate the scene.
— If someone already spoke before you in this round, address them by name at least once: agree, qualify, or contradict them plainly.
— Max 120 words. Two short paragraphs at most.
— No greetings, no introductions. Go straight to the idea.
— Close with a line that pushes the discussion forward (a question to another thinker or to the person who convened the table).`,
};

export function seatSystemPrompt(id: PhilosopherId, lang: Language): string {
  return `${buildSystemPrompt(id, [], lang)}\n\n${TABLE_RULES[lang]}`;
}

export function seatUserPrompt(
  topic: string,
  priorTurns: RoundtableTurn[],
  lang: Language,
): string {
  const transcript = priorTurns
    .map((t) => `${PHILOSOPHERS[t.philosopher].name}: ${t.text}`)
    .join("\n\n");

  if (lang === "en") {
    return `Topic brought to the table:\n"""\n${topic}\n"""\n\n${
      transcript
        ? `What has been said so far:\n\n${transcript}\n\nNow it is your turn.`
        : "You open the table. Say your piece."
    }`;
  }
  return `Tema traído a la mesa:\n"""\n${topic}\n"""\n\n${
    transcript
      ? `Lo dicho hasta ahora:\n\n${transcript}\n\nAhora es tu turno.`
      : "Tú abres la mesa. Di lo tuyo."
  }`;
}

export function synthesisPrompt(
  topic: string,
  turns: RoundtableTurn[],
  lang: Language,
): { system: string; prompt: string } {
  const transcript = turns
    .map((t) => `${PHILOSOPHERS[t.philosopher].name}: ${t.text}`)
    .join("\n\n");

  const system =
    lang === "en"
      ? `You are a sober moderator. You add no doctrine of your own. In four short paragraphs, plain language, no lists, no markdown, max 200 words in total, you write:
1) where these perspectives agree;
2) where they genuinely contradict each other;
3) the different assumption underneath that disagreement, and the central tension it leaves;
4) the question that stays open for the person who brought the topic.`
      : `Eres un moderador sobrio. No añades doctrina propia. En cuatro párrafos breves, lenguaje llano, sin listas, sin markdown, máximo 200 palabras en total, escribes:
1) en qué coinciden estas perspectivas;
2) en qué se contradicen de verdad;
3) qué supuesto distinto hay debajo de ese desacuerdo y qué tensión central deja;
4) la pregunta que queda abierta para quien trajo el tema.`;

  const prompt =
    lang === "en"
      ? `Topic:\n${topic}\n\nTranscript:\n\n${transcript}\n\nWrite the closing synthesis.`
      : `Tema:\n${topic}\n\nTranscripción:\n\n${transcript}\n\nEscribe la síntesis de cierre.`;

  return { system, prompt };
}
