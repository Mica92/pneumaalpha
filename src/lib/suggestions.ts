// Ice-breaker suggestions for an empty chat, derived from each mind's
// own expertise so they are concrete instead of generic.

import { PHILOSOPHERS, type PhilosopherId } from "@/lib/philosophers";
import { profileOf } from "@/lib/portraits";

export type Language = "es" | "en";

const FRAMES: Record<Language, ((name: string, topic: string) => string)[]> = {
  es: [
    (name, topic) => `${name}, ¿qué es para ti ${lower(topic)}?`,
    (_n, topic) => `Explícame ${lower(topic)} como si nunca hubiera leído filosofía.`,
    (_n, topic) => `¿Qué tiene que ver ${lower(topic)} con mi vida diaria?`,
    (_n, topic) => `¿En qué te equivocaste al pensar ${lower(topic)}?`,
  ],
  en: [
    (name, topic) => `${name}, what is ${lower(topic)} to you?`,
    (_n, topic) => `Explain ${lower(topic)} as if I'd never read philosophy.`,
    (_n, topic) => `What does ${lower(topic)} have to do with my daily life?`,
    (_n, topic) => `Where were you wrong about ${lower(topic)}?`,
  ],
};

function lower(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Three or four concrete opening questions for a given mind. */
export function suggestionsFor(id: PhilosopherId, lang: Language): string[] {
  const name = PHILOSOPHERS[id]?.name ?? "";
  const expertise = profileOf(id)?.expertise ?? [];
  if (expertise.length === 0) {
    return lang === "es"
      ? [`${name}, ¿por dónde empezarías a pensar mi vida?`]
      : [`${name}, where would you start thinking about my life?`];
  }
  const frames = FRAMES[lang];
  const picks = expertise.slice(0, 4);
  return picks.map((topic, i) => frames[i % frames.length](name, topic[lang]));
}
