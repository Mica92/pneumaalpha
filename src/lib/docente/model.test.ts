import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { materialToMarkdown } from "./markdown";
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
    assert.deepEqual(distributeInteger(100, [1, 1, 1]), [34, 33, 33]);
    assert.equal(distributeInteger(100, [3, 1]).reduce((a, b) => a + b, 0), 100);
  });

  test("rebalancing makes questions sum to 100 and each rubric sum to its question", () => {
    const e = rebalanceExamPoints(exam([q({ points: 30 }), q({ points: 30 }), q({ points: 10 })]));
    assert.equal(examPointsSum(e), 100);
    for (const question of e.questions) {
      assert.equal(question.rubric.reduce((s, c) => s + c.points, 0), question.points);
    }
  });

  test("auditor flags an exam whose points do not match the total", () => {
    const issues = auditExam(exam([q({ points: 40 }), q({ points: 40 })]));
    assert.equal(issues.some((i) => i.code === "points_total" && i.severity === "error"), true);
  });

  test("auditor flags repeated questions and multiple choice without a correct answer", () => {
    const issues = auditExam(
      exam([
        q({ points: 50 }),
        q({ points: 50, type: "multiple_choice", prompt: "identifica la tesis", options: ["a", "b", "c"], rubric: [] }),
      ]),
    );
    assert.equal(issues.some((i) => i.code === "duplicate"), true);
    assert.equal(issues.some((i) => i.code === "mc_no_answer"), true);
  });
});

describe("student versions", () => {
  test("student exam never carries answers, rubrics, correct options or teacher notes", () => {
    const s = toStudentExam(
      exam([q({ points: 50 }), q({ points: 50, type: "multiple_choice", options: ["a", "b", "c"], correctOption: 2 })]),
    );
    const json = JSON.stringify(s);
    assert.ok(!json.includes("La tesis es"));
    assert.ok(!json.includes("Nota privada"));
    assert.ok(!json.includes("Reconstruye"));
    assert.ok(!json.includes("Kant, Crítica"));
    assert.equal(s.questions.every((x) => x.correctOption === null && x.rubric.length === 0), true);
  });

  test("student guide drops teacher-only sections", () => {
    const doc = toStudentDoc({
      sections: [
        { id: "1", key: "intro", title: "Intro", body: "x", audience: "all", epistemic: "conceptual", sources: [] },
        { id: "2", key: "notes", title: "Pauta", body: "y", audience: "teacher", epistemic: "pedagogical", sources: [] },
      ],
    });
    assert.deepEqual(doc.sections.map((s) => s.id), ["1"]);
  });
});

describe("printable student copy", () => {
  test("student exam markdown has no expected answers, rubrics or teacher notes", () => {
    const e = exam([q({ points: 100 })]);
    const md = materialToMarkdown({ title: "Prueba", kind: "exam", language: "es" }, e, "student");
    assert.ok(md.includes("Identifica la tesis"));
    assert.ok(!md.includes("La tesis es"));
    assert.ok(!md.includes("Nota privada"));
    assert.ok(!md.includes("Reconstruye"));
    const teacher = materialToMarkdown({ title: "Prueba", kind: "exam", language: "es" }, e, "teacher");
    assert.ok(teacher.includes("La tesis es"));
  });
});

describe("variant B", () => {
  test("keeps the same questions and the correct option still points to the same text", () => {
    const a = exam([
      q({ points: 50, type: "multiple_choice", options: ["uno", "dos", "tres", "cuatro"], correctOption: 1 }),
      q({ points: 50, prompt: "Otra" }),
    ]);
    const b = makeVariantB(a, 3);
    assert.equal(b.variant, "B");
    assert.equal(b.questions.length, 2);
    const mc = b.questions.find((x) => x.type === "multiple_choice")!;
    assert.equal(mc.options[mc.correctOption!], "dos");
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
    assert.deepEqual(m.edges.map((e) => e.id), ["1"]);
  });
});

import { filterBibliography, mentionsRegistered } from "./thinkers";

describe("registered thinkers only", () => {
  const names = ["Kant", "William James", "Nietzsche"];
  test("a reference is kept only when it cites a registered thinker", () => {
    assert.equal(mentionsRegistered("Immanuel Kant, Fundamentación de la metafísica de las costumbres", names), true);
    assert.equal(mentionsRegistered("James, Principios de psicología", names), true);
    assert.equal(mentionsRegistered("Isaiah Berlin, Dos conceptos de libertad", names), false);
  });
  test("bibliography drops list items by unregistered authors", () => {
    const out = filterBibliography("- Kant, Crítica de la razón pura\n- Berlin, Dos conceptos de libertad", names);
    assert.ok(out.includes("Kant"));
    assert.ok(!out.includes("Berlin"));
  });
});
