/**
 * Kionas Docente — question bank rules (client-safe, no I/O).
 * Bank entries keep the full teacher key; only toStudentExam decides what students see.
 */
import { uid, type ExamQuestion, type QuestionType } from "./model";

export const DIFFICULTIES = ["basic", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type BankMeta = {
  concept: string;
  discipline: string;
  subject: string;
  competency: string;
  difficulty: Difficulty;
  sources: string;
  language: "es" | "en";
};

export type BankEntry = BankMeta & {
  id: string;
  question: ExamQuestion;
  prompt: string;
  qtype: QuestionType;
  points: number;
  review_status: "draft" | "reviewed";
  source_material_id: string | null;
  created_at: string;
  updated_at: string;
};

/** Row to store for one exam question: a deep copy with the searchable fields extracted. */
export function bankRowFromQuestion(q: ExamQuestion, meta: BankMeta) {
  const question = copyQuestion(q);
  return {
    ...meta,
    question,
    prompt: q.prompt.trim().slice(0, 6000),
    qtype: q.type,
    points: Number.isFinite(q.points) ? q.points : 0,
  };
}

/** Deep copy with fresh ids, so a reused question never shares identity with its origin. */
export function copyQuestion(q: ExamQuestion): ExamQuestion {
  return {
    ...q,
    id: uid("q"),
    options: [...q.options],
    rubric: q.rubric.map((c) => ({ ...c, id: uid("c") })),
  };
}

/** Question to insert into an exam from a bank entry. Points come from the entry (the teacher may have edited them). */
export function questionFromBank(e: Pick<BankEntry, "question" | "points">): ExamQuestion {
  return { ...copyQuestion(e.question), points: e.points };
}

export type BankFilter = {
  q?: string;
  type?: QuestionType | "";
  difficulty?: Difficulty | "";
  discipline?: string;
  review?: "draft" | "reviewed" | "";
};

function fold(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function filterBank<T extends Pick<BankEntry, "prompt" | "concept" | "discipline" | "subject" | "competency" | "qtype" | "difficulty" | "review_status">>(
  items: T[],
  f: BankFilter,
): T[] {
  const q = fold(f.q ?? "").trim();
  return items.filter(
    (e) =>
      (!f.type || e.qtype === f.type) &&
      (!f.difficulty || e.difficulty === f.difficulty) &&
      (!f.discipline || e.discipline === f.discipline) &&
      (!f.review || e.review_status === f.review) &&
      (!q || fold([e.prompt, e.concept, e.discipline, e.subject, e.competency].join(" ")).includes(q)),
  );
}

/** Normalises the exam generator's difficulty labels (or anything else) into a bank difficulty. */
export function asDifficulty(v: unknown): Difficulty {
  return (DIFFICULTIES as readonly string[]).includes(v as string) ? (v as Difficulty) : "intermediate";
}
