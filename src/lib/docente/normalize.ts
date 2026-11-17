import { asCognitive } from "./planning";
import { z } from "zod";
import {
  EPISTEMIC_KINDS,
  NODE_KINDS,
  QUESTION_TYPES,
  RELATIONS,
  cleanEdges,
  layoutRadial,
  rebalanceExamPoints,
  uid,
  type DocSection,
  type ExamContent,
  type ExamQuestion,
  type MapContent,
  type MapEdge,
  type MapNode,
} from "./model";
import { filterBibliography, mentionsRegistered } from "./thinkers";

/** Lenient parsers for model output: unknown values fall back to safe defaults. */
const str = (max = 20000) => z.preprocess((v) => (typeof v === "string" ? v : v == null ? "" : String(v)), z.string()).transform((s) => s.slice(0, max));
const num = (d: number) => z.preprocess((v) => (typeof v === "number" ? v : Number(v)), z.number()).catch(d);

const SectionOut = z.object({
  key: str(60).catch(""),
  title: str(240).catch(""),
  body: str(40000).catch(""),
  epistemic: z.enum(EPISTEMIC_KINDS).catch("conceptual"),
  audience: z.enum(["all", "teacher"]).catch("all"),
  minutes: num(0).optional(),
  sources: z.array(str(400)).catch([]),
});
export const DocOut = z.object({ title: str(240).catch(""), sections: z.array(SectionOut).catch([]) });

export function toSections(raw: z.infer<typeof DocOut>["sections"]): DocSection[] {
  return raw
    .filter((s) => s.title.trim() || s.body.trim())
    .map((s) => ({
      id: uid("s"),
      key: s.key || "custom",
      title: s.title.trim(),
      body: s.body.trim(),
      audience: s.audience,
      epistemic: s.epistemic,
      minutes: s.minutes && s.minutes > 0 ? Math.round(s.minutes) : undefined,
      // Generated references are never presented as verified.
      sources: s.sources.filter((t) => t.trim() && mentionsRegistered(t)).map((t) => ({ id: uid("r"), text: t.trim(), status: "pending" as const })),
    }));
}

const RubricOut = z.object({ criterion: str(300).catch(""), descriptor: str(1200).catch(""), points: num(1) });
export const QuestionOut = z.object({
  type: z.enum(QUESTION_TYPES).catch("argument"),
  prompt: str(6000).catch(""),
  caseText: str(8000).catch(""),
  options: z.array(str(600)).catch([]),
  correctOption: z.preprocess((v) => (v === null || v === undefined || v === "" ? null : Number(v)), z.number().int().nullable()).catch(null),
  points: num(10),
  answerLines: num(8),
  answerGuide: str(6000).catch(""),
  rubric: z.array(RubricOut).catch([]),
  teacherNotes: str(3000).catch(""),
  cognitive: z.string().optional().catch(undefined),
});
export const ExamOut = z.object({
  title: str(240).catch(""),
  instructions: str(4000).catch(""),
  bibliography: str(4000).catch(""),
  questions: z.array(QuestionOut).catch([]),
});

export function toQuestion(q: z.infer<typeof QuestionOut>): ExamQuestion {
  const options = q.type === "multiple_choice" ? q.options.filter((o) => o.trim()) : [];
  const correct = options.length > 0 && q.correctOption !== null && q.correctOption >= 0 && q.correctOption < options.length ? q.correctOption : null;
  return {
    id: uid("q"),
    type: q.type,
    prompt: q.prompt.trim(),
    caseText: q.caseText.trim(),
    options,
    correctOption: correct,
    points: Math.max(0, Math.round(q.points)),
    answerLines: Math.min(40, Math.max(0, Math.round(q.answerLines))),
    answerGuide: q.answerGuide.trim(),
    rubric: q.rubric
      .filter((c) => c.criterion.trim())
      .map((c) => ({ id: uid("c"), criterion: c.criterion.trim(), descriptor: c.descriptor.trim(), points: Math.max(0, Math.round(c.points)) })),
    teacherNotes: q.teacherNotes.trim(),
    cognitive: asCognitive(q.cognitive),
  };
}

export function toExam(raw: z.infer<typeof ExamOut>, durationMin: number, totalPoints: number): ExamContent {
  const exam: ExamContent = {
    instructions: raw.instructions.trim(),
    durationMin,
    totalPoints,
    bibliography: filterBibliography(raw.bibliography),
    questions: raw.questions.map(toQuestion).filter((q) => q.prompt),
  };
  // Points always add up to the declared total; the teacher can still adjust them.
  return rebalanceExamPoints(exam);
}

const NodeOut = z.object({
  key: str(80).catch(""),
  label: str(160).catch(""),
  kind: z.enum(NODE_KINDS).catch("concept"),
  note: str(1200).catch(""),
});
const EdgeOut = z.object({ from: str(80).catch(""), to: str(80).catch(""), relation: z.enum(RELATIONS).catch("relates") });
export const MapOut = z.object({ title: str(240).catch(""), nodes: z.array(NodeOut).catch([]), edges: z.array(EdgeOut).catch([]) });

/** Converts key-based nodes/edges into id-based ones. `anchors` maps extra keys (e.g. "SELF") to existing ids. */
export function toMapParts(
  raw: { nodes: z.infer<typeof NodeOut>[]; edges: z.infer<typeof EdgeOut>[] },
  anchors: Record<string, string> = {},
): { nodes: MapNode[]; edges: MapEdge[] } {
  const keyToId = new Map<string, string>(Object.entries(anchors));
  const nodes: MapNode[] = [];
  for (const n of raw.nodes) {
    if (!n.label.trim()) continue;
    // Author nodes may only name thinkers registered in Kionas.
    if (n.kind === "author" && !mentionsRegistered(n.label)) continue;
    const id = uid("n");
    keyToId.set(n.key || n.label, id);
    keyToId.set(n.label, id);
    nodes.push({ id, label: n.label.trim(), kind: n.kind, note: n.note.trim(), x: 0, y: 0 });
  }
  const edges: MapEdge[] = [];
  for (const e of raw.edges) {
    const from = keyToId.get(e.from);
    const to = keyToId.get(e.to);
    if (from && to) edges.push({ id: uid("e"), from, to, relation: e.relation });
  }
  return { nodes, edges };
}

export function toMap(raw: z.infer<typeof MapOut>): MapContent {
  const parts = toMapParts(raw);
  if (parts.nodes.length > 0 && !parts.nodes.some((n) => n.kind === "central")) parts.nodes[0].kind = "central";
  return layoutRadial(cleanEdges(parts));
}
