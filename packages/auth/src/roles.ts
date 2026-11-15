import type { MacClaims } from "./claims";
import { MacAuthError } from "./errors";

export function hasRole(claims: MacClaims | null, role: string): boolean {
  return claims?.roles.includes(role) ?? false;
}

/** True when the user holds at least one of the roles. */
export function hasAnyRole(claims: MacClaims | null, roles: readonly string[]): boolean {
  return roles.some((role) => hasRole(claims, role));
}

/** The claims of a signed-in user, or a 401 MacAuthError. */
export function requireUser(claims: MacClaims | null): MacClaims {
  if (!claims) throw new MacAuthError("unauthenticated", "Sign in to continue.");

  return claims;
}

/** The claims of a user holding one of the roles, or a 401 or 403 MacAuthError. */
export function requireRole(claims: MacClaims | null, ...roles: string[]): MacClaims {
  const user = requireUser(claims);

  if (!hasAnyRole(user, roles)) {
    throw new MacAuthError("forbidden", `Requires one of: ${roles.join(", ")}.`);
  }

  return user;
}

/** True when the user is a current club member on the MSA roster. */
export function isClubMember(claims: MacClaims | null): boolean {
  return claims?.clubMember ?? false;
}

/** The claims of a current club member, or a 401 or 403 MacAuthError. */
export function requireClubMember(claims: MacClaims | null): MacClaims {
  const user = requireUser(claims);

  if (!user.clubMember) throw new MacAuthError("forbidden", "Requires a current MAC membership.");

  return user;
}
