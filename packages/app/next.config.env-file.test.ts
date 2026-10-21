// @vitest-environment node
import { afterAll, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", async () => {
  const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
  return {
    ...actual,
    existsSync: (path: Parameters<typeof actual.existsSync>[0]) =>
      String(path).endsWith(".env.local") ? true : actual.existsSync(path),
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

describe("next.config with a root env file", () => {
  it("loads the root env file", async () => {
    const loaded = await import("./next.config");

    expect(loaded.default.cacheComponents).toBe(true);
    expect(calls.some((path) => path.endsWith(".env.local"))).toBe(true);
  });
});
