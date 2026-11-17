/**
 * Kionas Docente — Research Desk and Concept Intelligence: client-safe model.
 * Section catalog, depth rules, the concept matrix and its conversion to a map. No I/O.
 */
import { cleanEdges, layoutRadial, uid, type DocContent, type DocSection, type EpistemicKind, type Lang, type MapContent, type MapEdge, type MapNode, type NodeKind, type Relation } from "./model";
import { mentionsRegistered } from "./thinkers";

type L = { es: string; en: string };

export const RESEARCH_INPUTS = ["concept", "question", "author", "theory", "problem", "text", "fragment", "case", "discipline", "interdisciplinary"] as const;
export type ResearchInput = (typeof RESEARCH_INPUTS)[number];
export const RESEARCH_INPUT_LABELS: Record<ResearchInput, L> = {
  concept: { es: "Concepto", en: "Concept" },
  question: { es: "Pregunta", en: "Question" },
  author: { es: "Autor", en: "Author" },
  theory: { es: "Teoría", en: "Theory" },
  problem: { es: "Problema académico", en: "Academic problem" },
  text: { es: "Texto", en: "Text" },
  fragment: { es: "Fragmento bibliográfico", en: "Bibliographic passage" },
  case: { es: "Caso", en: "Case" },
  discipline: { es: "Disciplina", en: "Discipline" },
  interdisciplinary: { es: "Pregunta interdisciplinaria", en: "Interdisciplinary question" },
};

export const RESEARCH_MODES = ["conceptual", "historical", "philosophical", "disciplinary", "comparative", "critical"] as const;
export type ResearchMode = (typeof RESEARCH_MODES)[number];
export const RESEARCH_MODE_INFO: Record<ResearchMode, { label: L; hint: L; instruction: string }> = {
  conceptual: {
    label: { es: "Conceptual", en: "Conceptual" },
    hint: { es: "Definiciones, distinciones, supuestos y problemas ontológicos.", en: "Definitions, distinctions, assumptions and ontological problems." },
    instruction: "Prioriza definiciones, distinciones conceptuales, supuestos y problemas ontológicos.",
  },
  historical: {
    label: { es: "Histórica", en: "Historical" },
    hint: { es: "Evolución del concepto, autores, tradiciones y contextos.", en: "How the idea evolved: authors, traditions and contexts." },
    instruction: "Prioriza la evolución histórica del concepto, sus tradiciones y contextos; marca con claridad lo que es interpretación historiográfica.",
  },
  philosophical: {
    label: { es: "Filosófica", en: "Philosophical" },
    hint: { es: "Perspectivas, argumentos, críticas, escuelas y debates.", en: "Perspectives, arguments, critiques, schools and debates." },
    instruction: "Prioriza perspectivas filosóficas, argumentos, críticas, escuelas y debates abiertos.",
  },
  disciplinary: {
    label: { es: "Disciplinar", en: "Disciplinary" },
    hint: { es: "Aplicación a una carrera, asignatura o especialidad.", en: "Applied to a degree, course or speciality." },
    instruction: "Prioriza la aplicación a la disciplina indicada: teorías, problemas, terminología y casos propios de ese campo.",
  },
  comparative: {
    label: { es: "Comparativa", en: "Comparative" },
    hint: { es: "Contraste entre autores, teorías o interpretaciones.", en: "Contrast between authors, theories or interpretations." },
    instruction: "Prioriza el contraste sistemático entre autores, teorías o interpretaciones: acuerdos, desacuerdos y su fundamento.",
  },
  critical: {
    label: { es: "Crítica", en: "Critical" },
    hint: { es: "Supuestos, coherencia, evidencia y objeciones.", en: "Assumptions, coherence, evidence and objections." },
    instruction: "Prioriza el examen de supuestos, coherencia interna, evidencia disponible y objeciones fuertes.",
  },
};

