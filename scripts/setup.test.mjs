// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const previousExitCode = process.exitCode;

afterEach(() => {
  process.exitCode = previousExitCode;
  vi.resetModules();
});

describe("scripts/setup.mjs", () => {
  it("runs main against the repo root and sets the exit code", async () => {
    const system = { fake: true };
    const main = vi.fn().mockResolvedValue(1);
    vi.doMock("./setup/main.mjs", () => ({ main }));
    vi.doMock("./setup/system.mjs", () => ({ createSystem: () => system }));

    await import("./setup.mjs");

    expect(main).toHaveBeenCalledTimes(1);
    const [options] = main.mock.calls[0];
    expect(options.system).toBe(system);
    expect(options.root.endsWith("/")).toBe(true);
    expect(process.exitCode).toBe(1);
  });
});
