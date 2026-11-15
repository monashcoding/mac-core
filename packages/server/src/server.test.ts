import { describe, expect, it } from "vitest";
import { z } from "zod";

import { memoize } from "./cache";
import { defineEnv, env, EnvError } from "./env";
import { describeError, HttpError, httpError } from "./errors";
import { checkHealth, createHealthHandler } from "./health";
import { defineJob } from "./job";
import { createLogger } from "./log";
import { clientAddress, createRateLimiter } from "./rate-limit";
import { fail, ok } from "./result";
import { handleRoute, parseBody, parseQuery } from "./route";

function recordingLogger() {
  const lines: string[] = [];

  const logger = createLogger("app", {
    write: (line) => lines.push(line),
    now: () => new Date("2026-11-15T00:00:00Z"),
  });

  return { lines, logger };
}

describe("defineEnv", () => {
  const schema = {
    DATABASE_URL: z.string(),
    PORT: env.integer(3000),
    ADMIN_ROLES: env.list(["exec", "committee"]),
    DEV_AUTH: env.flag(),
    AUTH_URL: env.url().default("https://auth.monashcoding.com"),
  };

  it("parses, coerces and fills fallbacks", () => {
    const parsed = defineEnv(schema, { DATABASE_URL: "postgres://x", ADMIN_ROLES: " Admin, exec ,", DEV_AUTH: "1", AUTH_URL: "https://auth.test/" });

    expect(parsed).toEqual({ DATABASE_URL: "postgres://x", PORT: 3000, ADMIN_ROLES: ["admin", "exec"], DEV_AUTH: true, AUTH_URL: "https://auth.test" });
    expect(defineEnv(schema, { DATABASE_URL: "x", PORT: "" })).toMatchObject({ PORT: 3000, ADMIN_ROLES: ["exec", "committee"], DEV_AUTH: false });
  });

  it("reports every problem at once", () => {
    const attempt = () => defineEnv({ DATABASE_URL: z.string(), SECRET: z.string().min(32), PORT: env.integer(1) }, { SECRET: "short", PORT: "abc" });

    expect(attempt).toThrowError(EnvError);
    expect(attempt).toThrowError(/DATABASE_URL[\s\S]*SECRET[\s\S]*PORT/);
  });
});

describe("describeError", () => {
  it("answers each kind of error", () => {
    expect(describeError(httpError.notFound())).toMatchObject({ status: 404, body: { error: "not_found" }, unexpected: false });
    expect(describeError(httpError.tooManyRequests(12.2)).headers).toEqual({ "retry-after": "13" });

    const invalid = z.object({ items: z.array(z.object({ name: z.string() })) }).safeParse({ items: [{}] });

    expect(describeError(invalid.error)).toMatchObject({
      status: 422,
      body: { error: "invalid_request", issues: [{ path: "items.0.name" }] },
    });
  });

  it("uses the status of errors from the other MAC packages", () => {
    const authError = Object.assign(new Error("Requires one of: exec."), { status: 403, code: "forbidden" });
    const featureOff = Object.assign(new Error('The "reviews" feature is off.'), { status: 404, feature: "reviews" });

    expect(describeError(authError)).toMatchObject({ status: 403, body: { error: "forbidden", message: "Requires one of: exec." } });
    expect(describeError(featureOff)).toMatchObject({ status: 404, body: { error: "not_found" } });
  });

  it("says nothing about an unknown failure", () => {
    const answer = describeError(new Error("connect ECONNREFUSED 10.0.0.5:5432"));

    expect(answer).toEqual({ status: 500, body: { error: "internal_error", message: "Something went wrong." }, headers: {}, unexpected: true });
    expect(describeError(Object.assign(new Error("boom"), { status: 500 })).status).toBe(500);
    expect(describeError("a string").status).toBe(500);
  });
});

describe("handleRoute", () => {
  it("turns thrown errors into responses and logs only the unexpected", async () => {
    const { lines, logger } = recordingLogger();

    const route = handleRoute<null>(async (request: Request) => {
      const body = await parseBody(request, z.object({ name: z.string().min(1) }));

      if (body.name === "taken") throw httpError.conflict("That name is taken.", "name_taken");

      if (body.name === "crash") throw new Error("db exploded");

      return Response.json({ name: body.name });
    }, { logger });

    const post = (body: string) => route(new Request("https://app.test/api/things", { method: "POST", body }), null);

    expect((await post('{"name":"ada"}')).status).toBe(200);
    expect(await (await post("not json")).json()).toMatchObject({ error: "invalid_json" });
    expect((await post('{"name":""}')).status).toBe(422);
    expect(await (await post('{"name":"taken"}')).json()).toEqual({ error: "name_taken", message: "That name is taken." });
    expect(lines).toHaveLength(0);

    const crashed = await post('{"name":"crash"}');

    expect(crashed.status).toBe(500);
    expect(await crashed.text()).not.toContain("exploded");
    expect(JSON.parse(lines[0] ?? "{}")).toMatchObject({ level: "error", scope: "app", message: "Route failed", method: "POST", path: "/api/things", errorMessage: "db exploded" });
  });

  it("lets Next's redirect and notFound signals through", async () => {
    const signal = Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT;replace;/login" });

    const route = handleRoute<null>(async () => {
      throw signal;
    });

    await expect(route(new Request("https://app.test/"), null)).rejects.toBe(signal);
  });

  it("parses query strings, with repeated keys as arrays", () => {
    const schema = z.object({ q: z.string(), tag: z.array(z.string()), page: z.coerce.number().default(1) });

    expect(parseQuery(new URL("https://app.test/?q=hi&tag=a&tag=b"), schema)).toEqual({ q: "hi", tag: ["a", "b"], page: 1 });
    expect(() => parseQuery(new URLSearchParams("tag=a"), schema)).toThrowError();
  });
});

