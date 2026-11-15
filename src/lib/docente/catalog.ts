import type { EpistemicKind, Lang, NodeKind, QuestionType, Relation } from "./model";

type L = { es: string; en: string };

export type DisciplineFamily = { id: string; label: L; items: L[] };

/** Extensible discipline catalog. Teachers can also type a custom career or subject. */
export const DISCIPLINE_FAMILIES: DisciplineFamily[] = [
  {
    id: "humanities",
    label: { es: "Humanidades y ciencias sociales", en: "Humanities and social sciences" },
    items: [
      { es: "Filosofía", en: "Philosophy" },
      { es: "Historia", en: "History" },
      { es: "Sociología", en: "Sociology" },
      { es: "Ciencia Política", en: "Political Science" },
      { es: "Periodismo", en: "Journalism" },
      { es: "Psicología", en: "Psychology" },
      { es: "Antropología", en: "Anthropology" },
      { es: "Literatura", en: "Literature" },
      { es: "Educación", en: "Education" },
      { es: "Relaciones Internacionales", en: "International Relations" },
      { es: "Trabajo Social", en: "Social Work" },
    ],
  },
  {
    id: "sciences",
    label: { es: "Ciencias naturales y exactas", en: "Natural and exact sciences" },
    items: [
      { es: "Biología", en: "Biology" },
      { es: "Física", en: "Physics" },
      { es: "Química", en: "Chemistry" },
      { es: "Matemáticas", en: "Mathematics" },
      { es: "Bioquímica", en: "Biochemistry" },
      { es: "Biotecnología", en: "Biotechnology" },
      { es: "Neurociencia", en: "Neuroscience" },
      { es: "Astronomía", en: "Astronomy" },
      { es: "Geología", en: "Geology" },
      { es: "Estadística", en: "Statistics" },
    ],
  },
  {
    id: "engineering",
    label: { es: "Ingenierías y tecnología", en: "Engineering and technology" },
    items: [
      { es: "Ingeniería Industrial", en: "Industrial Engineering" },
      { es: "Ingeniería Civil", en: "Civil Engineering" },
      { es: "Ingeniería Informática", en: "Computer Engineering" },
      { es: "Ingeniería Mecánica", en: "Mechanical Engineering" },
      { es: "Ingeniería Eléctrica", en: "Electrical Engineering" },
      { es: "Ingeniería Química", en: "Chemical Engineering" },
      { es: "Ingeniería Ambiental", en: "Environmental Engineering" },
      { es: "Ciencia de Datos", en: "Data Science" },
      { es: "Inteligencia Artificial", en: "Artificial Intelligence" },
    ],
  },
  {
    id: "health",
    label: { es: "Salud", en: "Health" },
    items: [
      { es: "Medicina", en: "Medicine" },
      { es: "Enfermería", en: "Nursing" },
      { es: "Salud Pública", en: "Public Health" },
      { es: "Odontología", en: "Dentistry" },
      { es: "Farmacia", en: "Pharmacy" },
      { es: "Nutrición", en: "Nutrition" },
      { es: "Kinesiología", en: "Physiotherapy" },
      { es: "Fonoaudiología", en: "Speech Therapy" },
    ],
  },
  {
    id: "law_business",
    label: { es: "Derecho, economía y negocios", en: "Law, economics and business" },
    items: [
      { es: "Derecho", en: "Law" },
      { es: "Economía", en: "Economics" },
      { es: "Administración", en: "Business Administration" },
      { es: "Finanzas", en: "Finance" },
      { es: "Contabilidad", en: "Accounting" },
      { es: "Marketing", en: "Marketing" },
      { es: "Comercio Internacional", en: "International Trade" },
    ],
  },
  {
    id: "arts",
    label: { es: "Artes, diseño y arquitectura", en: "Arts, design and architecture" },
    items: [
      { es: "Arquitectura", en: "Architecture" },
      { es: "Diseño", en: "Design" },
      { es: "Artes Visuales", en: "Visual Arts" },
      { es: "Música", en: "Music" },
      { es: "Cine", en: "Film" },
      { es: "Teatro", en: "Theatre" },
    ],
  },
  {
    id: "environment",
    label: { es: "Agricultura y medioambiente", en: "Agriculture and environment" },
    items: [
      { es: "Agronomía", en: "Agronomy" },
      { es: "Medicina Veterinaria", en: "Veterinary Medicine" },
      { es: "Ingeniería Forestal", en: "Forestry" },
      { es: "Ecología", en: "Ecology" },
      { es: "Ciencias Ambientales", en: "Environmental Sciences" },
    ],
  },
];

