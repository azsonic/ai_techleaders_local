// @vitest-environment node
import { afterAll, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", async () => {
  const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
  return {
    ...actual,
    existsSync: (path: Parameters<typeof actual.existsSync>[0]) =>
      String(path).endsWith(".env.local") ? false : actual.existsSync(path),
  };
});

const originalLoadEnvFile = process.loadEnvFile;
const calls: string[] = [];
process.loadEnvFile = (path?: string) => {
  calls.push(String(path));
};

afterAll(() => {
  process.loadEnvFile = originalLoadEnvFile;
});

describe("next.config without a root env file", () => {
  it("does not load an env file", async () => {
    const loaded = await import("./next.config");

    expect(calls).toEqual([]);
    expect(loaded.default.cacheComponents).toBe(true);
  });
});
