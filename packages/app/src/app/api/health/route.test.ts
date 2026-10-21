import { beforeEach, describe, expect, it, vi } from "vitest";

const connection = vi.hoisted(() => vi.fn(async () => undefined));
const check = vi.hoisted(() => vi.fn());

vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");
  return { ...actual, connection };
});

vi.mock("@/di/container", () => ({
  withRequestScope: (fn: (cradle: { healthService: { check: typeof check } }) => Promise<unknown>) =>
    fn({ healthService: { check } }),
}));

import { GET } from "./route";

beforeEach(() => {
  connection.mockClear();
  check.mockReset();
});

describe("GET /api/health", () => {
  it("checks the database inside a request scope", async () => {
    check.mockResolvedValue({ status: "ok", db: "ok" });

    const response = await GET(new Request("http://localhost/api/health"), {});

    expect(connection).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: { status: "ok", db: "ok" },
    });
  });
});
