import { CSRF_HEADER, type ApiErrorBody, type ApiResult } from "@devmentor/core";

const NETWORK_ERROR: ApiErrorBody = { code: "network_error", message: "Could not reach the server" };
const INVALID_RESPONSE: ApiErrorBody = { code: "invalid_response", message: "The server sent an unexpected response" };

export class ApiCallError extends Error {
  readonly code: string;
  readonly fieldErrors?: ApiErrorBody["fieldErrors"];

  constructor({ code, message, fieldErrors }: ApiErrorBody) {
    super(message);
    this.name = "ApiCallError";
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * The only sanctioned way to call `/api/*` from the browser. Never throws: network failures and responses that
 * aren't the API envelope come back as `{ ok: false }`.
 */
export async function apiCall<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const headers = new Headers(init.headers);
  headers.set(CSRF_HEADER, "1");
  headers.set("accept", "application/json");

  let response: Response;
  try {
    response = await fetch(path, { ...init, headers });
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }

  const body = await readJsonSafe(response);
  return isApiResult<T>(body) ? body : { ok: false, error: INVALID_RESPONSE };
}

export async function apiCallOrThrow<T>(path: string, init?: RequestInit): Promise<T> {
  const result = await apiCall<T>(path, init);
  if (!result.ok) {
    throw new ApiCallError(result.error);
  }
  return result.data;
}

async function readJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => "");
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function isApiResult<T>(body: unknown): body is ApiResult<T> {
  if (typeof body !== "object" || body === null || !("ok" in body)) {
    return false;
  }
  if (body.ok === true) {
    return "data" in body;
  }
  return body.ok === false && "error" in body && isErrorBody(body.error);
}

function isErrorBody(error: unknown): error is ApiErrorBody {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    "message" in error &&
    typeof error.message === "string"
  );
}
