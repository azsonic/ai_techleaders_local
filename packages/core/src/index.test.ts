import { describe, expect, it } from "vitest";

import {
  CSRF_HEADER,
  ConflictError,
  NotFoundError,
  createApiHandler,
  err,
  ok,
} from "./index";

describe("public entry", () => {
  it("re-exports the runtime API", () => {
    expect(CSRF_HEADER).toBe("x-devmentor-request");
    expect(ok("value")).toEqual({ ok: true, value: "value" });
    expect(err("nope")).toEqual({ ok: false, error: "nope" });
    expect(createApiHandler()).toEqual(expect.any(Function));
    expect(new NotFoundError()).toBeInstanceOf(NotFoundError);
    expect(new ConflictError("taken", "Taken").code).toBe("taken");
  });
});
