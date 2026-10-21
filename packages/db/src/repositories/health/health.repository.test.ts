import type { EntityManager } from "@mikro-orm/postgresql";
import { describe, expect, it, vi } from "vitest";

import { HealthRepository } from "./health.repository";

describe("HealthRepository", () => {
  it("pings the database with select 1", async () => {
    const execute = vi.fn(async () => []);
    const repository = new HealthRepository({ em: { execute } as unknown as EntityManager });

    await repository.ping();

    expect(execute).toHaveBeenCalledWith("select 1");
  });

  it("propagates a failed ping", async () => {
    const execute = vi.fn(async () => {
      throw new Error("connection refused");
    });
    const repository = new HealthRepository({ em: { execute } as unknown as EntityManager });

    await expect(repository.ping()).rejects.toThrow("connection refused");
  });
});
