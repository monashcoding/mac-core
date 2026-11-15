# MAC conventions

How every MAC app is built on mac-core. Each rule has an id; cite it in reviews.

## Features

**`feature.registry`** Every gated feature is declared once, in `lib/features.ts`. Code asks the registry by name and never writes a PostHog flag key.

```ts
export const features = defineFeatures({
  app: "monmap",
  flags: posthogFlags({ token: env.POSTHOG_TOKEN, secretKey: env.POSTHOG_SECRET_KEY }),
  features: {
    aiPlanner: feature.release({ description: "AI plan suggestions", owner: "swofty", expires: "2027-03-01" }),
    reviews: feature.killSwitch({ description: "Unit reviews", owner: "swofty" }),
    moderation: feature.staff({ description: "Review moderation queue", owner: "swofty", roles: ["committee", "exec"] }),
  },
});
```

**`feature.kind`** A feature is one of four kinds.

| Kind | Without a flag | Use for |
|---|---|---|
| `feature.release` | off | New work that is not ready for everyone |
| `feature.killSwitch` | on | A shipped feature you may need to turn off in an incident |
| `feature.staff` | on for its roles, off for everyone else | Committee, exec and admin tools |
| `feature.members` | on for current club members, off for everyone else | Member-only perks |

**`feature.expires`** A release feature carries the date its flag is deleted by. `features.expired()` is asserted empty in a test, so an overdue flag fails CI.

**`feature.server`** Features are evaluated on the server, once per request, and handed to the client with the page. The browser never asks PostHog for a flag.

**`feature.gate-both`** Hiding a button is not a gate. The route or server action behind it calls `require()` too.

```ts
const features = await getFeatures();

features.require("aiPlanner"); // 404 when off
```

**`feature.roles-are-hard`** A staff feature's roles and a members feature's membership are limits no flag can widen. Access control never depends on PostHog being reachable.

**`feature.sync`** PostHog flags are created by `syncFlags(features)` from the registry, never by hand. A flag in PostHog that the registry does not know is reported as orphaned and deleted.

**`feature.one-project`** Every MAC app reports to one PostHog project. Events carry an `app` property and flag keys are `<app>-<feature-name>`.

## Data

**`data.own-database`** Each app has its own database and its own login role on the shared Postgres server, created with `mac-db provision`.

**`data.mac-user-id`** Rows that belong to a person are keyed by `macUserId`. Never by email.

**`data.migrations`** Schema changes reach a database through a generated, reviewed migration file. `drizzle-kit push` is never run against a shared database.

**`data.encrypt`** Phone numbers, student ids, addresses, health or dietary details, and third-party tokens are stored in `encryptedText` or `encryptedJson` columns.

**`data.reveal-late`** A `Sensitive` value is revealed at the point of use, never passed around revealed or put in a log.

**`data.list`** A page that filters, sorts or pages rows declares a `defineList`. Sort columns and filters are an allowlist in code; a query string cannot reach anything else.

**`data.keyset`** Lists page by keyset (`after` cursor), never by `OFFSET`.

**`data.list-index`** Every sort of a list has an index on `(sort column, id)`. Every `filter.contains` column has a `pg_trgm` GIN index, and every `filter.fullText` column a GIN index.

**`data.like-escape`** User text never goes into `LIKE`, `ILIKE` or a regular expression unescaped. Use `filter.contains` or `escapeLike`.

## Server

**`server.env`** The environment is read in one file, `lib/env.ts`, with `defineEnv`. Nothing else reads `process.env`.

**`server.errors`** Routes throw; they do not build error responses. `handleRoute` (Next) or `errorHandler` (Express) turns what was thrown into `{ error, message, issues? }`.

**`server.error-codes`** `error` is a stable snake_case code. `message` is a sentence for a person. Clients branch on `error` only.

**`server.validate`** Request bodies and query strings are parsed with zod at the route, through `parseBody` and `parseQuery`.

**`server.result`** A function returns a `Result` when failing is a normal outcome the caller handles, and throws otherwise.

**`server.rate-limit`** Every public write endpoint and every login attempt goes through a rate limiter, keyed by `clientAddress` or `macUserId`.

**`server.health`** Every app serves `GET /api/health` from `createHealthHandler`, with a check for each dependency it cannot run without.

**`server.log`** Logging goes through `createLogger`. No `console.log` in server code.

**`server.jobs`** Every scheduled task is a `defineJob`.

## Auth

**`auth.verify`** Tokens are verified by `@monashcoding/auth`. No app carries its own verifier.

**`auth.club-member`** Member-only access is a check on the `clubMember` claim (`requireClubMember`, `feature.members`). The `member` role is every signed-in account and gates nothing. No app keeps its own member list.

**`auth.roles`** Authorisation is a role check on the server (`requireClaims`, `requireAuth`, `feature.staff`). Email allowlists are not used.

## Analytics

**`analytics.wrapper`** `posthog-js` and `posthog-node` are imported only by the MAC packages. The lint preset enforces it.

**`analytics.no-pii`** Events are identified by `macUserId` and carry no email, name or user-typed text.

## Code

**`code.lint`** Every app uses the `@monashcoding/lint` preset with all anti-slop rules at `error`.

**`code.seams`** Anything that talks to the network or reads the clock takes it as an option. Tests pass a fake through that option; module mocking is a lint error.

**`code.commits`** Commits follow Conventional Commits.
