import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { invalidLeadFields, LEAD_MAX_PER_HOUR, LeadSchema, looksAutomated } from "./leads.shared";

const valid = {
  fullName: "Ana Rojas",
  email: "Ana.Rojas@Universidad.cl ",
  institution: "Universidad de Ejemplo",
  jobTitle: "Directora de innovación",
  country: "Chile",
  message: "Queremos conversar sobre un piloto.",
  consent: true,
  website: "",
  elapsedMs: 12_000,
};

describe("institutional demo requests", () => {
  test("a complete request is accepted and the email is normalised", () => {
    const lead = LeadSchema.parse(valid);
    assert.equal(lead.email, "ana.rojas@universidad.cl");
    assert.equal(lead.interest, "demo");
  });
  test("name, email, institution, role and country are required", () => {
    const fields = invalidLeadFields({ ...valid, fullName: "", email: "no", institution: " ", jobTitle: "", country: "" });
    assert.deepEqual(fields.sort(), ["country", "email", "fullName", "institution", "jobTitle"]);
  });
  test("the privacy notice must be accepted", () => {
    assert.deepEqual(invalidLeadFields({ ...valid, consent: false }), ["consent"]);
  });
  test("a filled hidden field or a submission under three seconds is treated as automated", () => {
    assert.equal(looksAutomated({ website: "http://spam", elapsedMs: 20_000 }), true);
    assert.equal(looksAutomated({ website: "", elapsedMs: 2_999 }), true);
    assert.equal(looksAutomated({ website: "", elapsedMs: 3_000 }), false);
  });
  test("at most five requests per hour from the same origin", () => {
    assert.equal(LEAD_MAX_PER_HOUR, 5);
  });
});
