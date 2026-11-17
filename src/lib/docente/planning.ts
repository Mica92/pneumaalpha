/**
 * Stage C/D client-safe rules: cognitive levels, exam specification matrix,
 * curriculum structure, class formats, map modalities and the quality report shape.
 */
import type { ExamContent, ExamQuestion, QuestionType } from "./model";

type L = { es: string; en: string };

/* ───────── Cognitive levels (revised Bloom) ───────── */

export const COGNITIVE_LEVELS = ["remember", "understand", "apply", "analyze", "evaluate", "create"] as const;
export type CognitiveLevel = (typeof COGNITIVE_LEVELS)[number];
export const COGNITIVE_LABELS: Record<CognitiveLevel, L> = {
  remember: { es: "Recordar", en: "Remember" },
  understand: { es: "Comprender", en: "Understand" },
  apply: { es: "Aplicar", en: "Apply" },
  analyze: { es: "Analizar", en: "Analyze" },
  evaluate: { es: "Evaluar", en: "Evaluate" },
  create: { es: "Crear", en: "Create" },
};
export const HIGHER_ORDER: readonly CognitiveLevel[] = ["analyze", "evaluate", "create"];

export function asCognitive(v: unknown): CognitiveLevel | undefined {
  return typeof v === "string" && (COGNITIVE_LEVELS as readonly string[]).includes(v) ? (v as CognitiveLevel) : undefined;
}

/* ───────── Specification matrix ───────── */

export type SpecCell = { count: number; points: number };
export type SpecMatrix = {
  rows: QuestionType[];
  cols: CognitiveLevel[];
  cells: Record<string, SpecCell>;
  rowTotals: Record<string, SpecCell>;
  colTotals: Record<string, SpecCell>;
  unclassified: SpecCell;
  total: SpecCell;
};

const key = (r: string, c: string) => `${r}|${c}`;

/** Cross-tab of question type × cognitive level with counts and points. Unclassified questions are counted apart. */
export function specMatrix(exam: Pick<ExamContent, "questions">): SpecMatrix {
  const rows: QuestionType[] = [];
  const cells: Record<string, SpecCell> = {};
  const rowTotals: Record<string, SpecCell> = {};
  const colTotals: Record<string, SpecCell> = {};
  const unclassified: SpecCell = { count: 0, points: 0 };
  const total: SpecCell = { count: 0, points: 0 };
  const add = (c: SpecCell, q: ExamQuestion) => {
    c.count += 1;
    c.points += Number.isFinite(q.points) ? q.points : 0;
  };
  for (const q of exam.questions) {
    add(total, q);
    if (!rows.includes(q.type)) rows.push(q.type);
    add((rowTotals[q.type] ??= { count: 0, points: 0 }), q);
    if (!q.cognitive) {
      add(unclassified, q);
      continue;
    }
    add((cells[key(q.type, q.cognitive)] ??= { count: 0, points: 0 }), q);
    add((colTotals[q.cognitive] ??= { count: 0, points: 0 }), q);
  }
  return { rows, cols: [...COGNITIVE_LEVELS], cells, rowTotals, colTotals, unclassified, total };
}

export function specCell(m: SpecMatrix, row: string, col: string): SpecCell {
  return m.cells[key(row, col)] ?? { count: 0, points: 0 };
}

/** Share of points on higher-order levels among classified questions (0–1), or null when nothing is classified. */
export function higherOrderShare(m: SpecMatrix): number | null {
  const classified = m.total.points - m.unclassified.points;
  if (classified <= 0) return null;
  const hi = HIGHER_ORDER.reduce((s, c) => s + (m.colTotals[c]?.points ?? 0), 0);
  return hi / classified;
}

/* ───────── Curriculum Architect ───────── */

export const CURRICULUM_SECTIONS: { key: string; label: L; teacher?: boolean }[] = [
  { key: "identification", label: { es: "Identificación de la asignatura", en: "Course identification" } },
  { key: "rationale", label: { es: "Fundamentación", en: "Rationale" } },
  { key: "outcomes", label: { es: "Resultados de aprendizaje", en: "Learning outcomes" } },
  { key: "units", label: { es: "Unidades temáticas", en: "Thematic units" } },
  { key: "schedule", label: { es: "Cronograma de sesiones", en: "Session schedule" } },
  { key: "methodology", label: { es: "Metodología", en: "Methodology" } },
  { key: "assessment", label: { es: "Plan de evaluación", en: "Assessment plan" } },
  { key: "bibliography", label: { es: "Bibliografía", en: "Bibliography" } },
  { key: "teacher_notes", label: { es: "Notas de diseño (solo docente)", en: "Design notes (teacher only)" }, teacher: true },
];

