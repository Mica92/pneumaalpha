import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeInsights,
  countPendingRefs,
  creditTick,
  estimatedCost,
  headerFromPreferences,
  headerMarkdown,
  normalizeTags,
  reviewCounts,
  sameConcept,
  DEFAULT_PREFERENCES,
  type InsightMaterial,
} from "./insights";
import { materialToMarkdown } from "./markdown";
import { normalizeQuality } from "./planning";

const mat = (p: Partial<InsightMaterial> & { id: string }): InsightMaterial => ({
  kind: "guide", review_status: "draft", source_material_id: null, conversion: "", created_at: "2026-11-10T10:00:00Z", ready_at: null, archived_at: null, ...p,
});

describe("Teaching Insights", () => {
  const materials = [
    mat({ id: "a", review_status: "reviewed", ready_at: "2026-11-12T00:00:00Z" }),
    mat({ id: "b", kind: "exam", source_material_id: "a", conversion: "to_exam", review_status: "reviewed", ready_at: "2026-11-13T00:00:00Z" }),
    mat({ id: "c", source_material_id: "a" }),
    mat({ id: "d", kind: "map", created_at: "2026-01-01T00:00:00Z" }),
  ];
  const work = [
    { material_id: "a", day: "2026-11-10", seconds: 1200 },
    { material_id: "a", day: "2026-11-11", seconds: 600 },
    { material_id: "b", day: "2026-11-12", seconds: 900 },
    { material_id: "d", day: "2026-01-01", seconds: 3600 },
  ];
  it("counts creation, reuse (converted vs duplicated) and ready materials in the period", () => {
    const r = computeInsights(materials, work, "2026-11-01T00:00:00Z");
    assert.equal(r.created, 3);
    assert.deepEqual(r.reusedBy, { duplicated: 1, converted: 1 });
    assert.deepEqual(r.ready, { guide: 1, exam: 1 });
    assert.equal(r.mapsCreated, 0);
    assert.equal(r.trackedSeconds, 2700);
  });
  it("median time to ready uses all logged time of ready materials", () => {
    const r = computeInsights(materials, work, null);
    assert.deepEqual(r.medianToReady.guide, { seconds: 1800, n: 1 });
    assert.equal(r.trackedSeconds, 6300);
    assert.equal(r.mapsCreated, 1);
  });
  it("cost is time × rate and null without a rate", () => {
    assert.equal(estimatedCost(5400, 20000), 30000);
    assert.equal(estimatedCost(5400, null), null);
  });
  it("only credits time while visible and recently active", () => {
    assert.equal(creditTick(100_000, 50_000, true, 15_000), 15);
    assert.equal(creditTick(200_000, 50_000, true, 15_000), 0);
    assert.equal(creditTick(100_000, 90_000, false, 15_000), 0);
  });
  it("counts references pending verification", () => {
    assert.equal(countPendingRefs({ sections: [{ sources: [{ status: "pending" }, { status: "verified" }] }, { sources: [{ status: "pending" }] }] }), 2);
    assert.equal(countPendingRefs({ nodes: [] }), 0);
  });
});

describe("templates and header", () => {
  it("no header when the teacher filled nothing, never invented", () => {
    assert.equal(headerFromPreferences(DEFAULT_PREFERENCES), undefined);
    const md = materialToMarkdown({ title: "T", kind: "guide", language: "es" }, { sections: [] }, "student");
    assert.ok(md.startsWith("# T"));
  });
  it("institutional template lists only filled fields", () => {
    const h = headerFromPreferences({ ...DEFAULT_PREFERENCES, template: "institutional", institution: "Universidad X", teacher_name: "M. N." })!;
    const lines = headerMarkdown(h, "es").join("\n");
    assert.ok(lines.includes("Universidad X") && lines.includes("M. N."));
    assert.ok(!lines.includes("Facultad"));
    const md = materialToMarkdown({ title: "Examen", kind: "exam", language: "es", header: h }, { questions: [] }, "student");
    assert.ok(md.indexOf("Universidad X") < md.indexOf("# Examen"));
  });
  it("hidden when show_header is off", () => {
    assert.equal(headerFromPreferences({ ...DEFAULT_PREFERENCES, institution: "U", show_header: false }), undefined);
  });
});

describe("library and reviews", () => {
  it("normalizes tags", () => {
    assert.deepEqual(normalizeTags(["#Ética", "ética", "  libertad  ", "", 3]), ["Ética", "libertad"]);
    assert.equal(normalizeTags(Array.from({ length: 30 }, (_, i) => `t${i}`)).length, 20);
  });
  it("finds other materials on the same concept, excluding linked and archived", () => {
    const all = [
      { id: "1", concept: "Libertad", archived_at: null },
      { id: "2", concept: "libertad ", archived_at: null },
      { id: "3", concept: "Libertád", archived_at: "x" },
      { id: "4", concept: "Libertad", archived_at: null },
      { id: "5", concept: "Justicia", archived_at: null },
    ];
    assert.deepEqual(sameConcept({ id: "1", concept: "Libertad" }, all, ["4"]).map((x) => x.id), ["2"]);
  });
  it("review counts ignore ok findings and default to pending", () => {
    const f = [{ dimension: "clarity", status: "attention" }, { dimension: "sources", status: "problem" }, { dimension: "plurality", status: "ok" }];
    assert.deepEqual(reviewCounts(f, { sources: "addressed" }), { pending: 1, addressed: 1, dismissed: 0 });
  });
  it("quality report keeps a short excerpt and the editorial dimension", () => {
    const r = normalizeQuality({ findings: [{ dimension: "editorial", status: "attention", excerpt: "  texto  " }] });
    assert.equal(r.findings[0].excerpt, "texto");
  });
});
