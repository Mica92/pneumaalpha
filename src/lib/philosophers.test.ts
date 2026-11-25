import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { PHILOSOPHERS } from "@/lib/philosophers";
import { portraitOf, profileOf } from "@/lib/portraits";
import { sceneOf } from "@/lib/scenes";
import { centralQuestion, facetOf } from "@/lib/discovery";
import { HOW_IT_WORKS_COPY } from "@/components/how-it-works";

describe("philosophers registry and count concordance", () => {
  test("registers Adam Smith with portrait, scene, profile, and discovery metadata", () => {
    assert.equal(PHILOSOPHERS.smith.name, "Adam Smith");
    assert.ok(portraitOf("smith"));
    assert.ok(sceneOf("smith"));
    assert.equal(profileOf("smith")?.years, "1723 – 1790");
    assert.match(centralQuestion("smith", "es"), /espectador imparcial/);
    assert.equal(facetOf("smith").year, 1723);
  });

  test("keeps the philosopher count in HowItWorks synchronized with the registry", () => {
    const count = Object.keys(PHILOSOPHERS).length;
    assert.equal(count, 76);
    assert.match(HOW_IT_WORKS_COPY.es.items[0].text, new RegExp(`${count} filósofos`));
    assert.match(HOW_IT_WORKS_COPY.en.items[0].text, new RegExp(`${count} philosophers`));
  });
});