import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { BASE_MAPS, buildBaseMap } from "./base-maps";
import { bankRowFromQuestion, filterBank, questionFromBank } from "./bank";
import { edgeLogic, hiddenByCollapse, layoutArgument, mergeMap, searchNodes, toStudentExam, type ExamQuestion, type MapContent } from "./model";
import { mentionsRegistered } from "./thinkers";

const node = (id: string, kind: MapContent["nodes"][number]["kind"], label = id) => ({ id, label, kind, note: "", x: 0, y: 0 });

describe("base maps", () => {
  test("there are ten prepared maps covering the requested concepts", () => {
    assert.deepEqual(
      BASE_MAPS.map((b) => b.id),
      ["libertad", "justicia", "verdad", "conocimiento", "identidad", "poder", "responsabilidad", "causalidad", "conciencia", "etica"],
    );
  });
  test("every author node names a thinker registered in Kionas", () => {
    for (const b of BASE_MAPS) {
      for (const [, kind, es, en] of b.nodes) {
        if (kind === "author") assert.ok(mentionsRegistered(es), `${b.id}: ${es} / ${en}`);
      }
    }
  });
  test("a built map keeps every relation and gets fresh ids", () => {
    const b = BASE_MAPS[0];
    const m1 = buildBaseMap(b, "es");
    const m2 = buildBaseMap(b, "en");
    assert.equal(m1.edges.length, b.edges.length);
    assert.notEqual(m1.nodes[0].id, m2.nodes[0].id);
    assert.equal(m2.nodes[0].label, "Freedom");
  });
});

describe("argument maps", () => {
  test("support, contradiction and questioning are told apart; proximity is not logical", () => {
    assert.equal(edgeLogic("grounds"), "support");
    assert.equal(edgeLogic("infers"), "support");
    assert.equal(edgeLogic("opposes"), "contradiction");
    assert.equal(edgeLogic("questions"), "question");
    assert.equal(edgeLogic("relates"), "conceptual");
  });
  test("premises sit above inferences, which sit above the conclusion", () => {
    const m = layoutArgument({
      nodes: [node("c", "conclusion"), node("p", "premise"), node("i", "inference"), node("o", "objection")],
      edges: [],
    });
    const y = (id: string) => m.nodes.find((n) => n.id === id)!.y;
    assert.ok(y("p") < y("i") && y("i") < y("c") && y("c") < y("o"));
  });
});

describe("map navigation", () => {
  test("collapsing a node hides only neighbours connected to nothing else", () => {
    const m: MapContent = {
      nodes: [{ ...node("hub", "central"), collapsed: true }, node("leaf", "concept"), node("shared", "concept"), node("other", "concept")],
      edges: [
        { id: "1", from: "hub", to: "leaf", relation: "relates" },
        { id: "2", from: "hub", to: "shared", relation: "relates" },
        { id: "3", from: "other", to: "shared", relation: "relates" },
      ],
    };
    assert.deepEqual([...hiddenByCollapse(m)], ["leaf"]);
  });
  test("search ignores accents and case", () => {
    const m: MapContent = { nodes: [node("a", "concept", "Razón práctica"), node("b", "concept", "Deber")], edges: [] };
    assert.deepEqual([...searchNodes(m, "RAZON")], ["a"]);
  });
  test("adding nodes never duplicates an existing label nor drops original nodes", () => {
    const base: MapContent = { nodes: [node("a", "central", "Libertad")], edges: [] };
    const out = mergeMap(base, {
      nodes: [node("b", "concept", "libertad"), node("c", "concept", "Contrato")],
      edges: [{ id: "e", from: "a", to: "c", relation: "relates" }],
    });
    assert.deepEqual(out.nodes.map((n) => n.id), ["a", "c"]);
    assert.equal(out.edges.length, 1);
  });
});

describe("question bank", () => {
  const q: ExamQuestion = {
    id: "q1", type: "case", prompt: "Analiza el caso", caseText: "Un caso", options: [], correctOption: null,
    points: 20, answerLines: 6, answerGuide: "Respuesta esperada", rubric: [{ id: "r", criterion: "C", descriptor: "D", points: 20 }], teacherNotes: "Nota",
  };
  const meta = { concept: "Justicia", discipline: "Derecho", subject: "Ética", competency: "Argumentar", difficulty: "advanced" as const, sources: "", language: "es" as const };

  test("a saved question keeps its teacher key, but a student copy of a reused question has none", () => {
    const row = bankRowFromQuestion(q, meta);
    assert.equal(row.question.answerGuide, "Respuesta esperada");
    const reused = questionFromBank({ question: row.question, points: 15 });
    assert.notEqual(reused.id, q.id);
    assert.equal(reused.points, 15);
    const student = toStudentExam({ instructions: "", durationMin: 60, totalPoints: 15, questions: [reused], bibliography: "" });
    assert.equal(student.questions[0].answerGuide, "");
    assert.equal(student.questions[0].rubric.length, 0);
    assert.equal(student.questions[0].teacherNotes, "");
  });
  test("search and filters combine", () => {
    const items = [
      { ...bankRowFromQuestion(q, meta), review_status: "reviewed" as const },
      { ...bankRowFromQuestion({ ...q, type: "concept", prompt: "Define virtud" }, { ...meta, difficulty: "basic" }), review_status: "draft" as const },
    ];
    assert.equal(filterBank(items, { q: "virtud" }).length, 1);
    assert.equal(filterBank(items, { difficulty: "advanced", review: "reviewed" }).length, 1);
    assert.equal(filterBank(items, { type: "concept", difficulty: "advanced" }).length, 0);
  });
});

describe("placing new nodes", () => {
  test("a new node is placed where it does not overlap existing ones", async () => {
    const { findFreeSpot } = await import("./model");
    const nodes = [{ x: 600, y: 400 }, { x: 830, y: 400 }, { x: 600, y: 540 }];
    const p = findFreeSpot(nodes, { x: 600, y: 400 });
    assert.ok(nodes.every((n) => Math.abs(n.x - p.x) > 170 || Math.abs(n.y - p.y) > 56));
  });
});
