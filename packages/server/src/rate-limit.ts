import { httpError } from "./errors";

export interface RateLimitOptions {
  /** Most requests one key may make inside the window. */
  readonly limit: number;
  readonly windowMs: number;
  readonly now?: () => number;
}

export interface RateLimitDecision {
  readonly allowed: boolean;
  readonly remaining: number;
  /** Seconds until the next request is allowed. Zero when allowed. */
  readonly retryAfterSeconds: number;
}

export interface RateLimiter {
  /** Count one request for `key` and say whether it may go ahead. */
  check(key: string): RateLimitDecision;
  /** `check`, throwing a 429 HttpError with `retry-after` when over the limit. */
  enforce(key: string): void;
  /** Forget a key, for example after a successful login. */
  reset(key: string): void;
}

const MAX_KEYS = 50_000;

/**
 * A sliding-window limiter held in memory. Right for one Node process,
 * which is how every MAC app runs; counts reset on a redeploy.
 */
export function createRateLimiter(options: RateLimitOptions): RateLimiter {
  const { limit, windowMs } = options;
  const now = options.now ?? Date.now;
  const hits = new Map<string, number[]>();

  function prune(time: number): void {
    for (const [key, times] of hits) {
      if ((times.at(-1) ?? 0) <= time - windowMs) hits.delete(key);
    }

    // Under a flood of distinct keys, drop the oldest rather than grow without bound.
    for (const key of hits.keys()) {
      if (hits.size <= MAX_KEYS) break;

      hits.delete(key);
    }
  }

  function check(key: string): RateLimitDecision {
    const time = now();
    const recent = (hits.get(key) ?? []).filter((hit) => hit > time - windowMs);
    const oldest = recent[0];

    if (recent.length >= limit && oldest !== undefined) {
      hits.set(key, recent);

      return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((oldest + windowMs - time) / 1000) };
    }

    recent.push(time);
    hits.set(key, recent);

    if (hits.size > MAX_KEYS) prune(time);

    return { allowed: true, remaining: limit - recent.length, retryAfterSeconds: 0 };
  }

  return {
    check,
    enforce(key) {
      const decision = check(key);

      if (!decision.allowed) throw httpError.tooManyRequests(decision.retryAfterSeconds);
    },
    reset(key) {
      hits.delete(key);
    },
  };
}

/**
 * The visitor's IP address, for a rate-limit key. MAC apps sit behind
 * Cloudflare and Traefik: Cloudflare's header is used when present,
 * otherwise the last `x-forwarded-for` entry, the one the proxy added.
 * Earlier entries are whatever the client sent.
 */
export function clientAddress(headers: { get(name: string): string | null }): string {
  const cloudflare = headers.get("cf-connecting-ip")?.trim();

  if (cloudflare) return cloudflare;

  return headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() || "unknown";
}
