export type AppErrorKind =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "unavailable";

export type FieldErrors = Record<string, string[]>;

interface AppErrorOptions {
  cause?: unknown;
}

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly code: string;

  constructor(kind: AppErrorKind, code: string, message: string, options?: AppErrorOptions) {
    super(message, options);
    this.name = new.target.name;
    this.kind = kind;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  readonly fieldErrors: FieldErrors;

  constructor(message: string, fieldErrors: FieldErrors = {}, options?: AppErrorOptions) {
    super("validation", "validation_failed", message, options);
    this.fieldErrors = fieldErrors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required", options?: AppErrorOptions) {
    super("unauthorized", "unauthorized", message, options);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You are not allowed to do this", options?: AppErrorOptions) {
    super("forbidden", "forbidden", message, options);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", options?: AppErrorOptions) {
    super("not_found", "not_found", message, options);
  }
}

export class ConflictError extends AppError {
  constructor(code: string, message: string, options?: AppErrorOptions) {
    super("conflict", code, message, options);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(code: string, message: string, options?: AppErrorOptions) {
    super("unavailable", code, message, options);
  }
}
