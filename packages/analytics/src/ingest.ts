/*
 * Same-origin proxy for PostHog (`apiHost: "/ingest"`), so ad blockers
 * that block PostHog's hosts don't drop analytics.
 *
 * It is a handler, not a rewrite, because a rewrite forwards every
 * request header. That includes the shared `.monashcoding.com` session
 * cookie, which signs its holder in to every MAC app. The handler
 * forwards a short allowlist of headers, never a cookie, and drops
 * PostHog's set-cookie.
 */

const API_HOST = "https://us.i.posthog.com";
const ASSET_HOST = "https://us-assets.i.posthog.com";

/**
 * posthog-js batches and replay chunks stay well under this. Anything
 * bigger gets a 413, so one request cannot fill the heap.
 */
export const MAX_BODY = 1_000_000;

/*
 * The paths posthog-js calls, by prefix: events, replay, feature flags,
 * remote config and its lazy-loaded scripts. Everything else on
 * PostHog's hosts (its REST API, for one) gets a 404.
 */
const API_PATHS = ["/e/", "/i/", "/batch/", "/capture/", "/decide/", "/flags/", "/s/"];
const ASSET_PATHS = ["/static/", "/array/"];

const REQUEST_HEADERS = [
  "accept",
  "content-type",
  "content-encoding",
  "user-agent",
  // The client's IP from the reverse proxy, for PostHog's geo-IP.
  "x-forwarded-for",
];

/*
 * Content types the proxy serves as they are. Anything else (text/html
 * above all) is served as plain text, so it never renders as a page on
 * the app's origin.
 */
const SAFE_TYPES = ["application/json", "application/javascript", "text/javascript", "text/plain"];

function allowed(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix.slice(0, -1) || pathname.startsWith(prefix));
}

/**
 * The PostHog URL for a request under `mount`, or null when the path is
 * not one posthog-js uses. The check runs on the resolved URL, so dot
 * segments cannot climb out of an allowed prefix.
 */
export function ingestTarget(pathname: string, search: string, mount = "/ingest"): URL | null {
  if (pathname !== mount && !pathname.startsWith(`${mount}/`)) return null;

  const path = pathname.slice(mount.length);
  const host = allowed(path, ASSET_PATHS) ? ASSET_HOST : API_HOST;
  const target = new URL(`${host}${path}${search}`);

  if (target.origin !== host) return null;

  const paths = host === ASSET_HOST ? ASSET_PATHS : API_PATHS;

  return allowed(target.pathname, paths) ? target : null;
}

/** The request headers PostHog gets: a short allowlist, never a cookie. */
export function forwardRequestHeaders(from: Headers): Headers {
  const headers = new Headers();

  for (const name of REQUEST_HEADERS) {
    const value = from.get(name);

    if (value) headers.set(name, value);
  }

  return headers;
}

/**
 * The response headers the browser gets. fetch decompresses the body,
 * so content-encoding and content-length must not be copied.
 */
export function forwardResponseHeaders(from: Headers): Headers {
  const headers = new Headers({ "x-content-type-options": "nosniff" });
  const type = from.get("content-type");

  if (type) {
    const mime = type.split(";")[0]?.trim().toLowerCase() ?? "";

    headers.set("content-type", SAFE_TYPES.includes(mime) ? type : "text/plain; charset=utf-8");
  }

  const cacheControl = from.get("cache-control");

  if (cacheControl) headers.set("cache-control", cacheControl);

  return headers;
}

export class BodyTooLarge extends Error {}

/**
 * Passes the body through and errors with BodyTooLarge once more than
 * `max` bytes have gone by. That also covers chunked uploads, which
 * send no content-length.
 */
export function capBody(max: number): TransformStream<Uint8Array, Uint8Array> {
  let total = 0;

  return new TransformStream({
    transform(chunk, controller) {
      total += chunk.byteLength;

      if (total > max) controller.error(new BodyTooLarge());
      else controller.enqueue(chunk);
    },
  });
}

export interface IngestHandlerOptions {
  /** The path the handler is mounted at. */
  readonly mount?: string;
  readonly fetch?: typeof fetch;
}

function failureStatus(error: Error): 413 | 502 {
  return error.cause instanceof BodyTooLarge ? 413 : 502;
}

/**
 * A fetch-style handler for the proxy. In Next, export it as GET, POST
 * and OPTIONS from `app/ingest/[...path]/route.ts`.
 */
export function createIngestHandler(options: IngestHandlerOptions = {}): (request: Request) => Promise<Response> {
  const send = options.fetch ?? fetch;

  return async (request) => {
    const url = new URL(request.url);
    const target = ingestTarget(url.pathname, url.search, options.mount);

    if (!target) return new Response(null, { status: 404 });

    if (Number(request.headers.get("content-length")) > MAX_BODY) {
      return new Response(null, { status: 413 });
    }

    const hasBody = request.method !== "GET" && request.method !== "HEAD";

    // Node's fetch needs `duplex` to stream a request body; the DOM
    // RequestInit type does not list it.
    const init: RequestInit & { duplex: "half" } = {
      method: request.method,
      headers: forwardRequestHeaders(request.headers),
      // posthog-js sends gzip or base64 bodies; the bytes stream
      // through with a cap instead of being buffered.
      body: hasBody && request.body ? request.body.pipeThrough(capBody(MAX_BODY)) : null,
      duplex: "half",
      cache: "no-store",
      // Set before the body is read, so it bounds the upload too.
      signal: AbortSignal.timeout(10_000),
      // A redirect to another host must not be fetched from the server.
      redirect: "manual",
    };

    const upstream = await send(target, init).catch(
      (error: Error) => new Response(null, { status: failureStatus(error) }),
    );

    if (upstream.status >= 300 && upstream.status < 400) {
      return new Response(null, { status: 502 });
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: forwardResponseHeaders(upstream.headers),
    });
  };
}