describe("createRateLimiter", () => {
  it("allows the limit inside a window, then recovers as it slides", () => {
    let time = 0;
    const limiter = createRateLimiter({ limit: 2, windowMs: 10_000, now: () => time });

    expect(limiter.check("a")).toEqual({ allowed: true, remaining: 1, retryAfterSeconds: 0 });
    time = 4000;
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a")).toEqual({ allowed: false, remaining: 0, retryAfterSeconds: 6 });
    expect(limiter.check("b").allowed).toBe(true);
    time = 10_001;
    expect(limiter.check("a").allowed).toBe(true);
  });

  it("throws a 429 from enforce and forgets a key on reset", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, now: () => 0 });

    limiter.enforce("a");
    expect(() => limiter.enforce("a")).toThrowError(HttpError);
    expect(() => limiter.enforce("a")).toThrowError(expect.objectContaining({ status: 429 }));
    limiter.reset("a");
    expect(() => limiter.enforce("a")).not.toThrow();
  });

  it("keys by the address the proxy saw, not the one the client claimed", () => {
    expect(clientAddress(new Headers({ "x-forwarded-for": "1.1.1.1, 203.0.113.7" }))).toBe("203.0.113.7");
    expect(clientAddress(new Headers({ "cf-connecting-ip": "198.51.100.2", "x-forwarded-for": "1.1.1.1" }))).toBe("198.51.100.2");
    expect(clientAddress(new Headers())).toBe("unknown");
  });
});

describe("health", () => {
  it("reports ok, and degraded with a 503 when a check fails or hangs", async () => {
    expect(await checkHealth({ service: "monmap" })).toEqual({ status: "ok", service: "monmap", checks: {} });

    const handler = createHealthHandler({
      service: "monmap",
      timeoutMs: 20,
      checks: {
        db: async () => {},
        notion: async () => {
          throw new Error("401");
        },
        slow: () => new Promise(() => {}),
      },
    });

    const response = await handler();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "degraded", service: "monmap", checks: { db: "ok", notion: "down", slow: "down" } });
  });
});

describe("defineJob", () => {
  it("runs, skips when disabled, refuses to overlap and survives a failure", async () => {
    const { lines, logger } = recordingLogger();
    let release = () => {};
    let enabled = true;
    let crash = false;

    const job = defineJob({
      name: "ticket-sync",
      logger,
      enabled: () => enabled,
      run: () =>
        new Promise<void>((resolve, reject) => {
          release = crash ? () => reject(new Error("humanitix 403")) : resolve;
        }),
    });

    const first = job.run();

    expect(await job.run()).toBe("busy");
    release();
    expect(await first).toBe("ran");

    enabled = false;
    expect(await job.run()).toBe("skipped");

    enabled = true;
    crash = true;

    const failing = job.run();

    release();
    expect(await failing).toBe("failed");
    expect(lines.map((line) => `${JSON.parse(line).scope} ${JSON.parse(line).message}`)).toEqual([
      "app.ticket-sync Skipped: the previous run is still going",
      "app.ticket-sync Finished",
      "app.ticket-sync Failed",
    ]);
  });
});

describe("memoize", () => {
  it("shares one call, expires, drops failures and clears", async () => {
    let time = 0;
    let calls = 0;

    const load = memoize(
      async (code: string) => {
        calls += 1;

        if (code === "bad") throw new Error("nope");

        return `${code}:${calls}`;
      },
      { ttlMs: 1000, max: 2, now: () => time },
    );

    expect(await Promise.all([load("a"), load("a")])).toEqual(["a:1", "a:1"]);
    time = 1001;
    expect(await load("a")).toBe("a:2");

    await expect(load("bad")).rejects.toThrowError("nope");
    await expect(load("bad")).rejects.toThrowError("nope");
    expect(calls).toBe(4);

    load.clear();
    expect(await load("a")).toBe("a:5");
  });
});

describe("Result", () => {
  it("carries a value or a reason", () => {
    const taken = fail("name_taken", "That name is taken.");

    expect(ok({ id: 1 })).toEqual({ ok: true, value: { id: 1 } });
    expect(ok()).toEqual({ ok: true, value: undefined });
    expect(taken).toEqual({ ok: false, reason: "name_taken", message: "That name is taken." });
  });
});
