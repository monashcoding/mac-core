import { headers } from "next/headers";
import { cache } from "react";

import type { MacClaims } from "./claims";
import { MacAuthError } from "./errors";
import { requireRole, requireUser } from "./roles";
import { getMacAuth } from "./server";

/**
 * The signed-in user's claims for this request, or null for anonymous
 * visitors. Resolved once per render or server action.
 */
export const getClaims = cache(async (): Promise<MacClaims | null> => {
  return getMacAuth().claimsFromHeaders(await headers());
});

/** The signed-in user's claims, or a MacAuthError. Pass roles to also require one of them. */
export async function requireClaims(...roles: string[]): Promise<MacClaims> {
  const claims = await getClaims();

  return roles.length > 0 ? requireRole(claims, ...roles) : requireUser(claims);
}

export interface RouteGuard {
  /** Require one of these roles. Any signed-in user passes when omitted. */
  readonly roles?: readonly string[];
}

type AuthedRouteHandler<Context> = (
  request: Request,
  claims: MacClaims,
  context: Context,
) => Response | Promise<Response>;

/**
 * Wrap a route handler so it only runs for a signed-in user. Answers
 * 401 or 403 as JSON otherwise.
 */
export function withMacAuth<Context = never>(
  handler: AuthedRouteHandler<Context>,
  guard: RouteGuard = {},
): (request: Request, context: Context) => Promise<Response> {
  return async (request, context) => {
    const claims = await getMacAuth().claimsFromHeaders(request.headers);

    try {
      const user = guard.roles ? requireRole(claims, ...guard.roles) : requireUser(claims);

      return await handler(request, user, context);
    } catch (error) {
      if (error instanceof MacAuthError) {
        return Response.json({ error: error.code }, { status: error.status });
      }

      throw error;
    }
  };
}
