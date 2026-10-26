import { describe, expect, it } from "vitest";

import { PRICE_BOUNDS, formatPln, stackLabel, type Stack } from "./pricing";

describe("pricing", () => {
  it("states the R05 bounds", () => {
    expect(PRICE_BOUNDS[25]).toEqual({ min: 90, max: 600 });
    expect(PRICE_BOUNDS[50]).toEqual({ min: 180, max: 1200 });
  });

  it("formats whole zloty with the currency", () => {
    expect(formatPln(90)).toBe("90 PLN");
  });

  it("names each stack and falls back to the raw value for an unknown one", () => {
    expect(stackLabel("ai-agents")).toBe("AI agents");
    expect(stackLabel("go" as Stack)).toBe("go");
  });
});
