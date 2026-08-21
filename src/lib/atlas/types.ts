// Atlas — modelo de conocimiento escalable para los mapas de PneumAlpha.
// Entidades tipadas + relaciones etiquetadas. Bilingüe. Preparado para crecer
// a cientos de pensadores y miles de aristas sin tocar la UI.

import type { LocalizedString, PhilosopherId } from "@/lib/philosophers";

export type Lang = "es" | "en";

export type EntityKind = "domain" | "philosopher" | "concept" | "school" | "question" | "self";

export type RelationKind =
  | "influenced"
  | "opposedTo"
  | "developed"
  | "criticized"
  | "respondedTo"
  | "belongsTo"
  | "explores"
  | "relatedTo";

export type AtlasEntity = {
  id: string;
  kind: EntityKind;
  label: LocalizedString;
  /** Descripción breve y accesible. */
  note: LocalizedString;
  era?: string;
  /** Mente viva con la que se puede conversar. */
  chat?: PhilosopherId;
  /** Temas cortos, para chips en el panel. */
  themes?: LocalizedString;
};

export type AtlasRelation = {
  source: string;
  target: string;
  kind: RelationKind;
};

export const KIND_LABEL: Record<EntityKind, LocalizedString> = {
  domain: { es: "Dominio", en: "Domain" },
  philosopher: { es: "Filósofo", en: "Philosopher" },
  concept: { es: "Concepto", en: "Concept" },
  school: { es: "Escuela", en: "School" },
  question: { es: "Pregunta", en: "Question" },
  self: { es: "Tú", en: "You" },
};

export const RELATION_LABEL: Record<RelationKind, LocalizedString> = {
  influenced: { es: "influye en", en: "influences" },
  opposedTo: { es: "se opone a", en: "opposes" },
  developed: { es: "desarrolla", en: "develops" },
  criticized: { es: "critica", en: "criticizes" },
  respondedTo: { es: "responde a", en: "responds to" },
  belongsTo: { es: "pertenece a", en: "belongs to" },
  explores: { es: "explora", en: "explores" },
  relatedTo: { es: "se relaciona con", en: "relates to" },
};

export const RELATION_NOTE: Record<RelationKind, LocalizedString> = {
  influenced: {
    es: "Una parte de este pensamiento se formó leyendo, discutiendo o heredando al otro.",
    en: "Part of this thought took shape reading, arguing with or inheriting the other.",
  },
  opposedTo: {
    es: "Dos respuestas incompatibles a una misma pregunta: el desacuerdo es lo interesante.",
    en: "Two incompatible answers to the same question: the disagreement is the interesting part.",
  },
  developed: {
    es: "Aquí una idea se lleva más lejos de donde estaba.",
    en: "Here an idea is carried further than it stood before.",
  },
  criticized: {
    es: "Un pensamiento examinado desde dentro hasta mostrar sus límites.",
    en: "A thought examined from within until its limits show.",
  },
  respondedTo: {
    es: "Una réplica: se piensa contra alguien y, al hacerlo, con alguien.",
    en: "A reply: thinking against someone and, in doing so, with them.",
  },
  belongsTo: {
    es: "Forma parte de una tradición más amplia que le da lenguaje y problemas.",
    en: "It belongs to a wider tradition that lends it language and problems.",
  },
  explores: {
    es: "Este camino se adentra en la otra idea.",
    en: "This path leads into the other idea.",
  },
  relatedTo: {
    es: "Se tocan: comparten territorio, aunque lleguen por caminos distintos.",
    en: "They touch: shared territory reached by different roads.",
  },
};
