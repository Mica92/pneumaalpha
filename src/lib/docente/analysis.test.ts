import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { analysisToDoc, analysisToMap, isEmptyAnalysis, normalizeAnalysis } from "./analysis";

const raw = {
  title: "Libre albedrío",
  thesis: [{ text: "La libertad es una ilusión", status: "debatable" }],
  explicit_premises: [{ text: "Todo evento tiene causa", status: "plausible" }],
  objections: [{ text: "La causalidad no excluye la autonomía", status: "weird" }],
  questions: ["¿Qué entendemos por causa?"],
};

describe("reasoning analyzer", () => {
  test("unknown statuses become debatable and strings become items", () => {
    const a = normalizeAnalysis(raw);
    assert.equal(a.dimensions.objections[0].status, "debatable");
    assert.equal(a.dimensions.questions[0].text, "¿Qué entendemos por causa?");
    assert.equal(a.dimensions.inferences.length, 0);
  });
  test("an empty model answer is detected", () => {
    assert.equal(isEmptyAnalysis(normalizeAnalysis({})), true);
    assert.equal(isEmptyAnalysis(normalizeAnalysis(raw)), false);
  });
  test("teacher notes only reach the teacher version", () => {
    const a = normalizeAnalysis(raw);
    a.notes.thesis = "Revisar con el curso";
    const doc = analysisToDoc(a, "es");
    const note = doc.sections.find((s) => s.key === "thesis_note");
    assert.equal(note?.audience, "teacher");
    assert.ok(doc.sections.filter((s) => s.audience === "all").every((s) => !s.body.includes("Revisar con el curso")));
  });
  test("premises support the thesis and objections oppose it", () => {
    const m = analysisToMap(normalizeAnalysis(raw), "es");
    const thesis = m.nodes.find((n) => n.kind === "central")!;
    const premise = m.nodes.find((n) => n.label === "Todo evento tiene causa")!;
    const objection = m.nodes.find((n) => n.kind === "objection")!;
    assert.ok(m.edges.some((e) => e.from === premise.id && e.to === thesis.id && e.relation === "grounds"));
    assert.ok(m.edges.some((e) => e.from === objection.id && e.to === thesis.id && e.relation === "opposes"));
  });
});

describe("argument map size", () => {
  test("never more than 16 nodes, so the map stays readable", () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ text: `Elemento ${i}`, status: "plausible" }));
    const raw = Object.fromEntries(["thesis", "explicit_premises", "implicit_premises", "evidence", "weaknesses", "objections", "alternatives", "questions"].map((k) => [k, many]));
    assert.ok(analysisToMap(normalizeAnalysis(raw), "es").nodes.length <= 16);
  });
});
