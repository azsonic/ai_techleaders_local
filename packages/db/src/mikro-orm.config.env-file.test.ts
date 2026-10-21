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

describe("mikro-orm CLI config with a root env file", () => {
  it("loads the root env file", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/devmentor";
    await import("./mikro-orm.config");

    expect(calls.some((path) => path.endsWith(".env.local"))).toBe(true);
  });
});
