import { describe, expect, test } from "bun:test";
import { contrastSelection, dialogueHistory, TRADITION_PAGE_SIZE } from "./dialogos.shared";

describe("philosophical dialogue rules", () => {
  test("comparison retains both traditions chosen in the catalog", () => {
    expect(contrastSelection("budismo", "estoicismo")).toEqual(["budismo", "estoicismo"]);
  });
  test("comparison retains three distinct valid traditions at most", () => {
    expect(contrastSelection("budismo", "budismo,estoicismo,platonismo,aristotelismo,unknown"))
      .toEqual(["budismo", "estoicismo", "platonismo"]);
  });
  test("history leaves space for a question and its answer within forty messages", () => {
    const messages = Array.from({ length: 40 }, (_, index) => index);
    const history = dialogueHistory(messages);
    expect(history).toEqual(messages.slice(2));
    expect([...history, 40, 41]).toHaveLength(40);
  });
  test("catalog pages contain eight traditions", () => {
    expect(TRADITION_PAGE_SIZE).toBe(8);
  });
});