# @monashcoding/server

The server plumbing every MAC app repeats: environment, errors, validation, rate limits, health checks, logging, jobs and caching.

## Table of contents

* [Getting started](#getting-started)
* [Reading the environment](#reading-the-environment)
* [Throwing errors](#throwing-errors)
* [Route handlers in Next.js](#route-handlers-in-nextjs)
* [Express](#express)
* [Validating input](#validating-input)
* [Returning a result](#returning-a-result)
* [Rate limiting](#rate-limiting)
* [Health check](#health-check)
* [Logging](#logging)
* [Scheduled jobs](#scheduled-jobs)
* [Caching](#caching)

## Getting started

```bash
pnpm add @monashcoding/server zod
```

## Reading the environment

Read it once, in one file. A missing or invalid variable stops the app at startup, and every problem is listed together.

```ts
// lib/env.ts
import { defineEnv, env as e } from "@monashcoding/server";
import { z } from "zod";

export const env = defineEnv({
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string().min(32),
  PORT: e.integer(3000),                       // number, default 3000
  ADMIN_ROLES: e.list(["exec", "committee"]),  // "a, B" -> ["a", "b"]
  DEV_AUTH: e.flag(),                          // "1" / "true" / "on" -> true
  AUTH_URL: e.url().default("https://auth.monashcoding.com"),
  NOTION_TOKEN: z.string().optional(),
});
```

## Throwing errors

Throw anywhere below a route. Every error response has the same body.

```ts
import { HttpError, httpError } from "@monashcoding/server";

throw httpError.notFound();
throw httpError.forbidden();
throw httpError.badRequest("Pick a date in the future.");
throw httpError.conflict("That team name is taken.", "name_taken");
throw new HttpError(402, "payment_required", "This event needs a ticket.");
```

```jsonc
// 409
{ "error": "name_taken", "message": "That team name is taken." }

// 422, from a zod schema
{
  "error": "invalid_request",
  "message": "The request is not valid.",
  "issues": [{ "path": "members.0.email", "message": "Invalid email address" }]
}
```

## Route handlers in Next.js

`handleRoute` turns anything thrown into that response. Errors from `@monashcoding/auth` and `@monashcoding/features` keep their status.

```ts
// app/api/teams/route.ts
import { requireClaims } from "@monashcoding/auth/next";
import { handleRoute, parseBody } from "@monashcoding/server";
import { z } from "zod";

import { logger } from "@/lib/log";

const createTeam = z.object({ name: z.string().min(1).max(60) });

export const POST = handleRoute(async (request) => {
  const claims = await requireClaims();           // 401 when signed out
  const body = await parseBody(request, createTeam);   // 400 or 422 when invalid

  return Response.json(await teams.create(claims.macUserId, body.name), { status: 201 });
}, { logger });
```

## Express

```ts
import { apiNotFound, errorHandler } from "@monashcoding/server/express";

app.use("/api", routes);
app.use("/api", apiNotFound());

// Last. Logs unexpected failures and answers in the standard body.
app.use(errorHandler({ logger }));
```

## Validating input

```ts
import { parseBody, parseQuery } from "@monashcoding/server";

const body = await parseBody(request, z.object({ name: z.string() }));

// ?tag=a&tag=b&page=2 -> { tag: ["a", "b"], page: 2 }
const query = parseQuery(request, z.object({
  tag: z.array(z.string()).default([]),
  page: z.coerce.number().default(1),
}));
```

## Returning a result

For server actions and services where failing is a normal outcome.

```ts
import { fail, ok, type Result } from "@monashcoding/server";

export async function claimTicket(code: string): Promise<Result<Ticket, "no_match" | "already_claimed">> {
  const ticket = await tickets.find(code);

  if (!ticket) return fail("no_match", "We couldn't find that ticket.");
  if (ticket.claimedBy) return fail("already_claimed", "That ticket has been claimed.");

  return ok(await tickets.claim(ticket));
}
```

```ts
const result = await claimTicket(code);

if (!result.ok) {
  // result.reason is "no_match" | "already_claimed"
  return showError(result.message);
}

showTicket(result.value);
```

## Rate limiting

```ts
import { clientAddress, createRateLimiter } from "@monashcoding/server";

// 5 attempts per 15 minutes
const loginLimiter = createRateLimiter({ limit: 5, windowMs: 15 * 60_000 });

export const POST = handleRoute(async (request) => {
  const key = clientAddress(request.headers);

  loginLimiter.enforce(key);    // throws a 429 with retry-after

  await signIn(request);
  loginLimiter.reset(key);      // a successful login clears the count

  return Response.json({ ok: true });
});
```

```ts
// Or decide yourself
const { allowed, remaining, retryAfterSeconds } = limiter.check(claims.macUserId);
```

## Health check

```ts
// app/api/health/route.ts
import { createHealthHandler } from "@monashcoding/server";

export const GET = createHealthHandler({
  service: "monmap",
  checks: {
    db: async () => {
      await sql`select 1`;
    },
  },
});

// 200 { "status": "ok",       "service": "monmap", "checks": { "db": "ok" } }
// 503 { "status": "degraded", "service": "monmap", "checks": { "db": "down" } }
```

## Logging

One JSON object per line.

```ts
// lib/log.ts
import { createLogger } from "@monashcoding/server";

export const logger = createLogger("monmap");
```

```ts
logger.info("Review published", { reviewId: 42 });
logger.warn("Humanitix returned no orders");

try {
  await sync();
} catch (error) {
  logger.error("Sync failed", error, { eventId });
}

// {"level":"error","time":"...","scope":"monmap.ticket-sync","message":"Sync failed","eventId":"...","errorMessage":"..."}
const syncLogger = logger.child("ticket-sync");
```

## Scheduled jobs

```ts
import { defineJob } from "@monashcoding/server";
import cron from "node-cron";

const ticketSync = defineJob({
  name: "ticket-sync",
  logger,
  // Skipped when the integration is not configured
  enabled: () => env.HUMANITIX_API_KEY !== undefined,
  run: async () => {
    await syncTickets();
  },
});

// Never overlaps itself, never throws
cron.schedule("*/10 * * * *", () => void ticketSync.run());
```

## Caching

```ts
import { memoize } from "@monashcoding/server";

// Reused for an hour. Concurrent callers share one query.
export const getUnit = memoize(async (code: string, year: number) => loadUnit(code, year), {
  ttlMs: 60 * 60_000,
  max: 500,
});

await getUnit("FIT1045", 2027);

// After a write that changes the answers
getUnit.clear();
```
