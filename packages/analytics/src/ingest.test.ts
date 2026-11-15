import { describe, expect, it } from "vitest";

import { createIngestHandler, forwardRequestHeaders, forwardResponseHeaders, ingestTarget, MAX_BODY } from "./ingest";

describe("ingestTarget", () => {
  it("maps event and asset paths to their hosts", () => {
    expect(ingestTarget("/ingest/e/", "?ip=1")?.href).toBe("https://us.i.posthog.com/e/?ip=1");
    expect(ingestTarget("/ingest/static/recorder.js", "")?.href).toBe(
      "https://us-assets.i.posthog.com/static/recorder.js",
    );
  });

  it("refuses paths posthog-js does not use", () => {
    expect(ingestTarget("/ingest/api/projects", "")).toBeNull();
    expect(ingestTarget("/ingest/e/../api/projects", "")).toBeNull();
    expect(ingestTarget("/ingestion/e/", "")).toBeNull();
    expect(ingestTarget("/other/e/", "")).toBeNull();
  });

  it("follows a custom mount", () => {
    expect(ingestTarget("/api/ph/flags/", "", "/api/ph")?.href).toBe("https://us.i.posthog.com/flags/");
  });
});

describe("headers", () => {
  it("never forwards a cookie", () => {
    const headers = forwardRequestHeaders(
      new Headers({ cookie: "a.session_token=secret", "content-type": "text/plain", authorization: "Bearer x" }),
    );

    expect([...headers.keys()]).toEqual(["content-type"]);
  });

  it("drops set-cookie and serves html as plain text", () => {
    const headers = forwardResponseHeaders(
      new Headers({ "set-cookie": "ph=1", "content-type": "text/html", "content-encoding": "gzip" }),
    );

    expect(headers.get("set-cookie")).toBeNull();
    expect(headers.get("content-encoding")).toBeNull();
    expect(headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(headers.get("x-content-type-options")).toBe("nosniff");
  });
});

describe("createIngestHandler", () => {
  it("proxies an event without the session cookie", async () => {
    const seen: string[] = [];

    const handler = createIngestHandler({
      fetch: async (input, init) => {
        seen.push(`${String(input)} cookie=${new Headers(init?.headers).get("cookie")}`);

        return Response.json({ status: 1 }, { headers: { "set-cookie": "ph=1" } });
      },
    });

    const response = await handler(
      new Request("https://monmap.monashcoding.com/ingest/e/?v=1", {
        method: "POST",
        body: "{}",
        headers: { cookie: "a.session_token=secret", "content-type": "text/plain" },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(seen).toEqual(["https://us.i.posthog.com/e/?v=1 cookie=null"]);
  });

  it("answers 404, 413 and 502 without calling PostHog's API", async () => {
    const handler = createIngestHandler({
      fetch: async () => new Response(null, { status: 302, headers: { location: "https://evil.test" } }),
    });

    const base = "https://monmap.monashcoding.com/ingest";

    expect((await handler(new Request(`${base}/api/projects`))).status).toBe(404);
    expect(
      (
        await handler(
          new Request(`${base}/e/`, {
            method: "POST",
            body: "x",
            headers: { "content-length": String(MAX_BODY + 1) },
          }),
        )
      ).status,
    ).toBe(413);
    expect((await handler(new Request(`${base}/e/`))).status).toBe(502);
  });
});
