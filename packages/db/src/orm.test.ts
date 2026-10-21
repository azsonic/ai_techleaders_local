import { beforeEach, describe, expect, it, vi } from "vitest";

const init = vi.hoisted(() => vi.fn());

vi.mock("@mikro-orm/postgresql", async () => {
  const actual = await vi.importActual<typeof import("@mikro-orm/postgresql")>("@mikro-orm/postgresql");
  actual.MikroORM.init = init as typeof actual.MikroORM.init;
  return actual;
});

import { getOrm, HealthRepository } from "./index";

beforeEach(() => {
  init.mockReset();
  delete (globalThis as { __devmentorOrm?: unknown }).__devmentorOrm;
  process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/devmentor";
});

describe("getOrm", () => {
  it("initialises once and reuses the cached instance", async () => {
    const orm = { name: "orm" };
    init.mockResolvedValue(orm);

    await expect(getOrm()).resolves.toBe(orm);
    await expect(getOrm()).resolves.toBe(orm);
    expect(init).toHaveBeenCalledOnce();
    expect(HealthRepository).toEqual(expect.any(Function));
  });

  it("clears the cache when initialisation fails so the next call can retry", async () => {
    init.mockRejectedValueOnce(new Error("connection refused"));
    await expect(getOrm()).rejects.toThrow("connection refused");

    const orm = { name: "orm" };
    init.mockResolvedValueOnce(orm);
    await expect(getOrm()).resolves.toBe(orm);
    expect(init).toHaveBeenCalledTimes(2);
  });
});
