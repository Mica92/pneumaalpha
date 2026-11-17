/**
 * Kionas Docente — Reasoning Analyzer: client-safe model, normalization and
 * conversion into guide sections or an argument map. No I/O here.
 */
import { cleanEdges, layoutArgument, uid, type DocContent, type DocSection, type EpistemicKind, type MapContent, type MapEdge, type MapNode, type NodeKind, type Relation } from "./model";

export const CLAIM_STATUSES = ["verifiable", "plausible", "debatable"] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];
export const CLAIM_STATUS_LABELS: Record<ClaimStatus, { es: string; en: string }> = {
  verifiable: { es: "Afirmación verificable", en: "Verifiable claim" },
  plausible: { es: "Inferencia plausible", en: "Plausible inference" },
  debatable: { es: "Interpretación debatible", en: "Debatable interpretation" },
};

export type AnalysisItem = { id: string; text: string; status: ClaimStatus };
export type DimensionKey =
  | "thesis"
  | "explicit_premises"
  | "implicit_premises"
  | "inferences"
  | "evidence"
  | "weaknesses"
  | "objections"
  | "alternatives"
  | "reconstruction"
  | "questions";

export type Dimension = {
  key: DimensionKey;
  label: { es: string; en: string };
  hint: { es: string; en: string };
  epistemic: EpistemicKind;
};

export const DIMENSIONS: Dimension[] = [
  { key: "thesis", label: { es: "Tesis principal", en: "Main thesis" }, hint: { es: "Qué intenta defender el argumento.", en: "What the argument tries to defend." }, epistemic: "conceptual" },
  { key: "explicit_premises", label: { es: "Premisas explícitas", en: "Explicit premises" }, hint: { es: "Qué razones se presentan.", en: "Which reasons are given." }, epistemic: "conceptual" },
  { key: "implicit_premises", label: { es: "Premisas implícitas", en: "Implicit premises" }, hint: { es: "Qué supuestos serían necesarios para la conclusión.", en: "Which assumptions the conclusion needs." }, epistemic: "interpretive" },
  { key: "inferences", label: { es: "Inferencias", en: "Inferences" }, hint: { es: "Cómo se pasa de las premisas a la conclusión.", en: "How premises lead to the conclusion." }, epistemic: "conceptual" },
  { key: "evidence", label: { es: "Evidencia", en: "Evidence" }, hint: { es: "Qué datos respaldan o no las afirmaciones.", en: "Which data support the claims, or not." }, epistemic: "scientific" },
  { key: "weaknesses", label: { es: "Debilidades argumentativas", en: "Argumentative weaknesses" }, hint: { es: "Qué inferencias no están justificadas.", en: "Which inferences are not justified." }, epistemic: "interpretive" },
  { key: "objections", label: { es: "Objeciones", en: "Objections" }, hint: { es: "Qué críticas razonables podrían formularse.", en: "Which reasonable criticisms could be raised." }, epistemic: "interpretive" },
  { key: "alternatives", label: { es: "Perspectivas alternativas", en: "Alternative perspectives" }, hint: { es: "Cómo lo verían otras escuelas o disciplinas.", en: "How other schools or disciplines would see it." }, epistemic: "interpretive" },
  { key: "reconstruction", label: { es: "Reconstrucción", en: "Reconstruction" }, hint: { es: "Cómo formular un argumento más sólido.", en: "How to state a stronger argument." }, epistemic: "conceptual" },
  { key: "questions", label: { es: "Preguntas pedagógicas", en: "Teaching questions" }, hint: { es: "Preguntas para examinar mejor el razonamiento.", en: "Questions to examine the reasoning." }, epistemic: "pedagogical" },
];

export type ArgumentAnalysis = {
  title: string;
  dimensions: Record<DimensionKey, AnalysisItem[]>;
  /** Teacher's own observations per dimension. */
  notes: Partial<Record<DimensionKey, string>>;
  /** Argument Clinic results the teacher chose to keep. */
  clinic?: ClinicResult[];
};

/* ───────── Argument Clinic ───────── */

