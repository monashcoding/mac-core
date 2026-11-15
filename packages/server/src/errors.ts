import { z, ZodError } from "zod";

export interface ErrorIssue {
  /** Where in the input, as `items.0.name`. Empty for the input as a whole. */
  readonly path: string;
  readonly message: string;
}

/** The body of every error response from a MAC app. */
export interface ErrorBody {
  /** A stable snake_case code a client can branch on. */
  readonly error: string;
  /** A sentence a person can read. */
  readonly message: string;
  readonly issues?: ErrorIssue[];
}

export interface HttpErrorOptions extends ErrorOptions {
  readonly issues?: ErrorIssue[];
  readonly headers?: Readonly<Record<string, string>>;
}

/** An error that knows its HTTP answer. Throw it anywhere below a route. */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly issues: ErrorIssue[] | undefined;
  readonly headers: Readonly<Record<string, string>>;

  constructor(status: number, code: string, message: string, options: HttpErrorOptions = {}) {
    super(message, options);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.issues = options.issues;
    this.headers = options.headers ?? {};
  }
}

/** The errors routes throw most. */
export const httpError = {
  badRequest: (message: string, code = "bad_request") => new HttpError(400, code, message),
  unauthenticated: (message = "Sign in to continue.") => new HttpError(401, "unauthenticated", message),
  forbidden: (message = "You do not have access to this.") => new HttpError(403, "forbidden", message),
  notFound: (message = "Not found.") => new HttpError(404, "not_found", message),
  conflict: (message: string, code = "conflict") => new HttpError(409, code, message),
  tooManyRequests: (retryAfterSeconds: number) =>
    new HttpError(429, "rate_limited", "Too many requests. Try again shortly.", {
      headers: { "retry-after": String(Math.max(1, Math.ceil(retryAfterSeconds))) },
    }),
};

export interface ErrorAnswer {
  readonly status: number;
  readonly body: ErrorBody;
  readonly headers: Readonly<Record<string, string>>;
  /** True for a failure of the app itself, which is worth logging. */
  readonly unexpected: boolean;
}

/*
 * Errors from the other MAC packages carry a status without extending
 * HttpError: MacAuthError (401, 403) and FeatureDisabledError (404).
 */
const statusError = z.object({
  status: z.number().int().min(400).max(499),
  code: z.string().optional(),
  message: z.string(),
});

const STATUS_CODES = new Map([
  [401, "unauthenticated"],
  [403, "forbidden"],
  [404, "not_found"],
]);

/** The HTTP answer for anything a route threw. An unknown error is a 500 that says nothing about itself. */
export function describeError(cause: unknown): ErrorAnswer {
  if (cause instanceof HttpError) {
    return {
      status: cause.status,
      body: { error: cause.code, message: cause.message, ...(cause.issues ? { issues: cause.issues } : undefined) },
      headers: cause.headers,
      unexpected: cause.status >= 500,
    };
  }

  if (cause instanceof ZodError) {
    return {
      status: 422,
      body: {
        error: "invalid_request",
        message: "The request is not valid.",
        issues: cause.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      },
      headers: {},
      unexpected: false,
    };
  }

  const known = statusError.safeParse(cause);

  if (known.success) {
    const { status, code, message } = known.data;

    return {
      status,
      body: { error: code ?? STATUS_CODES.get(status) ?? "request_failed", message },
      headers: {},
      unexpected: false,
    };
  }

  return {
    status: 500,
    body: { error: "internal_error", message: "Something went wrong." },
    headers: {},
    unexpected: true,
  };
}

/** The JSON Response for anything a route threw. */
export function errorResponse(cause: unknown): Response {
  const answer = describeError(cause);

  return Response.json(answer.body, { status: answer.status, headers: answer.headers });
}
