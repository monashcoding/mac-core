import type { ErrorRequestHandler, RequestHandler } from "express";

import { describeError } from "./errors";
import type { Logger } from "./log";

export interface ErrorHandlerOptions {
  /** Logs unexpected failures (500s). */
  readonly logger?: Logger;
}

/**
 * The last middleware of an Express app: turns anything a route threw
 * into the standard error response.
 */
export function errorHandler(options: ErrorHandlerOptions = {}): ErrorRequestHandler {
  return (error, request, response, next) => {
    if (response.headersSent) {
      next(error);

      return;
    }

    const answer = describeError(error);

    if (answer.unexpected) {
      options.logger?.error("Route failed", error, { method: request.method, path: request.path });
    }

    response.status(answer.status).set(answer.headers).json(answer.body);
  };
}

/** Answers 404 in the standard error body for an `/api` path no route matched. */
export function apiNotFound(): RequestHandler {
  return (_request, response) => {
    response.status(404).json({ error: "not_found", message: "Not found." });
  };
}
