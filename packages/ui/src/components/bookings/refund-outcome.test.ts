import { describe, expect, it } from "vitest";

import { REFUND_OUTCOME_TEXT } from "./refund-outcome";

describe("REFUND_OUTCOME_TEXT", () => {
  it("never says money was already refunded", () => {
    for (const text of Object.values(REFUND_OUTCOME_TEXT)) {
      expect(text).not.toMatch(/you have been refunded|was refunded/i);
    }
    expect(REFUND_OUTCOME_TEXT.full).toContain("due when payments process");
    expect(REFUND_OUTCOME_TEXT.none).toContain("no refund");
  });
});
