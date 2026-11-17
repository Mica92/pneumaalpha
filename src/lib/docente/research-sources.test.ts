import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  canMarkVerified,
  defaultIntegrity,
  excerptForModel,
  formatCitation,
  joinPages,
  locateQuote,
  normalizeDoi,
  verifyQuotes,
} from "./sources";
import { DEPTH_INFO, asResearch, attachProvidedRefs, matrixToMap, normalizeMatrix, sectionsForDepth } from "./research";
import { analysisToDoc, normalizeAnalysis, normalizeClinic } from "./analysis";
import { conversionsFor, resolveConversion } from "./conversions";
import { materialToMarkdown } from "./markdown";
import { REGISTERED_THINKERS } from "./thinkers";

const body = joinPages([
  "La libertad no consiste en la ausencia de causas,\nsino en comprender la necesidad.",
  "Ningún gobierno puede ser legítimo si ignora el consentimiento de los gobernados.",
]);

describe("source integrity", () => {
  test("a document with text is provided; a bare DOI or link is a pending reference", () => {
    assert.equal(defaultIntegrity("pdf", true), "provided");
    assert.equal(defaultIntegrity("pasted", true), "provided");
    assert.equal(defaultIntegrity("doi", false), "pending");
    assert.equal(defaultIntegrity("url", false), "pending");
  });
  test("verified needs the teacher to declare both consultation and checked details", () => {
    const base = { title: "Ética", authors: "Spinoza", body: "x" };
    assert.equal(canMarkVerified({ ...base, consulted: true, detailsChecked: false }), false);
    assert.equal(canMarkVerified({ ...base, consulted: false, detailsChecked: true }), false);
    assert.equal(canMarkVerified({ ...base, authors: "", consulted: true, detailsChecked: true }), false);
    assert.equal(canMarkVerified({ ...base, consulted: true, detailsChecked: true }), true);
  });
  test("DOIs are normalised from URLs and prefixes; junk is rejected", () => {
    assert.equal(normalizeDoi("https://doi.org/10.1000/ABC.123"), "10.1000/abc.123");
    assert.equal(normalizeDoi("doi: 10.5555/xyz"), "10.5555/xyz");
    assert.equal(normalizeDoi("not a doi"), null);
  });
  test("citations come from the teacher's metadata", () => {
    const c = formatCitation({ title: "Tratado", authors: "Pérez, A.", year: "2020", container: "Revista X", doi: "10.1/x", url: "" }, "es");
    assert.equal(c, "Pérez, A.. (2020). *Tratado*. Revista X. https://doi.org/10.1/x".replace("A..", "A."));
  });
});

describe("quotations", () => {
  test("a real quotation is found and its page comes from the document", () => {
    assert.deepEqual(locateQuote(body, "Ningún gobierno puede ser legítimo si ignora el consentimiento"), { page: 2 });
    assert.deepEqual(locateQuote(body, "«no consiste en la ausencia de causas, sino en comprender»"), { page: 1 });
  });
  test("an invented quotation is discarded", () => {
    const v = verifyQuotes(body, [
      { text: "La libertad no consiste en la ausencia de causas", detail: "ok" },
      { text: "El hombre es la medida de todas las cosas y nada más", detail: "invented" },
    ]);
    assert.equal(v.items.length, 1);
    assert.equal(v.items[0].page, 1);
    assert.equal(v.dropped, 1);
  });
  test("pasted text without page markers never gets a page", () => {
    assert.deepEqual(locateQuote("Un texto pegado sin páginas que dice algo importante.", "sin páginas que dice algo"), { page: null });
  });
  test("long documents are cut for the model and report the last page sent", () => {
    const long = joinPages(Array.from({ length: 50 }, (_, i) => `Página ${i + 1} `.repeat(200)));
    const ex = excerptForModel(long, 20000);
    assert.equal(ex.truncated, true);
    assert.ok(ex.text.length <= 20000);
    assert.ok(ex.lastPage !== null && ex.lastPage < 50);
  });
});