export const CURRICULUM_APPROACHES = ["thematic", "problem", "historical", "competency", "authors"] as const;
export type CurriculumApproach = (typeof CURRICULUM_APPROACHES)[number];
export const CURRICULUM_APPROACH_LABELS: Record<CurriculumApproach, L & { hint: string }> = {
  thematic: { es: "Por temas", en: "Thematic", hint: "Unidades organizadas por núcleos temáticos." },
  problem: { es: "Por problemas", en: "Problem-based", hint: "Cada unidad parte de un problema o pregunta abierta." },
  historical: { es: "Histórico", en: "Historical", hint: "Recorrido cronológico de ideas y debates." },
  competency: { es: "Por competencias", en: "Competency-based", hint: "Unidades organizadas por las competencias del perfil de egreso." },
  authors: { es: "Por autores", en: "By authors", hint: "Unidades centradas en pensadores y sus confrontaciones." },
};

export type CurriculumPlan = { weeks: number; sessionsPerWeek: number; sessionMinutes: number };

/** Total sessions and contact hours, so the generated schedule can be checked. */
export function curriculumLoad(p: CurriculumPlan): { sessions: number; hours: number } {
  const weeks = clampInt(p.weeks, 1, 40);
  const per = clampInt(p.sessionsPerWeek, 1, 7);
  const min = clampInt(p.sessionMinutes, 20, 600);
  const sessions = weeks * per;
  return { sessions, hours: Math.round(((sessions * min) / 60) * 10) / 10 };
}

/** Assessment weights must add up to 100 %. Reads top-level lines like "- Ensayo — 30%"; indented sub-criteria are ignored. */
export function assessmentWeights(markdown: string): { items: { label: string; weight: number }[]; sum: number } {
  const items: { label: string; weight: number }[] = [];
  for (const line of markdown.split("\n")) {
    const m = line.match(/^(?:[-*]|\d+\.|\|)\s*(.+?)\s*(?:—|-|:|\|)\s*(\d{1,3}(?:[.,]\d+)?)\s*%/);
    if (m) items.push({ label: m[1].replace(/\*+/g, "").trim(), weight: Number(m[2].replace(",", ".")) });
  }
  return { items, sum: Math.round(items.reduce((s, i) => s + i.weight, 0) * 10) / 10 };
}

/* ───────── Class Studio 3.0 ───────── */

export const CLASS_FORMATS = ["lecture", "seminar", "workshop", "debate", "flipped", "case"] as const;
export type ClassFormat = (typeof CLASS_FORMATS)[number];
export const CLASS_FORMAT_LABELS: Record<ClassFormat, L> = {
  lecture: { es: "Clase expositiva dialogada", en: "Interactive lecture" },
  seminar: { es: "Seminario de lectura", en: "Reading seminar" },
  workshop: { es: "Taller práctico", en: "Practical workshop" },
  debate: { es: "Debate estructurado", en: "Structured debate" },
  flipped: { es: "Aula invertida", en: "Flipped classroom" },
  case: { es: "Análisis de caso", en: "Case analysis" },
};

/* ───────── Maps 3.0 ───────── */

export const MAP_MODALITIES = ["concept", "genealogy", "debate", "tension", "problem", "interdisciplinary"] as const;
export type MapModality = (typeof MAP_MODALITIES)[number];
export const MAP_MODALITY_INFO: Record<MapModality, L & { instruction: string }> = {
  concept: { es: "Conceptual", en: "Conceptual", instruction: "Mapa conceptual: un nodo central y ramas pertinentes." },
  genealogy: {
    es: "Genealogía de una idea",
    en: "Genealogy of an idea",
    instruction:
      "Genealogía conceptual: muestra cómo la idea se transforma a lo largo del tiempo. Nodos de tipo concept y author ordenados de lo más antiguo a lo más reciente; usa sobre todo 'develops', 'opposes' y 'distinguishes'. Indica en 'note' la época o el giro conceptual sin inventar fechas dudosas.",
  },
  debate: {
    es: "Mapa de debate",
    en: "Debate map",
    instruction:
      "Mapa de debate: un nodo central 'question' con la pregunta disputada; dos o más posiciones (concept o author) con sus razones ('grounds'), objeciones ('objection' + 'opposes') y réplicas. No declares ganador.",
  },
  tension: {
    es: "Tensión entre principios",
    en: "Tension between principles",
    instruction:
      "Mapa de tensión: dos o tres principios o valores en conflicto, los casos donde chocan ('case' + 'applies'), los supuestos de cada uno ('presupposes') y posibles mediaciones. Señala que la tensión puede no tener solución única.",
  },
  problem: {
    es: "Problema y soluciones",
    en: "Problem and solutions",
    instruction:
      "Mapa de problema: el problema central, sus causas o condiciones ('grounds'), conceptos implicados, respuestas posibles y las objeciones a cada respuesta.",
  },
  interdisciplinary: {
    es: "Interdisciplinario",
    en: "Interdisciplinary",
    instruction:
      "Mapa interdisciplinario: el concepto central y cómo lo tratan distintas disciplinas (nodos 'discipline'), con los conceptos propios de cada una y los puntos de contacto. Señala los vínculos débiles.",
  },
};

