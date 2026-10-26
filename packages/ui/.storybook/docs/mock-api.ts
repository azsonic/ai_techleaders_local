import type { ApiResult } from "@devmentor/core";
import { apiCall } from "@devmentor/ui/backend/api/api-call";

/**
 * Documentation helper: answers `/api/*` calls the way the real API would, so stories exercise the real `apiCall`
 * (CSRF header, envelope parsing, network failure) instead of a function that returns a canned value.
 * Responses follow the `ApiResult` envelope from @devmentor/core.
 */
export type ApiMode =
  | "success"
  | "pending"
  | "field-error"
  | "server-error"
  | "offline"
  | "conflict"
  | "declined";

export const API_MODES: { mode: ApiMode; label: string }[] = [
  { mode: "success", label: "Success" },
  { mode: "pending", label: "Pending" },
  { mode: "field-error", label: "Field error" },
  { mode: "server-error", label: "Server error" },
  { mode: "offline", label: "Offline" },
];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

export type FieldErrorSample = Record<string, string[]>;

export const respond = (
  mode: ApiMode,
  fieldErrors: FieldErrorSample = {},
): Promise<Response> => {
  switch (mode) {
    case "success":
      return Promise.resolve(json({ ok: true, data: {} }));
    case "pending":
      return new Promise<Response>(() => {});
    case "field-error":
      return Promise.resolve(
        json(
          {
            ok: false,
            error: {
              code: "validation_failed",
              message: "Check the highlighted fields.",
              fieldErrors,
            },
          },
          422,
        ),
      );
    case "conflict":
      return Promise.resolve(
        json(
          {
            ok: false,
            error: {
              code: "conflict",
              message: "This window overlaps one you already have.",
            },
          },
          409,
        ),
      );
    case "declined":
      return Promise.resolve(
        json(
          {
            ok: false,
            error: {
              code: "payment_declined",
              message:
                "Your card was declined. Nothing was charged. Use another card.",
            },
          },
          402,
        ),
      );
    case "server-error":
      return Promise.resolve(
        json(
          {
            ok: false,
            error: {
              code: "server_error",
              message: "Something broke on our side. Try again in a minute.",
            },
          },
          500,
        ),
      );
    case "offline":
      return Promise.reject(new TypeError("Failed to fetch"));
  }
};

/**
 * Calls the real `apiCall` with `fetch` answered by `respond` for that one call. The patch is undone at once (apiCall
 * reaches `fetch` before its first await), so several stories on one documentation page never see each other's mode.
 */
export function mockApiCall<T = unknown>(
  mode: ApiMode,
  path: string,
  body?: unknown,
  fieldErrors?: FieldErrorSample,
): Promise<ApiResult<T>> {
  const real = globalThis.fetch;
  globalThis.fetch = (() => respond(mode, fieldErrors)) as typeof fetch;
  try {
    return apiCall<T>(path, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    });
  } finally {
    globalThis.fetch = real;
  }
}
