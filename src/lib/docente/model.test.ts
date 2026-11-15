import { describe, expect, test } from "bun:test";
import {
  auditExam,
  cleanEdges,
  distributeInteger,
  examPointsSum,
  makeVariantB,
  rebalanceExamPoints,
  toStudentDoc,
  toStudentExam,
  type ExamContent,
  type ExamQuestion,
} from "./model";

function q(over: Partial<ExamQuestion> = {}): ExamQuestion {
  return {
    id: Math.random().toString(36),
    type: "argument",
    prompt: "Identifica la tesis",
    caseText: "",
    options: [],
    correctOption: null,
    points: 10,
    answerLines: 6,
    answerGuide: "La tesis es…",
    rubric: [
      { id: "r1", criterion: "Tesis", descriptor: "Identifica", points: 6 },
      { id: "r2", criterion: "Premisas", descriptor: "Reconstruye", points: 4 },
    ],
    teacherNotes: "Nota privada",
    ...over,
  };
}

function exam(questions: ExamQuestion[], totalPoints = 100): ExamContent {
  return { instructions: "", durationMin: 60, totalPoints, questions, bibliography: "Kant, Crítica" };
}

describe("exam points", () => {
  test("integer distribution always adds up to the exam total", () => {
    expect(distributeInteger(100, [1, 1, 1])).toEqual([34, 33, 33]);
    expect(distributeInteger(100, [3, 1]).reduce((a, b) => a + b, 0)).toBe(100);
  });

  test("rebalancing makes questions sum to 100 and each rubric sum to its question", () => {
    const e = rebalanceExamPoints(exam([q({ points: 30 }), q({ points: 30 }), q({ points: 10 })]));
    expect(examPointsSum(e)).toBe(100);
    for (const question of e.questions) {
      expect(question.rubric.reduce((s, c) => s + c.points, 0)).toBe(question.points);
    }
  });

  test("auditor flags an exam whose points do not match the total", () => {
    const issues = auditExam(exam([q({ points: 40 }), q({ points: 40 })]));
    expect(issues.some((i) => i.code === "points_total" && i.severity === "error")).toBe(true);
  });

  test("auditor flags repeated questions and multiple choice without a correct answer", () => {
    const issues = auditExam(
      exam([
        q({ points: 50 }),
        q({ points: 50, type: "multiple_choice", prompt: "identifica la tesis", options: ["a", "b", "c"], rubric: [] }),
      ]),
    );
    expect(issues.some((i) => i.code === "duplicate")).toBe(true);
    expect(issues.some((i) => i.code === "mc_no_answer")).toBe(true);
  });
});

describe("student versions", () => {
  test("student exam never carries answers, rubrics, correct options or teacher notes", () => {
    const s = toStudentExam(
      exam([q({ points: 50 }), q({ points: 50, type: "multiple_choice", options: ["a", "b", "c"], correctOption: 2 })]),
    );
    const json = JSON.stringify(s);
    expect(json).not.toContain("La tesis es");
    expect(json).not.toContain("Nota privada");
    expect(json).not.toContain("Reconstruye");
    expect(json).not.toContain("Kant, Crítica");
    expect(s.questions.every((x) => x.correctOption === null && x.rubric.length === 0)).toBe(true);
  });

  test("student guide drops teacher-only sections", () => {
    const doc = toStudentDoc({
      sections: [
        { id: "1", key: "intro", title: "Intro", body: "x", audience: "all", epistemic: "conceptual", sources: [] },
        { id: "2", key: "notes", title: "Pauta", body: "y", audience: "teacher", epistemic: "pedagogical", sources: [] },
      ],
    });
    expect(doc.sections.map((s) => s.id)).toEqual(["1"]);
  });
});

describe("variant B", () => {
  test("keeps the same questions and the correct option still points to the same text", () => {
    const a = exam([
      q({ points: 50, type: "multiple_choice", options: ["uno", "dos", "tres", "cuatro"], correctOption: 1 }),
      q({ points: 50, prompt: "Otra" }),
    ]);
    const b = makeVariantB(a, 3);
    expect(b.variant).toBe("B");
    expect(b.questions).toHaveLength(2);
    const mc = b.questions.find((x) => x.type === "multiple_choice")!;
    expect(mc.options[mc.correctOption!]).toBe("dos");
  });
});

describe("maps", () => {
  test("cleanEdges removes dangling, self and duplicate connections", () => {
    const m = cleanEdges({
      nodes: [
        { id: "a", label: "A", kind: "central", note: "", x: 0, y: 0 },
        { id: "b", label: "B", kind: "concept", note: "", x: 0, y: 0 },
      ],
      edges: [
        { id: "1", from: "a", to: "b", relation: "opposes" },
        { id: "2", from: "a", to: "b", relation: "opposes" },
        { id: "3", from: "a", to: "a", relation: "relates" },
        { id: "4", from: "a", to: "zzz", relation: "relates" },
      ],
    });
    expect(m.edges.map((e) => e.id)).toEqual(["1"]);
  });
});
