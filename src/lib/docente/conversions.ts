import type { MaterialKind } from "./model";

/** A conversion turns one saved material into a new, linked material of another (or the same) kind. */
export type Conversion = {
  id: string;
  from: MaterialKind[];
  to: MaterialKind;
  label: { es: string; en: string };
  /** Extra instruction appended to the generator prompt (Spanish, model-facing). */
  instruction: string;
};

export const CONVERSIONS: Conversion[] = [
  // From a research session
  { id: "research_to_guide", from: ["research"], to: "guide", label: { es: "Convertir en guía", en: "Turn into a guide" }, instruction: "Convierte la investigación de origen en una guía de estudio: conserva sus distinciones, interpretaciones y referencias; no añadas autores ni afirmaciones que no estén en ella." },
  { id: "concept_card", from: ["research"], to: "guide", label: { es: "Ficha conceptual", en: "Concept card" }, instruction: "Elabora una ficha conceptual breve (una página): definición, distinciones clave, variantes, supuestos, objeción principal y dos preguntas. Pocas secciones y muy precisas." },
  { id: "bibliography_collection", from: ["research"], to: "guide", label: { es: "Colección bibliográfica", en: "Bibliography collection" }, instruction: "Organiza las referencias de la investigación de origen en una bibliografía comentada por tema. Usa solo referencias presentes en el origen; no añadas obras nuevas." },
  // From a guide (or class)
  { id: "to_exam", from: ["guide", "class", "map", "research"], to: "exam", label: { es: "Convertir en examen", en: "Turn into an exam" }, instruction: "Evalúa exactamente los conceptos, autores y argumentos del material de origen; no introduzcas contenidos que no estén en él." },
  { id: "to_map", from: ["guide", "class", "research"], to: "map", label: { es: "Generar mapa conceptual", en: "Generate concept map" }, instruction: "Construye el mapa con los conceptos, autores y relaciones presentes en el material de origen." },
  { id: "to_class", from: ["guide", "exam", "research"], to: "class", label: { es: "Crear planificación de clase", en: "Plan a class" }, instruction: "Planifica una clase que enseñe el contenido del material de origen." },
  { id: "question_bank", from: ["guide", "map", "research"], to: "exam", label: { es: "Extraer preguntas", en: "Extract questions" }, instruction: "Crea un banco amplio de preguntas abiertas de discusión y análisis a partir del material de origen. Sin opciones múltiples." },
  { id: "debate", from: ["guide", "map", "research"], to: "class", label: { es: "Crear debate", en: "Create a debate" }, instruction: "La clase completa es un debate estructurado: posiciones enfrentadas tomadas del material de origen, roles, turnos, preguntas de réplica y criterios de evaluación del debate." },
  { id: "case_analysis", from: ["guide", "research"], to: "guide", label: { es: "Generar análisis de caso", en: "Generate case analysis" }, instruction: "Transforma el material en un análisis de caso aplicado: presenta un caso concreto, identifica supuestos, argumentos en juego, perspectivas y preguntas guiadas." },
  { id: "summary", from: ["guide", "class"], to: "guide", label: { es: "Crear versión resumida", en: "Create a summary" }, instruction: "Genera una versión resumida y breve del material de origen: conserva solo las ideas centrales, definiciones clave y preguntas principales. Pocas secciones." },
  { id: "adapt_discipline", from: ["guide", "exam", "map"], to: "guide", label: { es: "Adaptar a otra disciplina", en: "Adapt to another discipline" }, instruction: "Adapta el material de origen a la carrera o disciplina indicada en el contexto, transformando problemas, ejemplos y marcos conceptuales." },
  // From a map
  { id: "map_to_guide", from: ["map"], to: "guide", label: { es: "Convertir en guía", en: "Turn into a guide" }, instruction: "Escribe una guía que explique los nodos del mapa de origen y el sentido de cada relación entre ellos." },
  { id: "authors_confrontation", from: ["map"], to: "guide", label: { es: "Confrontación entre autores", en: "Authors confrontation" }, instruction: "Construye una confrontación entre los autores del mapa de origen: tesis de cada uno, puntos de acuerdo y desacuerdo, objeciones mutuas y preguntas abiertas." },
  { id: "explain_connections", from: ["map"], to: "guide", label: { es: "Explicar las conexiones", en: "Explain connections" }, instruction: "Explica una por una las conexiones del mapa de origen: por qué se relacionan esos nodos y qué tipo de relación es. Señala las relaciones discutibles." },
  { id: "map_to_class", from: ["map"], to: "class", label: { es: "Construir una clase", en: "Build a class" }, instruction: "Planifica una clase que recorra las ramas del mapa de origen." },
  // From an exam
  { id: "review_guide", from: ["exam"], to: "guide", label: { es: "Generar guía de repaso", en: "Generate review guide" }, instruction: "Escribe una guía de repaso que prepare para los contenidos evaluados en el examen de origen, sin revelar las respuestas ni la pauta." },
  { id: "exam_map", from: ["exam"], to: "map", label: { es: "Mapa de conceptos evaluados", en: "Map of assessed concepts" }, instruction: "Construye el mapa con los conceptos y autores evaluados en el examen de origen." },
  { id: "exam_variants", from: ["exam"], to: "exam", label: { es: "Producir variantes de ejercicios", en: "Produce exercise variants" }, instruction: "Crea ejercicios equivalentes a los del examen de origen (mismas competencias y dificultad) con casos, textos y formulaciones distintas." },
  { id: "formative", from: ["exam"], to: "class", label: { es: "Actividad formativa de preparación", en: "Formative prep activity" }, instruction: "Diseña una actividad formativa que prepare para el examen de origen sin revelar sus preguntas ni respuestas." },
];

/** Conversions run from inside an editor (not listed in "Convert into…"), kept here so labels and validation stay in one place. */
export const EDITOR_CONVERSIONS: Conversion[] = [
  { id: "map_discipline", from: ["map"], to: "map", label: { es: "Enfoque disciplinar", en: "Discipline focus" }, instruction: "Conserva el mapa de origen y añade relaciones propias de la disciplina indicada." },
  { id: "base_map", from: ["map"], to: "map", label: { es: "Mapa base de Kionas", en: "Kionas base map" }, instruction: "" },
];

export function conversionsFor(kind: MaterialKind): Conversion[] {
  return CONVERSIONS.filter((c) => c.from.includes(kind));
}

export function getConversion(id: string | null | undefined): Conversion | null {
  return CONVERSIONS.find((c) => c.id === id) ?? EDITOR_CONVERSIONS.find((c) => c.id === id) ?? null;
}

/** Valid only when it exists, accepts the source kind and produces the requested kind. */
export function resolveConversion(id: string | null | undefined, sourceKind: MaterialKind, targetKind: MaterialKind): Conversion | null {
  const c = getConversion(id);
  return c && c.from.includes(sourceKind) && c.to === targetKind ? c : null;
}

export const CREATE_ROUTE: Record<MaterialKind, "/docente/guias/nueva" | "/docente/examenes/nuevo" | "/docente/mapas/nuevo" | "/docente/clases/nueva" | "/docente/investigar"> = {
  research: "/docente/investigar",
  guide: "/docente/guias/nueva",
  exam: "/docente/examenes/nuevo",
  map: "/docente/mapas/nuevo",
  class: "/docente/clases/nueva",
};

/** The derivative is outdated when the source was edited after the derivative last synced with it. */
export function isSourceNewer(sourceUpdatedAt: string, syncedAt: string | null): boolean {
  if (!syncedAt) return false;
  return new Date(sourceUpdatedAt).getTime() - new Date(syncedAt).getTime() > 1000;
}