export const CLINIC_OPS = ["steelman", "counterpoint", "assumption_test", "weak_inferences", "reconstruction", "compare"] as const;
export type ClinicOp = (typeof CLINIC_OPS)[number];
export const CLINIC_INFO: Record<ClinicOp, { label: { es: string; en: string }; hint: { es: string; en: string }; instruction: string }> = {
  steelman: {
    label: { es: "Steelman", en: "Steelman" },
    hint: { es: "La versión razonable más sólida de la posición, antes de criticarla.", en: "The strongest reasonable version of the position, before criticising it." },
    instruction: 'Construye la versión razonable más sólida de la posición (steelman): explicita premisas que la fortalecen, acota su alcance y responde a la objeción más obvia. "items": premisas o movimientos que la refuerzan.',
  },
  counterpoint: {
    label: { es: "Contrapunto", en: "Counterpoint" },
    hint: { es: "Una objeción fuerte y pertinente.", en: "A strong, relevant objection." },
    instruction: 'Formula la objeción más fuerte y pertinente (no un hombre de paja). "intro": la objeción en un párrafo; "items": sus apoyos y la réplica más plausible del defensor.',
  },
  assumption_test: {
    label: { es: "Prueba de supuestos", en: "Assumption test" },
    hint: { es: "Qué ocurre con la conclusión si cambia una premisa.", en: "What happens to the conclusion if a premise changes." },
    instruction: 'Examina qué ocurre con la conclusión si se modifica la premisa indicada como indica el docente. "intro": efecto general (se mantiene, se debilita, cae o cambia de alcance) y por qué; "items": consecuencias concretas.',
  },
  weak_inferences: {
    label: { es: "Inferencias débiles", en: "Weak inferences" },
    hint: { es: "Saltos no justificados entre premisas y conclusión.", en: "Unjustified leaps between premises and conclusion." },
    instruction: 'Identifica saltos inferenciales no justificados. "text": el paso débil; "detail": qué falta para justificarlo. Distingue un salto lógico de un desacuerdo filosófico razonable y no llames falacia a lo segundo.',
  },
  reconstruction: {
    label: { es: "Reconstrucción", en: "Reconstruction" },
    hint: { es: "El argumento con estructura y claridad mejoradas.", en: "The argument with clearer structure." },
    instruction: 'Reconstruye el argumento en forma estándar numerada: "items" en orden (P1, P2…, C), cada uno con "detail" que indique si es explícito, implícito o añadido para la validez.',
  },
  compare: {
    label: { es: "Comparación", en: "Comparison" },
    hint: { es: "Contrasta dos razonamientos sobre el mismo problema.", en: "Contrast two lines of reasoning on the same problem." },
    instruction: 'Compara el razonamiento A con el razonamiento B sobre el mismo problema. "items": puntos de contraste (tesis, premisas, evidencia, alcance, solidez); "detail" indica qué dice cada uno y cuál está mejor justificado en ese punto, si se puede decir.',
  },
};

export type ClinicResult = {
  id: string;
  op: ClinicOp;
  title: string;
  intro: string;
  items: { text: string; detail: string }[];
  /** What the teacher asked (premise changed, compared text) so the result can be read later. */
  input?: string;
};

/** Safe clinic result from model JSON; empty results are rejected upstream. */
export function normalizeClinic(op: ClinicOp, raw: unknown, input?: string): ClinicResult {
  const r = (raw && typeof raw === "object" ? raw : {}) as { title?: unknown; intro?: unknown; items?: unknown };
  const items = (Array.isArray(r.items) ? r.items : [])
    .map((it) => {
      const o = (typeof it === "string" ? { text: it } : (it ?? {})) as { text?: unknown; detail?: unknown };
      return { text: typeof o.text === "string" ? o.text.trim().slice(0, MAX_TEXT) : "", detail: typeof o.detail === "string" ? o.detail.trim().slice(0, MAX_TEXT) : "" };
    })
    .filter((it) => it.text)
    .slice(0, MAX_ITEMS);
  return {
    id: uid("k"),
    op,
    title: typeof r.title === "string" && r.title.trim() ? r.title.trim().slice(0, 240) : "",
    intro: typeof r.intro === "string" ? r.intro.trim().slice(0, 4000) : "",
    items,
    ...(input ? { input: input.slice(0, 2000) } : {}),
  };
}

const MAX_ITEMS = 12;
const MAX_TEXT = 2000;

/** Turns raw model JSON into a safe analysis; unknown statuses become "debatable". */
export function normalizeAnalysis(raw: unknown, fallbackTitle = ""): ArgumentAnalysis {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const dimensions = {} as Record<DimensionKey, AnalysisItem[]>;
  for (const d of DIMENSIONS) {
    const list = Array.isArray(r[d.key]) ? (r[d.key] as unknown[]) : [];
    dimensions[d.key] = list
      .map((it) => {
        const o = (typeof it === "string" ? { text: it } : it ?? {}) as { text?: unknown; status?: unknown };
        const text = typeof o.text === "string" ? o.text.trim().slice(0, MAX_TEXT) : "";
        const status = CLAIM_STATUSES.includes(o.status as ClaimStatus) ? (o.status as ClaimStatus) : "debatable";
        return { id: uid("a"), text, status };
      })
      .filter((it) => it.text.length > 0)
      .slice(0, MAX_ITEMS);
  }
  const title = typeof r.title === "string" && r.title.trim() ? r.title.trim().slice(0, 240) : fallbackTitle;
  return { title, dimensions, notes: {} };
}

