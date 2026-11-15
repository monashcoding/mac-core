import { z } from "zod";

import { describeError, httpError } from "./errors";
import type { Logger } from "./log";

type RouteHandler<Context> = (request: Request, context: Context) => Response | Promise<Response>;

export interface RouteOptions {
  /** Logs unexpected failures (500s). */
  readonly logger?: Logger;
}

// Next signals redirect() and notFound() by throwing an error with a NEXT_ digest.
const frameworkSignal = z.object({ digest: z.string().startsWith("NEXT_") });

/**
 * Wrap a route handler so anything it throws becomes the standard error
 * response: HttpError as itself, a ZodError as 422, a MacAuthError as
 * 401 or 403, and anything else as a 500 that is logged.
 */
export function handleRoute<Context = never>(handler: RouteHandler<Context>, options: RouteOptions = {}): RouteHandler<Context> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (frameworkSignal.safeParse(error).success) throw error;

      const answer = describeError(error);

      if (answer.unexpected) {
        options.logger?.error("Route failed", error, { method: request.method, path: new URL(request.url).pathname });
      }

      return Response.json(answer.body, { status: answer.status, headers: answer.headers });
    }
  };
}

/**
 * The JSON body of a request, parsed with `schema`. A body that is not
 * JSON is a 400; one that does not fit the schema is a 422 listing
 * every issue.
 */
export async function parseBody<Value>(request: Request, schema: z.ZodType<Value>): Promise<Value> {
  const body = await request.json().catch(() => {
    throw httpError.badRequest("The request body is not JSON.", "invalid_json");
  });

  return schema.parse(body);
}

/** The query string of a request or a URL, parsed with `schema`. Repeated keys become arrays. */
export function parseQuery<Value>(source: Request | URL | URLSearchParams, schema: z.ZodType<Value>): Value {
  const search = source instanceof URLSearchParams ? source : new URL(source instanceof URL ? source : source.url).searchParams;
  const values = new Map<string, string | string[]>();

  for (const key of new Set(search.keys())) {
    const all = search.getAll(key);

    values.set(key, all.length > 1 ? all : (all[0] ?? ""));
  }

  return schema.parse(Object.fromEntries(values));
}