export const RESEARCH_SECTIONS: { key: string; label: L; epistemic: EpistemicKind }[] = [
  { key: "central_question", label: { es: "Pregunta central", en: "Central question" }, epistemic: "conceptual" },
  { key: "synthesis", label: { es: "Síntesis inicial", en: "Initial synthesis" }, epistemic: "conceptual" },
  { key: "definitions", label: { es: "Definiciones pertinentes", en: "Relevant definitions" }, epistemic: "conceptual" },
  { key: "etymology", label: { es: "Etimología documentada", en: "Documented etymology" }, epistemic: "etymology" },
  { key: "distinctions", label: { es: "Distinciones conceptuales", en: "Conceptual distinctions" }, epistemic: "conceptual" },
  { key: "problems", label: { es: "Problemas fundamentales", en: "Fundamental problems" }, epistemic: "conceptual" },
  { key: "interpretations", label: { es: "Principales interpretaciones", en: "Main interpretations" }, epistemic: "interpretive" },
  { key: "authors", label: { es: "Autores y posiciones", en: "Authors and positions" }, epistemic: "interpretive" },
  { key: "confrontations", label: { es: "Confrontaciones", en: "Confrontations" }, epistemic: "interpretive" },
  { key: "interdisciplinary", label: { es: "Conexiones interdisciplinarias", en: "Interdisciplinary connections" }, epistemic: "interpretive" },
  { key: "cases", label: { es: "Casos de aplicación", en: "Application cases" }, epistemic: "hypothetical" },
  { key: "open_questions", label: { es: "Preguntas abiertas", en: "Open questions" }, epistemic: "pedagogical" },
  { key: "bibliography", label: { es: "Bibliografía", en: "Bibliography" }, epistemic: "conceptual" },
  { key: "limits", label: { es: "Limitaciones y controversias", en: "Limits and controversies" }, epistemic: "interpretive" },
];

export const RESEARCH_DEPTHS = ["exploratory", "academic", "exhaustive"] as const;
export type ResearchDepth = (typeof RESEARCH_DEPTHS)[number];
export const DEPTH_INFO: Record<ResearchDepth, { label: L; hint: L; sections: string[]; words: number; maxTokens: number }> = {
  exploratory: {
    label: { es: "Exploratoria", en: "Exploratory" },
    hint: { es: "Orientación rápida: 7 secciones breves.", en: "Quick orientation: 7 short sections." },
    sections: ["central_question", "synthesis", "definitions", "problems", "interpretations", "open_questions", "limits"],
    words: 1200,
    maxTokens: 7000,
  },
  academic: {
    label: { es: "Académica", en: "Academic" },
    hint: { es: "Preparación de clase: 11 secciones.", en: "Class preparation: 11 sections." },
    sections: ["central_question", "synthesis", "definitions", "etymology", "distinctions", "problems", "interpretations", "authors", "confrontations", "open_questions", "bibliography"],
    words: 2600,
    maxTokens: 13000,
  },
  exhaustive: {
    label: { es: "Exhaustiva", en: "Exhaustive" },
    hint: { es: "Las 14 secciones, con mayor desarrollo.", en: "All 14 sections, in depth." },
    sections: RESEARCH_SECTIONS.map((s) => s.key),
    words: 4200,
    maxTokens: 18000,
  },
};

/** Sections requested for a depth, in catalog order; the matrix replaces nothing. */
export function sectionsForDepth(depth: ResearchDepth): typeof RESEARCH_SECTIONS {
  const keys = new Set(DEPTH_INFO[depth].sections);
  return RESEARCH_SECTIONS.filter((s) => keys.has(s.key));
}

/* ───────── Concept matrix ───────── */

export const MATRIX_COLUMNS = ["meaning", "variants", "assumptions", "theories", "authors", "objections", "disciplines", "applications"] as const;
export type MatrixColumn = (typeof MATRIX_COLUMNS)[number];
export const MATRIX_LABELS: Record<MatrixColumn, L> = {
  meaning: { es: "Significado", en: "Meaning" },
  variants: { es: "Variantes", en: "Variants" },
  assumptions: { es: "Supuestos", en: "Assumptions" },
  theories: { es: "Teorías", en: "Theories" },
  authors: { es: "Autores", en: "Authors" },
  objections: { es: "Objeciones", en: "Objections" },
  disciplines: { es: "Disciplinas", en: "Disciplines" },
  applications: { es: "Aplicaciones", en: "Applications" },
};

/** What kind of claim a matrix item makes — keeps etymology, philosophy and evidence apart. */
export const CLAIM_KINDS = ["etymological", "philosophical", "ontological", "empirical", "author_thesis", "related", "opposed", "applied"] as const;
export type ClaimKind = (typeof CLAIM_KINDS)[number];
export const CLAIM_KIND_LABELS: Record<ClaimKind, L> = {
  etymological: { es: "Etimológico", en: "Etymological" },
  philosophical: { es: "Filosófico", en: "Philosophical" },
  ontological: { es: "Interpretación ontológica", en: "Ontological reading" },
  empirical: { es: "Evidencia empírica", en: "Empirical evidence" },
  author_thesis: { es: "Tesis de un autor", en: "An author's thesis" },
  related: { es: "Relacionado, no equivalente", en: "Related, not equivalent" },
  opposed: { es: "Opuesto", en: "Opposed" },
  applied: { es: "Aplicación", en: "Application" },
};

export type MatrixItem = { id: string; label: string; note: string; claim: ClaimKind };
export type ConceptMatrix = { concept: string; columns: Record<MatrixColumn, MatrixItem[]> };

