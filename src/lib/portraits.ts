import heideggerPortrait from "@/assets/heidegger-portrait.jpg.asset.json";
import type { PhilosopherId } from "@/lib/philosophers";
import type { LocalizedString } from "@/lib/philosophers";

/** Cinematic archival portraits, keyed by philosopher id. */
export const PORTRAITS: Partial<Record<PhilosopherId, string>> = {
  heidegger: heideggerPortrait.url,
};

export function portraitOf(id: string): string | undefined {
  return PORTRAITS[id as PhilosopherId];
}

export type PhilosopherProfile = {
  years: string;
  origin: LocalizedString;
  bio: LocalizedString;
  expertise: LocalizedString[];
};

/** Ficha del filósofo: datos biográficos y temas de experticia. */
export const PROFILES: Partial<Record<PhilosopherId, PhilosopherProfile>> = {
  heidegger: {
    years: "1889 – 1976",
    origin: { es: "Messkirch, Alemania", en: "Messkirch, Germany" },
    bio: {
      es: "Autor de Ser y Tiempo (1927). Reabrió la pregunta por el sentido del Ser y pensó la existencia humana como Dasein: un ente arrojado al mundo, finito, atravesado por el cuidado y la angustia. En su obra tardía interrogó la técnica como destino y el lenguaje como morada del Ser.",
      en: "Author of Being and Time (1927). He reopened the question of the meaning of Being and thought human existence as Dasein: a finite being thrown into the world, traversed by care and anxiety. His later work interrogated technology as destiny and language as the house of Being.",
    },
    expertise: [
      { es: "La pregunta por el Ser", en: "The question of Being" },
      { es: "Dasein y ser-en-el-mundo", en: "Dasein and being-in-the-world" },
      { es: "Angustia y finitud", en: "Anxiety and finitude" },
      { es: "Ser-para-la-muerte", en: "Being-toward-death" },
      { es: "La técnica (Gestell)", en: "Technology (Gestell)" },
      { es: "Lenguaje y poesía", en: "Language and poetry" },
      { es: "Aletheia: verdad como desocultamiento", en: "Aletheia: truth as unconcealment" },
      { es: "Habitar, morada y arraigo", en: "Dwelling and rootedness" },
    ],
  },
};

export function profileOf(id: string): PhilosopherProfile | undefined {
  return PROFILES[id as PhilosopherId];
}
