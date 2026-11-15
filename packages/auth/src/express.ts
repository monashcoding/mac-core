import type { Request, RequestHandler } from "express";

import type { MacClaims } from "./claims";
import { MacAuthError } from "./errors";
import { requireRole, requireUser } from "./roles";
import { getMacAuth, type HeaderReader, type MacAuth } from "./server";

const claimsByRequest = new WeakMap<Request, MacClaims>();

function headerReader(request: Request): HeaderReader {
  return { get: (name) => request.get(name) ?? null };
}

export interface MacAuthMiddlewareOptions {
  readonly auth?: MacAuth;
}

/**
 * Resolve the user for every request. Never rejects: routes decide
 * whether an anonymous visitor matters with `requireAuth`.
 */
export function attachMacUser(options: MacAuthMiddlewareOptions = {}): RequestHandler {
  return (request, _response, next) => {
    const auth = options.auth ?? getMacAuth();

    auth
      .claimsFromHeaders(headerReader(request))
      .then((claims) => {
        if (claims) claimsByRequest.set(request, claims);

        next();
      })
      .catch(next);
  };
}

/** The claims `attachMacUser` resolved for this request, or null. */
export function getMacUser(request: Request): MacClaims | null {
  return claimsByRequest.get(request) ?? null;
}

/**
 * Reject anonymous requests with 401, and requests without one of the
 * roles with 403. Mount after `attachMacUser`.
 */
export function requireAuth(...roles: string[]): RequestHandler {
  return (request, response, next) => {
    const claims = getMacUser(request);

    try {
      if (roles.length > 0) requireRole(claims, ...roles);
      else requireUser(claims);

      next();
    } catch (error) {
      if (error instanceof MacAuthError) {
        response.status(error.status).json({ error: error.code });

        return;
      }

      next(error);
    }
  };
}
