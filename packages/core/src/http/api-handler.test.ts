import { describe, expect, it, vi } from "vitest";

import { createApiHandler } from "./api-handler";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServiceUnavailableError,
  UnauthorizedError,
  ValidationError,
} from "./errors";

const request = () => new Request("http://localhost/api/health");

describe("createApiHandler", () => {
  it("wraps a successful result in the envelope and passes the route context through", async () => {
    const apiHandler = createApiHandler();
    const handler = apiHandler(async (_request, context: { id: string }) => context.id);

    const response = await handler(request(), { id: "abc" });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, data: "abc" });
  });

  it.each([
    [new ValidationError("Invalid", { email: ["Required"] }), 400],
    [new UnauthorizedError(), 401],
    [new ForbiddenError(), 403],
    [new NotFoundError(), 404],
    [new ConflictError("slot_taken", "That slot is taken"), 409],
    [new ServiceUnavailableError("database_unavailable", "Database is unavailable"), 503],
  ] as const)("maps %s to the matching status", async (error, status) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const apiHandler = createApiHandler();
    const handler = apiHandler(async () => {
      throw error;
    });

    const response = await handler(request(), {});
    const body = (await response.json()) as { ok: false; error: { code: string; message: string; fieldErrors?: unknown } };

    expect(response.status).toBe(status);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe(error.code);
    expect(body.error.message).toBe(error.message);
    if (error instanceof ValidationError) {
      expect(body.error.fieldErrors).toEqual({ email: ["Required"] });
    } else {
      expect(body.error.fieldErrors).toBeUndefined();
    }
  });

  it("logs server failures and hides unexpected errors behind a generic 500", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const apiHandler = createApiHandler();

    const unavailable = apiHandler(async () => {
      throw new ServiceUnavailableError("database_unavailable", "Database is unavailable");
    });
    const unexpected = apiHandler(async () => {
      throw new Error("secret details");
    });

    expect((await unavailable(request(), {})).status).toBe(503);
    const response = await unexpected(request(), {});

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: { code: "internal_error", message: "Something went wrong" },
    });
    expect(consoleError).toHaveBeenCalledWith("GET /api/health failed: database_unavailable", expect.any(ServiceUnavailableError));
    expect(consoleError).toHaveBeenCalledWith("GET /api/health failed unexpectedly", expect.any(Error));
  });

  it("does not log client errors", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = createApiHandler()(async () => {
      throw new NotFoundError();
    });

    expect((await handler(request(), {})).status).toBe(404);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("lets the rethrow hook take over framework control-flow errors", async () => {
    const rethrow = vi.fn((error: unknown) => {
      if (error instanceof Error && error.message === "redirect") {
        throw error;
      }
    });
    const apiHandler = createApiHandler({ rethrow });
    const handler = apiHandler(async () => {
      throw new Error("redirect");
    });

    await expect(handler(request(), {})).rejects.toThrow("redirect");
    expect(rethrow).toHaveBeenCalledOnce();
  });

  it("maps an error when the rethrow hook does not take it", async () => {
    const rethrow = vi.fn();
    const handler = createApiHandler({ rethrow })(async () => {
      throw new NotFoundError("Missing");
    });

    const response = await handler(request(), {});

    expect(rethrow).toHaveBeenCalledOnce();
    expect(response.status).toBe(404);
  });
});
