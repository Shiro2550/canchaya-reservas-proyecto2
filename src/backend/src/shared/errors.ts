import { ERROR_CODES, type ErrorCode } from "@canchaya/shared";

/**
 * Error de aplicación con código del catálogo de specs/api.md.
 * El manejador global lo traduce a `{ error: { code, message } }` con su status HTTP.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = ERROR_CODES[code];
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
