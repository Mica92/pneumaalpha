import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assessmentWeights, cleanDistractors, curriculumLoad, higherOrderShare, normalizeQuality, specCell, specMatrix } from "./planning";
import { auditExam, toStudentExam, type ExamContent, type ExamQuestion } from "./model";
import { conversionsFor, resolveConversion } from "./conversions";

const q = (p: Partial<ExamQuestion>): ExamQuestion => ({
  id: Math.random().toString(36), type: "concept", prompt: "P " + Math.random(), caseText: "", options: [], correctOption: null,
  points: 10, answerLines: 4, answerGuide: "g", rubric: [], teacherNotes: "", ...p,
});
const exam = (questions: ExamQuestion[]): ExamContent => ({ instructions: "", durationMin: 300, totalPoints: questions.reduce((s, x) => s + x.points, 0), questions, bibliography: "b" });

describe("specification matrix", () => {
  it("cross-tabs type × level with counts and points, keeping unclassified apart", () => {
    const m = specMatrix(exam([q({ cognitive: "remember", points: 5 }), q({ cognitive: "remember", points: 7 }), q({ type: "essay", cognitive: "evaluate", points: 20 }), q({ points: 3 })]));
    assert.deepEqual(specCell(m, "concept", "remember"), { count: 2, points: 12 });
    assert.deepEqual(specCell(m, "essay", "evaluate"), { count: 1, points: 20 });
    assert.deepEqual(m.unclassified, { count: 1, points: 3 });
    assert.deepEqual(m.total, { count: 4, points: 35 });
    assert.ok(Math.abs((higherOrderShare(m) ?? 0) - 20 / 32) < 1e-9);
  });
  it("warns when ≥3 classified questions have no higher-order level", () => {
    const codes = auditExam(exam([q({ cognitive: "remember" }), q({ cognitive: "understand" }), q({ cognitive: "apply" })])).map((i) => i.code);
    assert.ok(codes.includes("no_higher_order"));
    const ok = auditExam(exam([q({ cognitive: "remember" }), q({ cognitive: "understand" }), q({ cognitive: "analyze" })])).map((i) => i.code);
    assert.ok(!ok.includes("no_higher_order"));
  });
  it("student copy carries no answers even with cognitive levels", () => {
    const s = toStudentExam(exam([q({ cognitive: "evaluate", answerGuide: "secret", teacherNotes: "n" })]));
    assert.equal(s.questions[0].answerGuide, "");
    assert.equal(s.questions[0].teacherNotes, "");
  });
});

describe("curriculum", () => {
  it("computes sessions and contact hours", () => {
    assert.deepEqual(curriculumLoad({ weeks: 16, sessionsPerWeek: 2, sessionMinutes: 90 }), { sessions: 32, hours: 48 });
  });
  it("reads assessment weights and their sum", () => {
    const r = assessmentWeights("- Prueba 1 — 30%\n- Ensayo: 40 %\n- Presentación — 30%\nTexto libre");
    assert.equal(r.items.length, 3);
    assert.equal(r.sum, 100);
    const nested = assessmentWeights("- Caso — 40%\n  - **Criterios:** Rigor 50%; claridad 50%\n- Ensayo — 60%");
    assert.equal(nested.sum, 100);
  });
  it("syllabus converts into classes, guides, exams and maps; not the reverse via class", () => {
    assert.deepEqual(conversionsFor("curriculum").map((c) => c.to).sort(), ["class", "class", "exam", "guide", "map"]);
    assert.notEqual(resolveConversion("curriculum_sequence", "curriculum", "class"), null);
    assert.equal(resolveConversion("curriculum_sequence", "guide", "class"), null);
    assert.notEqual(resolveConversion("build_curriculum", "research", "curriculum"), null);
  });
});

describe("quality report and distractors", () => {
  it("keeps known dimensions once, in order, and defaults unknown status to attention", () => {
    const r = normalizeQuality({ overview: "x", findings: [{ dimension: "clarity", status: "weird", summary: "s" }, { dimension: "fake" }, { dimension: "conceptual_rigor", status: "ok" }, { dimension: "clarity", status: "ok" }] });
    assert.deepEqual(r.findings.map((f) => f.dimension), ["conceptual_rigor", "clarity"]);
    assert.equal(r.findings[1].status, "attention");
  });
  it("drops distractors that repeat existing options or the answer", () => {
    assert.deepEqual(cleanDistractors(["Kant", " kant ", "Hume?", "", 3, "Platón"], ["Platón", "Aristóteles"]), ["Kant", "Hume?"]);
  });
});
