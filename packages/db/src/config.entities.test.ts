import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./entities", () => ({
  entities: [{ name: "User" }],
}));

import { createOrmConfig } from "./config";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("createOrmConfig with registered entities", () => {
  it("asks MikroORM to warn if discovery then finds nothing", () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/devmentor";

    const config = createOrmConfig() as { discovery: { warnWhenNoEntities: boolean } };

    expect(config.discovery.warnWhenNoEntities).toBe(true);
  });
});
