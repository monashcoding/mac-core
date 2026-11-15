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
});
