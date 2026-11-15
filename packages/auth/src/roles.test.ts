import { describe, expect, it } from "vitest";

import type { MacClaims } from "./claims";
import { bearerToken, sessionCookieHeader } from "./cookies";
import { hasAnyRole, hasRole, isClubMember, requireClubMember, requireRole, requireUser } from "./roles";

const member: MacClaims = {
  macUserId: "user_1",
  email: "ada@student.monash.edu",
  name: "Ada",
  roles: ["member"],
  team: null,
  clubMember: false,
  ver: 1,
};

const exec: MacClaims = { ...member, roles: ["member", "committee", "exec"] };

describe("club membership", () => {
  it("is the clubMember claim, not the member role", () => {
    expect(isClubMember(member)).toBe(false);
    expect(isClubMember({ ...member, clubMember: true })).toBe(true);
    expect(isClubMember(null)).toBe(false);
  });

  it("answers 401 for anonymous and 403 for a non-member", () => {
    expect(() => requireClubMember(null)).toThrowError(expect.objectContaining({ status: 401 }));
    expect(() => requireClubMember(member)).toThrowError(expect.objectContaining({ status: 403 }));
    expect(requireClubMember({ ...member, clubMember: true }).macUserId).toBe("user_1");
  });
});

describe("roles", () => {
  it("checks roles", () => {
    expect(hasRole(exec, "exec")).toBe(true);
    expect(hasRole(member, "exec")).toBe(false);
    expect(hasRole(null, "member")).toBe(false);
    expect(hasAnyRole(member, ["exec", "member"])).toBe(true);
  });

  it("answers 401 for anonymous and 403 for the wrong role", () => {
    expect(() => requireUser(null)).toThrowError(expect.objectContaining({ status: 401 }));
    expect(() => requireRole(member, "committee", "exec")).toThrowError(
      expect.objectContaining({ status: 403, code: "forbidden" }),
    );
    expect(requireRole(exec, "committee")).toBe(exec);
  });
});

describe("cookies", () => {
  it("keeps session cookies and drops the rest", () => {
    expect(
      sessionCookieHeader("_ga=1; better-auth.session_token=t; better-auth.session_data.0=d; x=y"),
    ).toBe("better-auth.session_token=t; better-auth.session_data.0=d");
  });

  it("is null without a session token", () => {
    expect(sessionCookieHeader("better-auth.session_data=d")).toBeNull();
    expect(sessionCookieHeader("my_session_tokens=1")).toBeNull();
    expect(sessionCookieHeader(undefined)).toBeNull();
  });

  it("reads bearer tokens", () => {
    expect(bearerToken("Bearer abc.def")).toBe("abc.def");
    expect(bearerToken("bearer abc")).toBe("abc");
    expect(bearerToken("Basic abc")).toBeNull();
  });
});
