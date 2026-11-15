import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { conversionsFor, isSourceNewer, resolveConversion } from "./conversions";

describe("conversions", () => {
  test("a guide can become an exam, a map and a class", () => {
    const targets = new Set(conversionsFor("guide").map((c) => c.to));
    assert.ok(targets.has("exam") && targets.has("map") && targets.has("class"));
  });
  test("an exam offers a review guide", () => {
    assert.ok(conversionsFor("exam").some((c) => c.id === "review_guide"));
  });
  test("a conversion is rejected for the wrong source or target kind", () => {
    assert.equal(resolveConversion("review_guide", "guide", "guide"), null);
    assert.equal(resolveConversion("to_exam", "guide", "map"), null);
    assert.equal(resolveConversion("unknown", "guide", "exam"), null);
    assert.equal(resolveConversion("to_exam", "guide", "exam")?.id, "to_exam");
  });
  test("outdated only when the source changed after syncing", () => {
    assert.equal(isSourceNewer("2026-01-02T00:00:00Z", "2026-01-01T00:00:00Z"), true);
    assert.equal(isSourceNewer("2026-01-01T00:00:00Z", "2026-01-01T00:00:00Z"), false);
    assert.equal(isSourceNewer("2026-01-02T00:00:00Z", null), false);
  });
});
