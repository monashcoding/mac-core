import { createRemoteJWKSet, type JWTVerifyGetKey, jwtVerify } from "jose";
import { z } from "zod";

import { type MacClaims, macClaimsSchema } from "./claims";
import { bearerToken, sessionCookieHeader } from "./cookies";
import { MacAuthError } from "./errors";

export const DEFAULT_AUTH_URL = "https://auth.monashcoding.com";
export const DEFAULT_AUDIENCE = "mac-suite";

/** After this long without an answer from mac-auth, the visitor counts as anonymous. */
const DEFAULT_TIMEOUT_MS = 3000;

const tokenResponseSchema = z.object({ token: z.string().min(1) });

export interface MacAuthOptions {
  /** mac-auth origin. Defaults to `AUTH_URL`, then https://auth.monashcoding.com. */
  readonly authUrl?: string;
  /** Expected `aud`. Defaults to `JWT_AUDIENCE`, then `mac-suite`. */
  readonly audience?: string;
  /** Key source for token signatures. Defaults to mac-auth's published JWKS. */
  readonly keys?: JWTVerifyGetKey;
  readonly fetch?: typeof fetch;
  readonly timeoutMs?: number;
}

/** The request headers a session is read from. `Headers` and Next's `headers()` both fit. */
export interface HeaderReader {
  get(name: string): string | null;
}

export interface MacAuth {
  readonly authUrl: string;
  /** Verify a token's signature, algorithm, issuer, audience, expiry and claims. Throws MacAuthError. */
  verifyToken(token: string): Promise<MacClaims>;
  /** Claims from an `Authorization: Bearer` header, or null. */
  claimsFromBearer(authorization: string | null | undefined): Promise<MacClaims | null>;
  /** Claims from the shared session cookie, minted through mac-auth, or null. */
  claimsFromCookie(cookie: string | null | undefined): Promise<MacClaims | null>;
  /** Bearer token first, then the session cookie. */
  claimsFromHeaders(headers: HeaderReader): Promise<MacClaims | null>;
}

export function createMacAuth(options: MacAuthOptions = {}): MacAuth {
  const authUrl = (options.authUrl ?? process.env.AUTH_URL ?? DEFAULT_AUTH_URL).replace(/\/+$/, "");
  const audience = options.audience ?? process.env.JWT_AUDIENCE ?? DEFAULT_AUDIENCE;
  const keys = options.keys ?? createRemoteJWKSet(new URL(`${authUrl}/api/auth/jwks`));
  const request = options.fetch ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  async function verifyToken(token: string): Promise<MacClaims> {
    const verified = await jwtVerify(token, keys, {
      // mac-auth signs with Ed25519 only.
      algorithms: ["EdDSA"],
      issuer: authUrl,
      audience,
    }).catch((cause: Error) => {
      throw new MacAuthError("invalid_token", "The MAC token is not valid.", { cause });
    });

    const claims = macClaimsSchema.safeParse(verified.payload);

    if (!claims.success) {
      throw new MacAuthError("invalid_token", "The MAC token is missing claims.", {
        cause: claims.error,
      });
    }

    return claims.data;
  }

  async function verifyOrNull(token: string | null): Promise<MacClaims | null> {
    if (!token) return null;

    return verifyToken(token).catch(() => null);
  }

  async function mintToken(cookie: string): Promise<string | null> {
    const response = await request(`${authUrl}/api/auth/token`, {
      headers: { cookie },
      // mac-auth mints tokens per session; never reuse one across requests.
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });

    // 401 means the session expired.
    if (!response.ok) return null;

    const body = tokenResponseSchema.safeParse(await response.json());

    return body.success ? body.data.token : null;
  }

  async function claimsFromCookie(cookie: string | null | undefined): Promise<MacClaims | null> {
    const session = sessionCookieHeader(cookie);

    if (!session) return null;

    return verifyOrNull(await mintToken(session).catch(() => null));
  }

  async function claimsFromBearer(authorization: string | null | undefined): Promise<MacClaims | null> {
    return verifyOrNull(bearerToken(authorization));
  }

  async function claimsFromHeaders(headers: HeaderReader): Promise<MacClaims | null> {
    const fromBearer = await claimsFromBearer(headers.get("authorization"));

    return fromBearer ?? claimsFromCookie(headers.get("cookie"));
  }

  return { authUrl, verifyToken, claimsFromBearer, claimsFromCookie, claimsFromHeaders };
}

let shared: MacAuth | null = null;

/** The process-wide MacAuth, configured from `AUTH_URL` and `JWT_AUDIENCE`. */
export function getMacAuth(): MacAuth {
  shared ??= createMacAuth();

  return shared;
}

/** Verify a token with the process-wide MacAuth. Throws MacAuthError. */
export function verifyMacToken(token: string): Promise<MacClaims> {
  return getMacAuth().verifyToken(token);
}
