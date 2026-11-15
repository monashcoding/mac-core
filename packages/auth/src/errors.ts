export type MacAuthErrorCode = "unauthenticated" | "invalid_token" | "forbidden";

const STATUS_BY_CODE = {
  unauthenticated: 401,
  invalid_token: 401,
  forbidden: 403,
} as const;

/** Thrown by the verifier and the role guards. `status` is the HTTP status to answer with. */
export class MacAuthError extends Error {
  readonly code: MacAuthErrorCode;
  readonly status: 401 | 403;

  constructor(code: MacAuthErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MacAuthError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
  }
}
