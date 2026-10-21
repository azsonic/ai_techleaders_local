import type { ApiErrorBody, ApiResult } from "./envelope";
import { AppError, ValidationError, type AppErrorKind } from "./errors";

const STATUS_BY_KIND: Record<AppErrorKind, number> = {
  validation: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  unavailable: 503,
};

const INTERNAL_ERROR: ApiErrorBody = { code: "internal_error", message: "Something went wrong" };

type RouteHandler<TContext> = (request: Request, context: TContext) => Promise<unknown>;

export interface ApiHandlerOptions {
  /** Re-throws framework control-flow errors (e.g. Next's `unstable_rethrow`) so they aren't turned into a 500. */
  rethrow?: (error: unknown) => void;
}

/**
 * Builds `apiHandler`, which wraps a route handler: its return value becomes `{ ok: true, data }`, and a thrown
 * `AppError` becomes `{ ok: false, error }` with the matching status. Unexpected errors are logged and answered
 * with a generic 500.
 */
export function createApiHandler({ rethrow }: ApiHandlerOptions = {}) {
  return function apiHandler<TContext = unknown>(handler: RouteHandler<TContext>) {
    return async (request: Request, context: TContext): Promise<Response> => {
      try {
        const data = await handler(request, context);
        return Response.json({ ok: true, data } satisfies ApiResult<unknown>);
      } catch (error) {
        rethrow?.(error);
        return errorResponse(request, error);
      }
    };
  };
}

function errorResponse(request: Request, error: unknown): Response {
  const route = `${request.method} ${new URL(request.url).pathname}`;

  if (!(error instanceof AppError)) {
    console.error(`${route} failed unexpectedly`, error);
    return Response.json({ ok: false, error: INTERNAL_ERROR } satisfies ApiResult<never>, { status: 500 });
  }

  const status = STATUS_BY_KIND[error.kind];
  if (status >= 500) {
    console.error(`${route} failed: ${error.code}`, error);
  }

  const body: ApiErrorBody = { code: error.code, message: error.message };
  if (error instanceof ValidationError) {
    body.fieldErrors = error.fieldErrors;
  }
  return Response.json({ ok: false, error: body } satisfies ApiResult<never>, { status });
}
