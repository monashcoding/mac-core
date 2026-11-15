import { SignJWT } from "jose";
import { beforeAll, describe, expect, it } from "vitest";

import { MacAuthError } from "./errors";
import { createMacAuth, type MacAuth } from "./server";
import { createTestIssuer, TEST_AUTH_URL, type TestIssuer } from "./testing";

let issuer: TestIssuer;
let auth: MacAuth;

beforeAll(async () => {
  issuer = await createTestIssuer();
  auth = createMacAuth({ authUrl: TEST_AUTH_URL, keys: issuer.keys });
});

describe("verifyToken", () => {
  it("reads clubMember, and treats a token without it as not a member", async () => {
    const member = await auth.verifyToken(await issuer.sign({ claims: { clubMember: true } }));

    expect(member.clubMember).toBe(true);
    expect((await auth.verifyToken(await issuer.sign())).clubMember).toBe(false);
  });

  it("returns the claims of a valid token", async () => {
    const claims = await auth.verifyToken(await issuer.sign());

    expect(claims).toEqual({
      macUserId: "user_1",
      email: "ada@student.monash.edu",
      name: "Ada Lovelace",
      roles: ["member", "committee"],
      team: "Projects",
      clubMember: false,
      ver: 1,
    });
  });

  it("fills optional claims the token leaves out", async () => {
    const token = await issuer.sign({ claims: { name: null, team: null } });

    expect(await auth.verifyToken(token)).toMatchObject({ name: "", team: null });
  });

  it("rejects a token signed by another key", async () => {
    const other = await createTestIssuer();

    await expect(auth.verifyToken(await other.sign())).rejects.toBeInstanceOf(MacAuthError);
  });

  it("rejects another audience", async () => {
    const token = await issuer.sign({ audience: "someone-else" });

    await expect(auth.verifyToken(token)).rejects.toMatchObject({ code: "invalid_token", status: 401 });
  });

  it("rejects another issuer", async () => {
    const token = await issuer.sign({ issuer: "https://evil.test" });

    await expect(auth.verifyToken(token)).rejects.toBeInstanceOf(MacAuthError);
  });

  it("rejects an expired token", async () => {
    const token = await issuer.sign({ expiresIn: "-1m" });

    await expect(auth.verifyToken(token)).rejects.toBeInstanceOf(MacAuthError);
  });

  it("rejects a token signed with a shared secret", async () => {
    const token = await new SignJWT({ macUserId: "user_1", email: "a@monash.edu" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer(TEST_AUTH_URL)
      .setAudience("mac-suite")
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode("a-shared-secret-of-enough-length-000"));

    await expect(auth.verifyToken(token)).rejects.toBeInstanceOf(MacAuthError);
  });

  it("rejects a token without a macUserId", async () => {
    const token = await issuer.sign({ claims: { macUserId: "" } });

    await expect(auth.verifyToken(token)).rejects.toMatchObject({ code: "invalid_token" });
  });
});

describe("claimsFromBearer", () => {
  it("reads a bearer token", async () => {
    const claims = await auth.claimsFromBearer(`Bearer ${await issuer.sign()}`);

    expect(claims?.macUserId).toBe("user_1");
  });

  it("is null for a missing or invalid header", async () => {
    expect(await auth.claimsFromBearer(null)).toBeNull();
    expect(await auth.claimsFromBearer("Bearer nonsense")).toBeNull();
  });
});

describe("claimsFromCookie", () => {
  it("mints a token from the session cookie only", async () => {
    const seen: string[] = [];
    const token = await issuer.sign();

    const withCookie = createMacAuth({
      authUrl: TEST_AUTH_URL,
      keys: issuer.keys,
      fetch: async (input, init) => {
        seen.push(`${String(input)} ${new Headers(init?.headers).get("cookie")}`);

        return Response.json({ token });
      },
    });

    const claims = await withCookie.claimsFromCookie(
      "_ga=GA1.1; __Secure-better-auth.session_token=abc; theme=dark",
    );

    expect(claims?.macUserId).toBe("user_1");
    expect(seen).toEqual([
      "https://auth.test/api/auth/token __Secure-better-auth.session_token=abc",
    ]);
  });

  it("never calls mac-auth for a visitor without a session", async () => {
    const strict = createMacAuth({
      authUrl: TEST_AUTH_URL,
      keys: issuer.keys,
      fetch: async () => {
        throw new Error("mac-auth must not be called");
      },
    });

    expect(await strict.claimsFromCookie("_ga=GA1.1")).toBeNull();
    expect(await strict.claimsFromCookie(null)).toBeNull();
  });

  it("is null when the session expired or mac-auth is down", async () => {
    const expired = createMacAuth({
      authUrl: TEST_AUTH_URL,
      keys: issuer.keys,
      fetch: async () => new Response(null, { status: 401 }),
    });

    const down = createMacAuth({
      authUrl: TEST_AUTH_URL,
      keys: issuer.keys,
      fetch: async () => {
        throw new Error("connect ECONNREFUSED");
      },
    });

    expect(await expired.claimsFromCookie("a.session_token=abc")).toBeNull();
    expect(await down.claimsFromCookie("a.session_token=abc")).toBeNull();
  });
});

describe("claimsFromHeaders", () => {
  it("prefers the bearer token over the cookie", async () => {
    const headers = new Headers({
      authorization: `Bearer ${await issuer.sign({ claims: { macUserId: "from_bearer" } })}`,
      cookie: "a.session_token=abc",
    });

    expect((await auth.claimsFromHeaders(headers))?.macUserId).toBe("from_bearer");
  });
});
