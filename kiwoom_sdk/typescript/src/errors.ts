export class KiwoomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KiwoomError";
  }
}

export class AuthError extends KiwoomError {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class APIError extends KiwoomError {
  returnCode: number;
  statusCode: number;

  constructor(returnCode: number, message: string, statusCode = 0) {
    super(`[${returnCode}] ${message}`);
    this.name = "APIError";
    this.returnCode = returnCode;
    this.statusCode = statusCode;
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(returnCode: number, message: string) {
    super(`Invalid credentials (${returnCode}): ${message}`);
    this.name = "InvalidCredentialsError";
  }
}

export class TokenExpiredError extends AuthError {
  constructor(returnCode: number, message: string) {
    super(`Token expired (${returnCode}): ${message}`);
    this.name = "TokenExpiredError";
  }
}

export class RateLimitError extends APIError {
  constructor(returnCode: number, message: string) {
    super(returnCode, `Rate limited: ${message}`);
    this.name = "RateLimitError";
  }
}

export class SymbolNotFoundError extends APIError {
  constructor(returnCode: number, message: string) {
    super(returnCode, `Symbol not found: ${message}`);
    this.name = "SymbolNotFoundError";
  }
}
