/** Shared vocabulary of the Thinking Workspace — safe to import anywhere. */

export const REFLECTION_STATES = [
  "exploring",
  "clarifying",
  "examining",
  "deciding",
  "integrating",
] as const;

export type ReflectionState = (typeof REFLECTION_STATES)[number];

export const THOUGHT_KINDS = [
  "question",
  "assumption",
  "value",
  "tension",
  "perspective",
  "insight",
  "pattern",
  "decision",
] as const;

export type ThoughtKind = (typeof THOUGHT_KINDS)[number];

export type Reflection = {
  id: string;
  title: string;
  state: ReflectionState;
  philosopher: string | null;
  opening_question: string | null;
  created_at: string;
  updated_at: string;
};

export type ThoughtObject = {
  id: string;
  reflection_id: string | null;
  kind: ThoughtKind;
  text: string;
  context: string | null;
  rationale: string | null;
  philosopher: string | null;
  in_map: boolean;
  muted: boolean;
  created_at: string;
};

export type DecisionRecord = {
  id: string;
  reflection_id: string | null;
  situation: string;
  decision: string;
  reason: string | null;
  risk: string | null;
  learned: string | null;
  watch_for: string | null;
  review_at: string | null;
  created_at: string;
};

export const STATE_LABEL: Record<ReflectionState, { es: string; en: string }> = {
  exploring: { es: "Explorando", en: "Exploring" },
  clarifying: { es: "Clarificando", en: "Clarifying" },
  examining: { es: "Examinando", en: "Examining" },
  deciding: { es: "Decidiendo", en: "Deciding" },
  integrating: { es: "Integrando", en: "Integrating" },
};

export const KIND_LABEL: Record<ThoughtKind, { es: string; en: string }> = {
  question: { es: "Pregunta", en: "Question" },
  assumption: { es: "Supuesto", en: "Assumption" },
  value: { es: "Valor", en: "Value" },
  tension: { es: "Tensión", en: "Tension" },
  perspective: { es: "Perspectiva", en: "Perspective" },
  insight: { es: "Insight", en: "Insight" },
  pattern: { es: "Patrón", en: "Pattern" },
  decision: { es: "Decisión", en: "Decision" },
};

/** Semantic colour per object kind — maps to tokens defined in styles.css. */
export const KIND_TONE: Record<ThoughtKind, string> = {
  question: "text-foreground",
  assumption: "text-muted-foreground",
  value: "text-keep",
  tension: "text-tension",
  perspective: "text-mist",
  insight: "text-bronze",
  pattern: "text-keep",
  decision: "text-bronze",
};

/** Kinds offered when someone selects a fragment of the conversation. */
export const CAPTURE_KINDS: ThoughtKind[] = [
  "insight",
  "question",
  "assumption",
  "value",
  "tension",
  "decision",
];

/** Builds a short, human title from the first thing a person wrote. */
export function titleFromQuestion(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 64) return clean;
  return clean.slice(0, 61).trimEnd() + "…";
}

/** Suggests a reflection state from what the workspace already holds. */
export function suggestState(objects: ThoughtObject[], exchanges: number): ReflectionState {
  const has = (k: ThoughtKind) => objects.some((o) => o.kind === k);
  if (has("decision")) return "integrating";
  if (has("value") && has("tension")) return "deciding";
  if (has("tension") || has("assumption")) return "examining";
  if (exchanges >= 2) return "clarifying";
  return "exploring";
}
