import { beforeAll, describe, expect, it } from "vitest";

import { createMacAuthClient } from "./client";
import { createTestIssuer, type TestIssuer } from "./testing";

let issuer: TestIssuer;

beforeAll(async () => {
  issuer = await createTestIssuer();
});

describe("createMacAuthClient", () => {
  it("loads the session and notifies subscribers", async () => {
    const token = await issuer.sign();

    const client = createMacAuthClient({
      authUrl: "https://auth.test/",
      fetch: async () => Response.json({ token }),
    });

    const seen: string[] = [];

    client.subscribe(() => seen.push(client.getSession().status));

    expect(client.getSession().status).toBe("loading");

    const session = await client.refresh();

    expect(session.user?.macUserId).toBe("user_1");
    expect(seen).toEqual(["signed-in"]);
  });

  it("is signed out on 401", async () => {
    const client = createMacAuthClient({ fetch: async () => new Response(null, { status: 401 }) });

    expect(await client.refresh()).toEqual({ status: "signed-out", user: null });
    expect(await client.getToken()).toBeNull();
  });

  it("mints one token for concurrent callers and reuses it while fresh", async () => {
    const token = await issuer.sign();
    let mints = 0;

    const client = createMacAuthClient({
      fetch: async () => {
        mints += 1;

        return Response.json({ token });
      },
    });

    await Promise.all([client.getToken(), client.getToken()]);
    await client.getToken();

    expect(mints).toBe(1);
  });

  it("attaches the token and retries once on 401", async () => {
    const token = await issuer.sign();
    const calls: string[] = [];

    const client = createMacAuthClient({
      authUrl: "https://auth.test",
      fetch: async (input, init) => {
        const url = String(input);

        if (url.startsWith("https://auth.test")) return Response.json({ token });

        calls.push(new Headers(init?.headers).get("authorization") ?? "none");

        return new Response(null, { status: calls.length === 1 ? 401 : 200 });
      },
    });

    const response = await client.fetch("https://app.test/api/notes");

    expect(response.status).toBe(200);
    expect(calls).toEqual([`Bearer ${token}`, `Bearer ${token}`]);
  });

  it("reads membership, and is null when signed out", async () => {
    const body = { clubMember: false, link: { linked: false, canEnterStudentId: true, contactUs: false, attemptsRemaining: 20 } };
    const urls: string[] = [];

    const client = createMacAuthClient({
      authUrl: "https://auth.test",
      fetch: async (input) => {
        urls.push(String(input));

        return Response.json(body);
      },
    });

    expect(await client.getMembership()).toEqual({
      clubMember: false,
      linked: false,
      canEnterStudentId: true,
      contactUs: false,
      attemptsRemaining: 20,
    });
    expect(urls).toEqual(["https://auth.test/api/membership/me"]);

    const signedOut = createMacAuthClient({ fetch: async () => new Response(null, { status: 401 }) });

    expect(await signedOut.getMembership()).toBeNull();
  });

  it("links by student ID and reloads the session so the claim is current", async () => {
    const token = await issuer.sign({ claims: { clubMember: true } });
    const calls: string[] = [];

    const client = createMacAuthClient({
      authUrl: "https://auth.test",
      fetch: async (input, init) => {
        const path = new URL(String(input)).pathname;

        calls.push(`${init?.method ?? "GET"} ${path}`);

        if (path === "/api/auth/token") return Response.json({ token });

        return Response.json({ clubMember: true, link: { linked: true, canEnterStudentId: false, contactUs: false } });
      },
    });

    const result = await client.linkStudentId("31234567");

    expect(result).toEqual({
      ok: true,
      membership: { clubMember: true, linked: true, canEnterStudentId: false, contactUs: false, attemptsRemaining: null },
    });
    expect(calls).toEqual(["POST /api/membership/me/student-id", "GET /api/auth/token"]);
    expect(client.getSession().user?.clubMember).toBe(true);
  });

  it("reports a student ID that did not match", async () => {
    const client = createMacAuthClient({
      fetch: async () => Response.json({ error: "no_match", message: "No match.", attemptsRemaining: 19 }, { status: 422 }),
    });

    expect(await client.linkStudentId("1")).toEqual({ ok: false, message: "No match.", attemptsRemaining: 19 });
  });
});
