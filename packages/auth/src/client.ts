import { decodeJwt } from "jose";
import { z } from "zod";

import { type MacClaims, macClaimsSchema } from "./claims";

const DEFAULT_AUTH_URL = "https://auth.monashcoding.com";

/** Refresh a token this long before it expires. */
const EXPIRY_MARGIN_SECONDS = 60;

const tokenResponseSchema = z.object({ token: z.string().min(1) });
const signInResponseSchema = z.object({ url: z.string().min(1) });
const expirySchema = z.object({ exp: z.number() });

const membershipSchema = z.object({
  clubMember: z.boolean(),
  link: z.object({
    linked: z.boolean(),
    canEnterStudentId: z.boolean(),
    contactUs: z.boolean(),
    attemptsRemaining: z.number().optional(),
  }),
});

const noMatchSchema = z.object({ message: z.string(), attemptsRemaining: z.number() });

/** A signed-in person's club membership, as mac-auth sees it right now. */
export interface Membership {
  /** A current member on the MSA roster. */
  readonly clubMember: boolean;
  /** The account is tied to a roster member. Final once true. */
  readonly linked: boolean;
  /** Show the student ID field. */
  readonly canEnterStudentId: boolean;
  /** Out of attempts for now: point the person at the committee. */
  readonly contactUs: boolean;
  readonly attemptsRemaining: number | null;
}

export type LinkStudentIdResult =
  | { readonly ok: true; readonly membership: Membership }
  | { readonly ok: false; readonly message: string; readonly attemptsRemaining: number };

export type MacProvider = "google" | "microsoft";

export type MacSession =
  | { readonly status: "loading"; readonly user: null }
  | { readonly status: "signed-out"; readonly user: null }
  | { readonly status: "signed-in"; readonly user: MacClaims };

export interface MacAuthClientOptions {
  /** mac-auth origin. Defaults to https://auth.monashcoding.com. */
  readonly authUrl?: string;
  readonly fetch?: typeof fetch;
}

export interface MacAuthClient {
  /** Redirect to Google or Microsoft, returning to `callbackURL` (this page by default). */
  signIn(provider: MacProvider, callbackURL?: string): Promise<void>;
  /** End the shared session in every MAC app. */
  signOut(): Promise<void>;
  /** A current token for this session, or null when signed out. */
  getToken(): Promise<string | null>;
  /** `fetch` with the token attached. Retries once with a fresh token on 401. */
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  /** The signed-in person's club membership, or null when signed out. */
  getMembership(): Promise<Membership | null>;
  /**
   * Link this account to a roster member by student ID. On success the
   * session reloads, so `clubMember` in the claims is current.
   */
  linkStudentId(studentId: string): Promise<LinkStudentIdResult>;
  /** Load the session. `useMacSession` calls this on mount. */
  refresh(): Promise<MacSession>;
  getSession(): MacSession;
  subscribe(listener: () => void): () => void;
}

interface CachedToken {
  readonly token: string;
  readonly claims: MacClaims;
  readonly expiresAt: number;
}

const LOADING: MacSession = { status: "loading", user: null };
const SIGNED_OUT: MacSession = { status: "signed-out", user: null };

/**
 * Read a token's claims for display. The browser never verifies the
 * signature; the app's backend does, on every request.
 */
function toMembership(body: z.infer<typeof membershipSchema>): Membership {
  return {
    clubMember: body.clubMember,
    linked: body.link.linked,
    canEnterStudentId: body.link.canEnterStudentId,
    contactUs: body.link.contactUs,
    attemptsRemaining: body.link.attemptsRemaining ?? null,
  };
}

function readToken(token: string): CachedToken | null {
  const payload = decodeJwt(token);
  const claims = macClaimsSchema.safeParse(payload);
  const expiry = expirySchema.safeParse(payload);

  if (!claims.success || !expiry.success) return null;

  return { token, claims: claims.data, expiresAt: expiry.data.exp };
}

export function createMacAuthClient(options: MacAuthClientOptions = {}): MacAuthClient {
  const authUrl = (options.authUrl ?? DEFAULT_AUTH_URL).replace(/\/+$/, "");
  const request = options.fetch ?? ((input, init) => fetch(input, init));
  const listeners = new Set<() => void>();

  let cached: CachedToken | null = null;
  let session: MacSession = LOADING;
  let pending: Promise<CachedToken | null> | null = null;

  function publish(next: MacSession): void {
    session = next;

    for (const listener of listeners) listener();
  }

  async function mint(): Promise<CachedToken | null> {
    const response = await request(`${authUrl}/api/auth/token`, { credentials: "include" });

    if (!response.ok) return null;

    const body = tokenResponseSchema.safeParse(await response.json());

    return body.success ? readToken(body.data.token) : null;
  }

  function load(): Promise<CachedToken | null> {
    pending ??= mint()
      .catch(() => null)
      .then((minted) => {
        cached = minted;
        pending = null;
        publish(minted ? { status: "signed-in", user: minted.claims } : SIGNED_OUT);

        return minted;
      });

    return pending;
  }

  function isFresh(token: CachedToken): boolean {
    return token.expiresAt - EXPIRY_MARGIN_SECONDS > Date.now() / 1000;
  }

  async function getToken(): Promise<string | null> {
    const current = cached && isFresh(cached) ? cached : await load();

    return current?.token ?? null;
  }

  async function send(input: RequestInfo | URL, init: RequestInit | undefined, token: string | null): Promise<Response> {
    const headers = new Headers(init?.headers);

    if (token) headers.set("authorization", `Bearer ${token}`);

    return request(input, { ...init, headers });
  }

  return {
    async signIn(provider, callbackURL = window.location.href) {
      const response = await request(`${authUrl}/api/auth/sign-in/social`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider, callbackURL }),
      });

      const body = signInResponseSchema.parse(await response.json());

      window.location.assign(body.url);
    },

    async signOut() {
      await request(`${authUrl}/api/auth/sign-out`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      cached = null;
      publish(SIGNED_OUT);
    },

    getToken,

    async fetch(input, init) {
      const response = await send(input, init, await getToken());

      if (response.status !== 401) return response;

      // The token expired between the freshness check and the request.
      const renewed = await load();

      return renewed ? send(input, init, renewed.token) : response;
    },

    async getMembership() {
      const response = await request(`${authUrl}/api/membership/me`, { credentials: "include" });

      if (!response.ok) return null;

      return toMembership(membershipSchema.parse(await response.json()));
    },

    async linkStudentId(studentId) {
      const response = await request(`${authUrl}/api/membership/me/student-id`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      if (response.status === 422) return { ok: false, ...noMatchSchema.parse(await response.json()) };

      if (!response.ok) throw new Error(`mac-auth answered ${response.status} to a student ID.`);

      const membership = toMembership(membershipSchema.parse(await response.json()));

      // The claim changes at the next mint, so mint now.
      if (membership.linked) await load();

      return { ok: true, membership };
    },

    async refresh() {
      await load();

      return session;
    },

    getSession: () => session,

    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

let shared: MacAuthClient | null = null;

/** The page-wide client, pointed at https://auth.monashcoding.com. */
export function getMacAuthClient(): MacAuthClient {
  shared ??= createMacAuthClient();

  return shared;
}
