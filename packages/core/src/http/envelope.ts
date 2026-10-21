import type { FieldErrors } from "./errors";

export interface ApiErrorBody {
  code: string;
  message: string;
  fieldErrors?: FieldErrors;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiErrorBody };

/**
 * Sent by `apiCall` on every request. A plain HTML form post can't set it, which makes it part of the CSRF defence
 * for cookie-authenticated, state-changing routes.
 */
export const CSRF_HEADER = "x-devmentor-request";