export function searchDisciplines(query: string, lang: Lang): { family: string; name: string }[] {
  const q = fold(query);
  const out: { family: string; name: string }[] = [];
  for (const f of DISCIPLINE_FAMILIES) {
    for (const it of f.items) {
      if (!q || fold(it.es).includes(q) || fold(it.en).includes(q)) out.push({ family: f.label[lang], name: it[lang] });
    }
  }
  return out;
}

function fold(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export const LEVELS: { id: string; label: L }[] = [
  { id: "intro", label: { es: "Primer año", en: "First year" } },
  { id: "undergrad", label: { es: "Pregrado", en: "Undergraduate" } },
  { id: "advanced", label: { es: "Pregrado avanzado", en: "Advanced undergraduate" } },
  { id: "postgrad", label: { es: "Postgrado", en: "Postgraduate" } },
];

/** The 21 possible parts of an academic guide. Templates pick a subset. */
export const GUIDE_SECTIONS: { key: string; label: L }[] = [
  { key: "introduction", label: { es: "Introducción al problema", en: "Introduction to the problem" } },
  { key: "objectives", label: { es: "Objetivos de aprendizaje", en: "Learning objectives" } },
  { key: "essential_question", label: { es: "Pregunta esencial", en: "Essential question" } },
  { key: "etymology", label: { es: "Etimología del concepto", en: "Etymology of the concept" } },
  { key: "ontology", label: { es: "Ontología y análisis conceptual", en: "Ontology and conceptual analysis" } },
  { key: "distinctions", label: { es: "Distinciones y conceptos relacionados", en: "Distinctions and related concepts" } },
  { key: "history", label: { es: "Historia intelectual del concepto", en: "Intellectual history of the concept" } },
  { key: "interpretations", label: { es: "Principales interpretaciones filosóficas", en: "Main philosophical interpretations" } },
  { key: "authors", label: { es: "Autores, escuelas y argumentos", en: "Authors, schools and arguments" } },
  { key: "confrontations", label: { es: "Confrontaciones entre perspectivas", en: "Confrontations between perspectives" } },
  { key: "discipline_link", label: { es: "Relación con la disciplina", en: "Link to the discipline" } },
  { key: "discipline_theories", label: { es: "Teorías y problemas de la disciplina", en: "Theories and problems of the discipline" } },
  { key: "cases", label: { es: "Casos prácticos", en: "Practical cases" } },
  { key: "socratic", label: { es: "Preguntas socráticas", en: "Socratic questions" } },
  { key: "argument_exercises", label: { es: "Ejercicios argumentativos", en: "Argumentation exercises" } },
  { key: "reflection", label: { es: "Actividades de reflexión", en: "Reflection activities" } },
  { key: "debate", label: { es: "Propuestas de debate", en: "Debate proposals" } },
  { key: "assessment", label: { es: "Preguntas de evaluación", en: "Assessment questions" } },
  { key: "synthesis", label: { es: "Síntesis y conclusiones abiertas", en: "Synthesis and open conclusions" } },
  { key: "bibliography", label: { es: "Bibliografía y lecturas complementarias", en: "Bibliography and further reading" } },
];

export type GuideTemplate = { id: string; label: L; description: L; sections: string[]; words: number };

export const GUIDE_TEMPLATES: GuideTemplate[] = [
  {
    id: "brief",
    label: { es: "Guía breve", en: "Brief guide" },
    description: { es: "Lo esencial para una sesión.", en: "The essentials for one session." },
    sections: ["introduction", "essential_question", "ontology", "interpretations", "socratic", "bibliography"],
    words: 1400,
  },
  {
    id: "standard",
    label: { es: "Guía estándar", en: "Standard guide" },
    description: { es: "Estructura completa y equilibrada.", en: "Complete, balanced structure." },
    sections: [
      "introduction", "objectives", "essential_question", "etymology", "ontology", "interpretations",
      "authors", "discipline_link", "cases", "socratic", "assessment", "synthesis", "bibliography",
    ],
    words: 2800,
  },
  {
    id: "exhaustive",
    label: { es: "Guía exhaustiva", en: "Exhaustive guide" },
    description: { es: "Todas las secciones, máxima profundidad.", en: "Every section, maximum depth." },
    sections: GUIDE_SECTIONS_KEYS(),
    words: 5000,
  },
  {
    id: "conceptual",
    label: { es: "Guía conceptual", en: "Conceptual guide" },
    description: { es: "Análisis y distinciones del concepto.", en: "Analysis and distinctions of the concept." },
    sections: ["introduction", "etymology", "ontology", "distinctions", "history", "interpretations", "synthesis", "bibliography"],
    words: 2600,
  },
  {
    id: "questions",
    label: { es: "Guía de preguntas", en: "Question guide" },
    description: { es: "Preguntas socráticas y de evaluación.", en: "Socratic and assessment questions." },
    sections: ["introduction", "essential_question", "socratic", "argument_exercises", "reflection", "assessment", "bibliography"],
    words: 1800,
  },
  {
    id: "cases",
    label: { es: "Guía de casos", en: "Case guide" },
    description: { es: "Aplicación a situaciones de la disciplina.", en: "Application to discipline situations." },
    sections: ["introduction", "objectives", "ontology", "discipline_link", "cases", "argument_exercises", "assessment", "bibliography"],
    words: 2400,
  },
  {
    id: "debate",
    label: { es: "Guía de debate", en: "Debate guide" },
    description: { es: "Posiciones enfrentadas y argumentos.", en: "Opposing positions and arguments." },
    sections: ["introduction", "essential_question", "interpretations", "confrontations", "debate", "argument_exercises", "bibliography"],
    words: 2200,
  },
  {
    id: "interdisciplinary",
    label: { es: "Guía interdisciplinaria", en: "Interdisciplinary guide" },
    description: { es: "Filosofía y disciplina en diálogo.", en: "Philosophy and discipline in dialogue." },
    sections: [
      "introduction", "objectives", "ontology", "interpretations", "discipline_link", "discipline_theories",
      "confrontations", "cases", "socratic", "synthesis", "bibliography",
    ],
    words: 3200,
  },
];

function GUIDE_SECTIONS_KEYS() {
  return [
    "introduction", "objectives", "essential_question", "etymology", "ontology", "distinctions", "history",
    "interpretations", "authors", "confrontations", "discipline_link", "discipline_theories", "cases", "socratic",
    "argument_exercises", "reflection", "debate", "assessment", "synthesis", "bibliography",
  ];
}

export const EXAM_TYPES: { id: string; label: L }[] = [
  { id: "conceptual", label: { es: "Conceptual", en: "Conceptual" } },
  { id: "applied", label: { es: "Aplicado", en: "Applied" } },
  { id: "cases", label: { es: "Basado en casos", en: "Case-based" } },
  { id: "argumentative", label: { es: "Argumentativo", en: "Argumentative" } },
  { id: "interdisciplinary", label: { es: "Interdisciplinario", en: "Interdisciplinary" } },
  { id: "diagnostic", label: { es: "Diagnóstico", en: "Diagnostic" } },
  { id: "final", label: { es: "Final", en: "Final" } },
  { id: "mixed", label: { es: "Mixto", en: "Mixed" } },
];

export const QUESTION_TYPE_LABELS: Record<QuestionType, L> = {
  concept: { es: "Reconocimiento conceptual", en: "Conceptual recognition" },
  argument: { es: "Análisis de argumentos", en: "Argument analysis" },
  assumption: { es: "Identificación de supuestos", en: "Identifying assumptions" },
  error: { es: "Detección de errores", en: "Error detection" },
  confrontation: { es: "Confrontación intelectual", en: "Intellectual confrontation" },
  case: { es: "Análisis de caso", en: "Case analysis" },
  evidence: { es: "Evaluación de evidencia", en: "Evaluating evidence" },
  reconstruction: { es: "Reconstrucción argumentativa", en: "Argument reconstruction" },
  essay: { es: "Ensayo", en: "Essay" },
  map: { es: "Evaluación mediante mapa", en: "Map-based assessment" },
  multiple_choice: { es: "Selección múltiple", en: "Multiple choice" },
};

export const EPISTEMIC_LABELS: Record<EpistemicKind, L> = {
  etymology: { es: "Etimología", en: "Etymology" },
  conceptual: { es: "Análisis conceptual", en: "Conceptual analysis" },
  interpretive: { es: "Interpretación filosófica", en: "Philosophical interpretation" },
  scientific: { es: "Afirmación científica", en: "Scientific claim" },
  hypothetical: { es: "Caso hipotético", en: "Hypothetical case" },
  pedagogical: { es: "Actividad", en: "Activity" },
};

export const NODE_KIND_LABELS: Record<NodeKind, L> = {
  central: { es: "Concepto central", en: "Central concept" },
  concept: { es: "Concepto", en: "Concept" },
  author: { es: "Autor", en: "Author" },
  school: { es: "Escuela", en: "School" },
  discipline: { es: "Disciplina", en: "Discipline" },
  question: { es: "Pregunta", en: "Question" },
  case: { es: "Caso", en: "Case" },
  objection: { es: "Objeción", en: "Objection" },
};

export const RELATION_LABELS: Record<Relation, L> = {
  relates: { es: "se relaciona con", en: "relates to" },
  opposes: { es: "se opone a", en: "opposes" },
  presupposes: { es: "presupone", en: "presupposes" },
  questions: { es: "cuestiona", en: "questions" },
  develops: { es: "desarrolla", en: "develops" },
  distinguishes: { es: "distingue", en: "distinguishes" },
  applies: { es: "aplica", en: "applies" },
  grounds: { es: "fundamenta", en: "grounds" },
};

export const KIND_LABELS: Record<"guide" | "exam" | "map" | "class", L> = {
  guide: { es: "Guía", en: "Guide" },
  exam: { es: "Examen", en: "Exam" },
  map: { es: "Mapa", en: "Map" },
  class: { es: "Clase", en: "Class" },
};

export const SECTION_ACTIONS = [
  { id: "deepen", label: { es: "Profundizar", en: "Deepen" } },
  { id: "simplify", label: { es: "Simplificar", en: "Simplify" } },
  { id: "rephrase", label: { es: "Reformular", en: "Rephrase" } },
  { id: "level_up", label: { es: "Subir nivel académico", en: "Raise academic level" } },
  { id: "level_down", label: { es: "Bajar nivel académico", en: "Lower academic level" } },
  { id: "objection", label: { es: "Añadir objeción", en: "Add an objection" } },
  { id: "perspective", label: { es: "Añadir perspectiva filosófica", en: "Add a philosophical perspective" } },
  { id: "case", label: { es: "Incorporar caso disciplinar", en: "Add a discipline case" } },
  { id: "questions", label: { es: "Generar preguntas", en: "Generate questions" } },
  { id: "coherence", label: { es: "Revisar coherencia y rigor", en: "Review coherence and rigour" } },
  { id: "bibliography", label: { es: "Sugerir bibliografía", en: "Suggest bibliography" } },
] as const;
export type SectionAction = (typeof SECTION_ACTIONS)[number]["id"];

export const NODE_ACTIONS = [
  { id: "deepen", label: { es: "Profundizar", en: "Deepen" } },
  { id: "thinkers", label: { es: "Añadir filósofos", en: "Add philosophers" } },
  { id: "objections", label: { es: "Añadir objeciones", en: "Add objections" } },
  { id: "related", label: { es: "Añadir conceptos relacionados", en: "Add related concepts" } },
  { id: "discipline", label: { es: "Añadir perspectiva disciplinar", en: "Add discipline perspective" } },
  { id: "case", label: { es: "Añadir caso práctico", en: "Add practical case" } },
  { id: "questions", label: { es: "Generar preguntas", en: "Generate questions" } },
] as const;
export type NodeAction = (typeof NODE_ACTIONS)[number]["id"];