export function isEmptyAnalysis(a: ArgumentAnalysis): boolean {
  return DIMENSIONS.every((d) => a.dimensions[d.key].length === 0);
}

/** One guide section per non-empty dimension; statuses are kept visible, teacher notes go to the teacher version. */
export function analysisToDoc(a: ArgumentAnalysis, lang: "es" | "en"): DocContent {
  const sections: DocSection[] = [];
  for (const d of DIMENSIONS) {
    const items = a.dimensions[d.key];
    if (items.length > 0) {
      const body = items.map((it) => `- ${it.text} *(${CLAIM_STATUS_LABELS[it.status][lang]})*`).join("\n");
      sections.push({ id: uid("s"), key: d.key, title: d.label[lang], body, audience: "all", epistemic: d.epistemic, sources: [] });
    }
    const note = a.notes[d.key]?.trim();
    if (note) {
      sections.push({
        id: uid("s"),
        key: `${d.key}_note`,
        title: `${d.label[lang]} — ${lang === "es" ? "observación docente" : "teacher note"}`,
        body: note,
        audience: "teacher",
        epistemic: "pedagogical",
        sources: [],
      });
    }
  }
  for (const k of a.clinic ?? []) {
    const head = k.input ? `*${k.input}*\n\n` : "";
    const list = k.items.map((it) => `- **${it.text}**${it.detail ? ` — ${it.detail}` : ""}`).join("\n");
    sections.push({
      id: uid("s"),
      key: `clinic_${k.op}`,
      title: `${CLINIC_INFO[k.op].label[lang]}${k.title ? ` — ${k.title}` : ""}`,
      body: `${head}${k.intro}${k.intro && list ? "\n\n" : ""}${list}`.trim(),
      audience: "all",
      epistemic: "interpretive",
      sources: [],
    });
  }
  return { sections };
}

/** Caps keep the argument map readable (at most 15 nodes around the thesis). */
const MAP_ROLE: Partial<Record<DimensionKey, { kind: NodeKind; relation: Relation; towardThesis: boolean; max: number }>> = {
  explicit_premises: { kind: "premise", relation: "grounds", towardThesis: true, max: 3 },
  implicit_premises: { kind: "premise", relation: "presupposes", towardThesis: false, max: 1 },
  inferences: { kind: "inference", relation: "infers", towardThesis: true, max: 2 },
  evidence: { kind: "case", relation: "grounds", towardThesis: true, max: 2 },
  weaknesses: { kind: "question", relation: "questions", towardThesis: true, max: 2 },
  objections: { kind: "objection", relation: "opposes", towardThesis: true, max: 3 },
  alternatives: { kind: "school", relation: "questions", towardThesis: true, max: 1 },
};

function shortLabel(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > 56 ? `${t.slice(0, 53)}…` : t;
}

/**
 * Argument map: premises and evidence support the thesis, objections oppose it,
 * weaknesses and questions question it. Proximity is never used as a logical relation.
 */
export function analysisToMap(a: ArgumentAnalysis, lang: "es" | "en"): MapContent {
  const nodes: MapNode[] = [];
  const edges: MapEdge[] = [];
  const thesisText = a.dimensions.thesis.map((t) => t.text).join(" ") || a.title;
  const thesis: MapNode = { id: uid("n"), label: shortLabel(thesisText), kind: "central", note: thesisText, x: 0, y: 0 };
  nodes.push(thesis);
  for (const d of DIMENSIONS) {
    const role = MAP_ROLE[d.key];
    if (!role) continue;
    for (const it of a.dimensions[d.key].slice(0, role.max)) {
      const n: MapNode = {
        id: uid("n"),
        label: shortLabel(it.text),
        kind: role.kind,
        note: `${d.label[lang]} · ${CLAIM_STATUS_LABELS[it.status][lang]}. ${it.text}`,
        x: 0,
        y: 0,
      };
      nodes.push(n);
      edges.push(
        role.towardThesis
          ? { id: uid("e"), from: n.id, to: thesis.id, relation: role.relation }
          : { id: uid("e"), from: thesis.id, to: n.id, relation: role.relation },
      );
    }
  }
  return layoutArgument(cleanEdges({ nodes, edges, mode: "argument" }));
}
