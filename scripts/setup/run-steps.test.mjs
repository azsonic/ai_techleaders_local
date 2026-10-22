// @vitest-environment node
import { describe, expect, it } from "vitest";

import { runAlways, runSteps } from "./run-steps.mjs";

const step = (title, { skip = null, detail, fail } = {}) => ({
  title,
  check: async () => skip,
  run: async () => {
    if (fail !== undefined) {
      throw fail;
    }
    return detail;
  },
});

describe("runSteps", () => {
  it("prints done lines with optional detail and returns 0", async () => {
    const lines = [];
    const code = await runSteps([step("One", { detail: "ok" }), step("Two")], { log: (l) => lines.push(l) });
    expect(code).toBe(0);
    expect(lines).toEqual(["[done]    One (ok)", "[done]    Two"]);
  });

  it("prints skipped lines with the reason", async () => {
    const lines = [];
    const code = await runSteps([step("One", { skip: "already there" })], { log: (l) => lines.push(l) });
    expect(code).toBe(0);
    expect(lines).toEqual(["[skipped] One (already there)"]);
  });

  it("stops at the first failure, shows the cause and returns 1", async () => {
    const lines = [];
    const later = { title: "Later", check: async () => null, run: async () => lines.push("ran later") };
    const code = await runSteps([step("Bad", { fail: new Error("boom") }), later], { log: (l) => lines.push(l) });
    expect(code).toBe(1);
    expect(lines).toEqual(["[failed]  Bad", "          boom"]);
  });

  it("counts a throwing check as a failure and copes with non-Error values", async () => {
    const lines = [];
    const broken = { title: "Check", check: async () => Promise.reject("plain text"), run: async () => {} };
    expect(await runSteps([broken], { log: (l) => lines.push(l) })).toBe(1);
    expect(lines).toEqual(["[failed]  Check", "          plain text"]);
  });
});

describe("runAlways", () => {
  it("never reports a skip reason", async () => {
    expect(await runAlways()).toBeNull();
  });
});
