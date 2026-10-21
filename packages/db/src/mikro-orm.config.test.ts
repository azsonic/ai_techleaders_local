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

describe("mikro-orm CLI config without a root env file", () => {
  it("does not load an env file and still exposes migrations", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/devmentor";
    const loaded = await import("./mikro-orm.config");
    const config = loaded.default as { extensions: unknown[]; migrations: { path: string; pathTs: string } };

    expect(calls).toEqual([]);
    expect(config.extensions).toHaveLength(1);
    expect(config.migrations.path).toMatch(/migrations$/);
    expect(config.migrations.pathTs).toBe(config.migrations.path);
  });
});
