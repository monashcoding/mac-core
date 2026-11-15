/*
 * Better Auth's session cookies: `<prefix>.session_token`, plus the
 * optional `<prefix>.session_data` cache (chunked as `.0`, `.1` when
 * large), with or without the `__Secure-` prefix. The prefix is
 * mac-auth's choice, so only the suffix is matched.
 */
const SESSION_COOKIE = /(?:^|[._-])session_(?:token|data)(?:\.\d+)?$/;
const SESSION_TOKEN = /(?:^|[._-])session_token$/;

/**
 * The part of a Cookie header mac-auth needs, or null when it holds no
 * session token. Every other cookie on the app's host stays on that host.
 */
export function sessionCookieHeader(cookie: string | null | undefined): string | null {
  if (!cookie) return null;

  const kept: string[] = [];
  let hasToken = false;

  for (const part of cookie.split(";")) {
    const pair = part.trim();
    const separator = pair.indexOf("=");
    const name = separator > 0 ? pair.slice(0, separator) : "";

    if (!SESSION_COOKIE.test(name)) continue;

    kept.push(pair);

    if (SESSION_TOKEN.test(name)) hasToken = true;
  }

  return hasToken ? kept.join("; ") : null;
}

const BEARER = /^Bearer\s+(.+)$/i;

/** The token of an `Authorization: Bearer <token>` header, or null. */
export function bearerToken(authorization: string | null | undefined): string | null {
  if (!authorization) return null;

  return BEARER.exec(authorization.trim())?.[1] ?? null;
}