const MAX_PER_COLUMN = 6;

/** Safe matrix from model JSON. Author items must name a thinker registered in Kionas. */
export function normalizeMatrix(raw: unknown, concept: string): ConceptMatrix | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const columns = {} as Record<MatrixColumn, MatrixItem[]>;
  let total = 0;
  for (const col of MATRIX_COLUMNS) {
    const list = Array.isArray(r[col]) ? (r[col] as unknown[]) : [];
    columns[col] = list
      .map((it) => {
        const o = (typeof it === "string" ? { label: it } : (it ?? {})) as { label?: unknown; note?: unknown; claim?: unknown };
        const label = typeof o.label === "string" ? o.label.trim().slice(0, 160) : "";
        const note = typeof o.note === "string" ? o.note.trim().slice(0, 800) : "";
        const claim = CLAIM_KINDS.includes(o.claim as ClaimKind) ? (o.claim as ClaimKind) : col === "authors" ? "author_thesis" : "philosophical";
        return { id: uid("m"), label, note, claim };
      })
      .filter((it) => it.label && (col !== "authors" || mentionsRegistered(it.label)))
      .slice(0, MAX_PER_COLUMN);
    total += columns[col].length;
  }
  return total === 0 ? null : { concept: concept.slice(0, 200), columns };
}

export type ResearchContent = DocContent & { matrix?: ConceptMatrix | null };

export function asResearch(c: unknown): ResearchContent {
  const o = (c ?? {}) as Partial<ResearchContent>;
  const sections = Array.isArray(o.sections) ? o.sections : [];
  const m = o.matrix;
  const matrix = m && typeof m === "object" && m.columns && typeof m.columns === "object" ? m : null;
  return matrix ? { sections, matrix } : { sections };
}

const MATRIX_ROLE: Record<MatrixColumn, { kind: NodeKind; relation: Relation; outward: boolean }> = {
  meaning: { kind: "concept", relation: "develops", outward: true },
  variants: { kind: "concept", relation: "distinguishes", outward: true },
  assumptions: { kind: "premise", relation: "presupposes", outward: true },
  theories: { kind: "school", relation: "develops", outward: false },
  authors: { kind: "author", relation: "develops", outward: false },
  objections: { kind: "objection", relation: "opposes", outward: false },
  disciplines: { kind: "discipline", relation: "applies", outward: true },
  applications: { kind: "case", relation: "applies", outward: true },
};

/** A concept map that keeps the matrix's meaning: assumptions are presupposed, objections oppose, applications apply. */
export function matrixToMap(m: ConceptMatrix, perColumn = 3): MapContent {
  const nodes: MapNode[] = [];
  const edges: MapEdge[] = [];
  const centre: MapNode = { id: uid("n"), label: m.concept || "—", kind: "central", note: "", x: 0, y: 0 };
  nodes.push(centre);
  for (const col of MATRIX_COLUMNS) {
    const role = MATRIX_ROLE[col];
    for (const it of (m.columns[col] ?? []).slice(0, perColumn)) {
      const n: MapNode = { id: uid("n"), label: it.label, kind: role.kind, note: it.note, x: 0, y: 0 };
      nodes.push(n);
      edges.push(
        role.outward
          ? { id: uid("e"), from: centre.id, to: n.id, relation: role.relation }
          : { id: uid("e"), from: n.id, to: centre.id, relation: role.relation },
      );
    }
  }
  return layoutRadial(cleanEdges({ nodes, edges }));
}

export function matrixToMarkdown(m: ConceptMatrix, lang: Lang): string {
  const out = [`## ${lang === "es" ? "Matriz conceptual" : "Concept matrix"}: ${m.concept}`];
  for (const col of MATRIX_COLUMNS) {
    const items = m.columns[col] ?? [];
    if (items.length === 0) continue;
    out.push(`### ${MATRIX_LABELS[col][lang]}`);
    out.push(items.map((it) => `- **${it.label}** *(${CLAIM_KIND_LABELS[it.claim]?.[lang] ?? it.claim})*${it.note ? ` — ${it.note}` : ""}`).join("\n"));
  }
  return out.join("\n\n");
}

/** Adds the teacher's own sources (from their metadata) to the bibliography, marked as provided. */
export function attachProvidedRefs(sections: DocSection[], citations: string[]): DocSection[] {
  if (citations.length === 0) return sections;
  const refs = citations.map((text) => ({ id: uid("r"), text, status: "provided" as const }));
  const idx = sections.findIndex((s) => s.key === "bibliography");
  const target = idx >= 0 ? idx : sections.length - 1;
  if (target < 0) return sections;
  return sections.map((s, i) => (i === target ? { ...s, sources: [...s.sources, ...refs] } : s));
}