describe("research desk", () => {
  test("depth decides the sections: 7 exploratory, 11 academic, all 14 exhaustive", () => {
    assert.equal(sectionsForDepth("exploratory").length, 7);
    assert.equal(sectionsForDepth("academic").length, 11);
    assert.equal(sectionsForDepth("exhaustive").length, 14);
    assert.ok(DEPTH_INFO.exhaustive.maxTokens > DEPTH_INFO.exploratory.maxTokens);
  });
  test("matrix authors must be registered thinkers", () => {
    const known = REGISTERED_THINKERS[0];
    const m = normalizeMatrix({ authors: [{ label: known }, { label: "Autor Inventado Zzyzx" }], meaning: ["Capacidad de obrar"] }, "Libertad");
    assert.ok(m);
    assert.deepEqual(m!.columns.authors.map((a) => a.label), [known]);
    assert.equal(m!.columns.meaning[0].claim, "philosophical");
  });
  test("an empty matrix is dropped", () => {
    assert.equal(normalizeMatrix({ meaning: [] }, "x"), null);
  });
  test("matrix map: objections oppose the concept, assumptions are presupposed by it", () => {
    const m = normalizeMatrix({ objections: ["Determinismo"], assumptions: ["Sujeto racional"] }, "Libertad")!;
    const map = matrixToMap(m);
    const centre = map.nodes.find((n) => n.kind === "central")!;
    const obj = map.nodes.find((n) => n.label === "Determinismo")!;
    const asm = map.nodes.find((n) => n.label === "Sujeto racional")!;
    assert.ok(map.edges.some((e) => e.from === obj.id && e.to === centre.id && e.relation === "opposes"));
    assert.ok(map.edges.some((e) => e.from === centre.id && e.to === asm.id && e.relation === "presupposes"));
  });
  test("asResearch keeps the matrix next to the sections", () => {
    const m = normalizeMatrix({ meaning: ["a"] }, "c");
    const r = asResearch({ sections: [], matrix: m });
    assert.ok(r.matrix);
  });
  test("teacher sources are added to the bibliography as provided, never verified", () => {
    const secs = attachProvidedRefs(
      [
        { id: "1", key: "synthesis", title: "S", body: "", audience: "all", epistemic: "conceptual", sources: [] },
        { id: "2", key: "bibliography", title: "B", body: "", audience: "all", epistemic: "conceptual", sources: [] },
      ],
      ["Pérez (2020). *Tratado*"],
    );
    assert.equal(secs[1].sources[0].status, "provided");
    assert.equal(secs[0].sources.length, 0);
  });
  test("research converts into guide, map, exam and class, and has no student version", () => {
    const targets = new Set(conversionsFor("research").map((c) => c.to));
    for (const k of ["guide", "map", "exam", "class"] as const) assert.ok(targets.has(k));
    assert.equal(resolveConversion("concept_card", "research", "guide")?.id, "concept_card");
    const md = materialToMarkdown(
      { title: "T", kind: "research", language: "es" },
      { sections: [{ id: "1", key: "x", title: "Nota", body: "privado", audience: "teacher", epistemic: "pedagogical", sources: [] }], matrix: normalizeMatrix({ meaning: ["m"] }, "c") },
      "teacher",
    );
    assert.ok(md.includes("Matriz conceptual") && md.includes("privado"));
  });
});

describe("argument clinic", () => {
  test("clinic results are kept in the saved guide", () => {
    const a = normalizeAnalysis({ thesis: [{ text: "T", status: "debatable" }] });
    a.clinic = [normalizeClinic("steelman", { title: "Versión fuerte", intro: "Intro", items: [{ text: "P1", detail: "d" }] })];
    const doc = analysisToDoc(a, "es");
    const s = doc.sections.find((x) => x.key === "clinic_steelman");
    assert.ok(s && s.body.includes("P1") && s.title.includes("Steelman"));
  });
  test("empty items are dropped and the input is remembered", () => {
    const r = normalizeClinic("assumption_test", { items: [{ text: "" }, "Cae la conclusión"] }, "P1 → solo algunos casos");
    assert.equal(r.items.length, 1);
    assert.equal(r.input, "P1 → solo algunos casos");
  });
});