/* ───────── Academic Quality Assistant ───────── */

export const QUALITY_DIMENSIONS = [
  "conceptual_rigor",
  "logical_coherence",
  "level_fit",
  "discipline_fit",
  "sources",
  "plurality",
  "clarity",
  "alignment",
  "editorial",
] as const;
export type QualityDimension = (typeof QUALITY_DIMENSIONS)[number];
export const QUALITY_LABELS: Record<QualityDimension, L & { instruction: string }> = {
  conceptual_rigor: { es: "Rigor conceptual", en: "Conceptual rigor", instruction: "Definiciones precisas, sin confusiones ni simplificaciones engañosas." },
  logical_coherence: { es: "Coherencia lógica", en: "Logical coherence", instruction: "Secuencia argumentativa sin saltos, contradicciones ni conclusiones no fundadas." },
  level_fit: { es: "Adecuación al nivel", en: "Level fit", instruction: "Complejidad, vocabulario y carga apropiados para el nivel indicado." },
  discipline_fit: { es: "Pertinencia disciplinar", en: "Discipline fit", instruction: "Ejemplos, problemas y marcos propios de la carrera; vínculos no forzados." },
  sources: { es: "Fuentes y atribuciones", en: "Sources and attributions", instruction: "Atribuciones prudentes, sin citas inventadas; distingue hipótesis de evidencia." },
  plurality: { es: "Pluralidad de perspectivas", en: "Plurality of perspectives", instruction: "Presenta posiciones contrapuestas razonables sin sesgo." },
  clarity: { es: "Claridad y legibilidad", en: "Clarity", instruction: "Instrucciones y explicaciones comprensibles; estructura ordenada." },
  alignment: { es: "Alineamiento pedagógico y evaluativo", en: "Pedagogical and assessment alignment", instruction: "Objetivos, actividades, preguntas y rúbricas coherentes entre sí." },
  editorial: { es: "Calidad editorial", en: "Editorial quality", instruction: "Redundancias, problemas de estructura y errores de estilo." },
};

export type QualityStatus = "ok" | "attention" | "problem";
export type QualityFinding = { dimension: QualityDimension; status: QualityStatus; excerpt?: string; summary: string; suggestions: string[] };
export type QualityReport = { overview: string; findings: QualityFinding[] };

/** Keeps only known dimensions (once each, in canonical order) and valid statuses. Never yields an automatic "approved". */
export function normalizeQuality(raw: unknown): QualityReport {
  const r = (raw ?? {}) as { overview?: unknown; findings?: unknown };
  const list = Array.isArray(r.findings) ? r.findings : [];
  const byDim = new Map<QualityDimension, QualityFinding>();
  for (const f of list as Record<string, unknown>[]) {
    const dim = f?.dimension;
    if (typeof dim !== "string" || !(QUALITY_DIMENSIONS as readonly string[]).includes(dim) || byDim.has(dim as QualityDimension)) continue;
    const status: QualityStatus = f.status === "ok" || f.status === "problem" ? f.status : "attention";
    const suggestions = (Array.isArray(f.suggestions) ? f.suggestions : [])
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      .map((s) => s.trim().slice(0, 600))
      .slice(0, 5);
    byDim.set(dim as QualityDimension, {
      dimension: dim as QualityDimension,
      status,
      excerpt: typeof f.excerpt === "string" && f.excerpt.trim() ? f.excerpt.trim().slice(0, 240) : undefined,
      summary: typeof f.summary === "string" ? f.summary.trim().slice(0, 1200) : "",
      suggestions,
    });
  }
  return {
    overview: typeof r.overview === "string" ? r.overview.trim().slice(0, 1500) : "",
    findings: QUALITY_DIMENSIONS.filter((d) => byDim.has(d)).map((d) => byDim.get(d)!),
  };
}

/** Distractors proposed by AI: drop blanks, duplicates and any that repeat an existing option or the correct answer. */
export function cleanDistractors(proposed: unknown, existing: string[]): string[] {
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const seen = new Set(existing.map(norm).filter(Boolean));
  const out: string[] = [];
  for (const p of Array.isArray(proposed) ? proposed : []) {
    if (typeof p !== "string") continue;
    const t = p.trim().slice(0, 600);
    const n = norm(t);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(t);
  }
  return out.slice(0, 6);
}

function clampInt(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, Math.round(Number.isFinite(n) ? n : lo)));
}
