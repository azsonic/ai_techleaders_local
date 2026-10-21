import { beforeEach, describe, expect, it, vi } from "vitest";

const getOrm = vi.hoisted(() => vi.fn());

vi.mock("@devmentor/db", async () => {
  const actual = await vi.importActual<typeof import("@devmentor/db")>("@devmentor/db");
  return { ...actual, getOrm };
});

async function loadContainer() {
  vi.resetModules();
  const container = await import("./container");
  const { HealthService } = await import("@/modules/health/health.service");
  const { ServiceUnavailableError } = await import("@devmentor/core");
  return { ...container, HealthService, ServiceUnavailableError };
}

beforeEach(() => {
  getOrm.mockReset();
});

describe("request scope", () => {
  it("forks the entity manager once per scope and reuses the root container", async () => {
    const fork = vi.fn(() => ({ id: "fork" }));
    getOrm.mockResolvedValue({ em: { fork } });
    const { createRequestScope, HealthService } = await loadContainer();

    const first = await createRequestScope();
    const second = await createRequestScope();

    expect(getOrm).toHaveBeenCalledOnce();
    expect(fork).toHaveBeenCalledTimes(2);
    expect(first.cradle.em).toEqual({ id: "fork" });
    expect(first.cradle.healthService).toBeInstanceOf(HealthService);
    await first.dispose();
    await second.dispose();
  });

  it("runs the callback inside a scope and disposes that scope afterwards", async () => {
    getOrm.mockResolvedValue({ em: { fork: () => ({}) } });
    const { withRequestScope, HealthService } = await loadContainer();

    const value = await withRequestScope(async (cradle) => {
      expect(cradle.healthService).toBeInstanceOf(HealthService);
      return "ok";
    });

    await expect(
      withRequestScope(async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect(value).toBe("ok");
  });

  it("throws ServiceUnavailableError when the database cannot initialise, then allows a retry", async () => {
    const cause = new Error("down");
    getOrm.mockRejectedValue(cause);
    const { createRequestScope, ServiceUnavailableError } = await loadContainer();

    await expect(createRequestScope()).rejects.toBeInstanceOf(ServiceUnavailableError);
    await expect(createRequestScope()).rejects.toMatchObject({
      code: "database_unavailable",
      cause,
    });
    expect(getOrm).toHaveBeenCalledTimes(2);

    getOrm.mockResolvedValue({ em: { fork: () => ({}) } });
    await expect(createRequestScope()).resolves.toBeDefined();
    expect(getOrm).toHaveBeenCalledTimes(3);
  });
});
