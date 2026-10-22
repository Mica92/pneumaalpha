import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { contrastSelection, dialogueHistory, TRADITION_PAGE_SIZE } from "./dialogos.shared";

describe("philosophical dialogue rules", () => {
  test("comparison retains both traditions chosen in the catalog", () => {
    assert.deepEqual(contrastSelection("budismo", "estoicismo"), ["budismo", "estoicismo"]);
  });
  test("comparison retains three distinct valid traditions at most", () => {
    assert.deepEqual(contrastSelection("budismo", "budismo,estoicismo,platonismo,aristotelismo,unknown"), ["budismo", "estoicismo", "platonismo"]);
  });
  test("history leaves space for a question and its answer within forty messages", () => {
    const messages = Array.from({ length: 40 }, (_, index) => index);
    const history = dialogueHistory(messages);
    assert.deepEqual(history, messages.slice(2));
    assert.equal([...history, 40, 41].length, 40);
  });
  test("catalog pages contain eight traditions", () => {
    assert.equal(TRADITION_PAGE_SIZE, 8);
  });
});