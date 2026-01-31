/**
 * Typed SDK errors for M-Pesa API failures.
 * Consumers can catch by name or use `instanceof` for flow control.
 */

/** Base class for all M-Pesa SDK errors. */
export class MpesaError extends Error {
  readonly code: string;
  readonly statusCode?: number;
  readonly responseBody?: unknown;

  constructor(
    message: string,
    options?: {
      code?: string;
      statusCode?: number;
      responseBody?: unknown;
      cause?: Error;
    }
  ) {
    super(message, { cause: options?.cause });
    this.name = "MpesaError";
    this.code = options?.code ?? "MPESA_ERROR";
    this.statusCode = options?.statusCode;
    this.responseBody = options?.responseBody;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Thrown when OAuth token generation or refresh fails. */
export class MpesaAuthError extends MpesaError {
  constructor(message: string, options?: { cause?: Error; responseBody?: unknown }) {
    super(message, { ...options, code: "MPESA_AUTH_ERROR" });
    this.name = "MpesaAuthError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Thrown when an API request fails (4xx/5xx or Daraja error response). */
export class MpesaRequestError extends MpesaError {
  constructor(
    message: string,
    options?: { statusCode?: number; responseBody?: unknown; cause?: Error }
  ) {
    super(message, { ...options, code: "MPESA_REQUEST_ERROR" });
    this.name = "MpesaRequestError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Thrown when SDK input validation fails (e.g. invalid phone format). */
export class MpesaValidationError extends MpesaError {
  constructor(message: string, options?: { cause?: Error }) {
    super(message, { ...options, code: "MPESA_VALIDATION_ERROR" });
    this.name = "MpesaValidationError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
