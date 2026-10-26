// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const previousExitCode = process.exitCode;

afterEach(() => {
  process.exitCode = previousExitCode;
  vi.resetModules();
});

describe("scripts/check-tokens.mjs", () => {
  it("checks the repo root and sets the exit code", async () => {
    const main = vi.fn().mockReturnValue(1);
    vi.doMock("./check-tokens/check.mjs", () => ({ main }));

    await import("./check-tokens.mjs");

    expect(main).toHaveBeenCalledTimes(1);
    expect(main.mock.calls[0][0].endsWith("/")).toBe(true);
    expect(process.exitCode).toBe(1);
  });
});
