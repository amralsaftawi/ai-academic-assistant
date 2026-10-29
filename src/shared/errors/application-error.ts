/**
 * Errors that application code can raise deliberately.
 *
 * These are technical, cross-cutting error shapes. Module-specific failure
 * details should still be modelled in the module that owns the workflow.
 */
export type ApplicationErrorCode =
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "NOT_IMPLEMENTED"
  | "VALIDATION_FAILED";

export class ApplicationError extends Error {
  readonly code: ApplicationErrorCode;
  readonly statusCode: number;

  constructor(
    code: ApplicationErrorCode,
    message: string,
    statusCode: number = 500,
  ) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message = "The operation is not allowed.") {
    super("FORBIDDEN", message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message = "The requested resource was not found.") {
    super("NOT_FOUND", message, 404);
    this.name = "NotFoundError";
  }
}

export class NotImplementedError extends ApplicationError {
  constructor(message = "This capability is not implemented yet.") {
    super("NOT_IMPLEMENTED", message, 501);
    this.name = "NotImplementedError";
  }
}

export class ValidationError extends ApplicationError {
  constructor(message = "The request is invalid.") {
    super("VALIDATION_FAILED", message, 400);
    this.name = "ValidationError";
  }
}
