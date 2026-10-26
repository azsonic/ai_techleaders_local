import { describe, expect, it } from "vitest";

import { sessionEnd, sessionPhase } from "./session-phase";

const START = "2026-11-13T09:00:00Z";

describe("sessionEnd", () => {
  it("adds the booked length", () => {
    expect(sessionEnd(START, 25)).toBe("2026-11-13T09:25:00.000Z");
    expect(sessionEnd(START, 50)).toBe("2026-11-13T09:50:00.000Z");
  });
});

describe("sessionPhase", () => {
  it("is upcoming before the start, live until the end and ended after", () => {
    expect(sessionPhase("2026-11-13T08:59:59Z", START, 25)).toBe("upcoming");
    expect(sessionPhase(START, START, 25)).toBe("live");
    expect(sessionPhase("2026-11-13T09:24:59Z", START, 25)).toBe("live");
    expect(sessionPhase("2026-11-13T09:25:00Z", START, 25)).toBe("ended");
  });
});
