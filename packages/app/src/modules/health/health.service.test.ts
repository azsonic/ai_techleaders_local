import { describe, expect, it, vi } from "vitest";

import { ServiceUnavailableError } from "@devmentor/core";
import type { HealthRepository } from "@devmentor/db";

import { HealthService } from "./health.service";

function service(ping: HealthRepository["ping"]) {
  return new HealthService({ healthRepository: { ping } as HealthRepository });
}

describe("HealthService", () => {
  it("reports ok when the database answers", async () => {
    await expect(service(vi.fn(async () => undefined)).check()).resolves.toEqual({ status: "ok", db: "ok" });
  });

  it("hides the driver error behind ServiceUnavailableError", async () => {
    const cause = new Error("connection refused");
    const check = service(async () => {
      throw cause;
    });

    await expect(check.check()).rejects.toMatchObject({
      name: "ServiceUnavailableError",
      code: "database_unavailable",
      message: "Database is unavailable",
      cause,
    });
    await expect(check.check()).rejects.toBeInstanceOf(ServiceUnavailableError);
  });
});
