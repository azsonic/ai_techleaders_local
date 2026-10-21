import { describe, expect, it } from "vitest";

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServiceUnavailableError,
  UnauthorizedError,
  ValidationError,
} from "./errors";

describe("AppError subclasses", () => {
  it("uses default messages and empty field errors", () => {
    expect(new ValidationError("Invalid").fieldErrors).toEqual({});
    expect(new UnauthorizedError().message).toBe("Authentication required");
    expect(new ForbiddenError().message).toBe("You are not allowed to do this");
    expect(new NotFoundError().message).toBe("Not found");
  });

  it("keeps custom messages, codes, field errors, and the cause", () => {
    const cause = new Error("zod");
    const validation = new ValidationError("Invalid", { email: ["Required"] }, { cause });
    expect(validation.name).toBe("ValidationError");
    expect(validation.kind).toBe("validation");
    expect(validation.code).toBe("validation_failed");
    expect(validation.fieldErrors).toEqual({ email: ["Required"] });
    expect(validation.cause).toBe(cause);

    const conflict = new ConflictError("slot_taken", "That slot is taken");
    expect(conflict.kind).toBe("conflict");
    expect(conflict.code).toBe("slot_taken");

    const unavailable = new ServiceUnavailableError("database_unavailable", "Database is unavailable", {
      cause,
    });
    expect(unavailable.kind).toBe("unavailable");
    expect(unavailable.code).toBe("database_unavailable");
    expect(unavailable.cause).toBe(cause);

    expect(new UnauthorizedError("Sign in").message).toBe("Sign in");
    expect(new ForbiddenError("No").code).toBe("forbidden");
    expect(new NotFoundError("Missing mentor").message).toBe("Missing mentor");
  });
});
