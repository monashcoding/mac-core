export { MAC_ROLES, type MacClaims, macClaimsSchema, type MacRole } from "./claims";

export { bearerToken, sessionCookieHeader } from "./cookies";

export { MacAuthError, type MacAuthErrorCode } from "./errors";

export { hasAnyRole, hasRole, requireRole, requireUser } from "./roles";

export {
  createMacAuth,
  DEFAULT_AUDIENCE,
  DEFAULT_AUTH_URL,
  getMacAuth,
  type HeaderReader,
  type MacAuth,
  type MacAuthOptions,
  verifyMacToken,
} from "./server";
