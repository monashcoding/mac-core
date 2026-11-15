# mac-core

Shared packages for every MAC app. Published to npm as `@monashcoding/*`.

| Package | Path | Holds |
|---|---|---|
| `@monashcoding/auth` | `packages/auth` | mac-auth token verifier, session lookup, role guards, Next / Express / browser / React adapters |
| `@monashcoding/analytics` | `packages/analytics` | PostHog and Google Analytics clients, the `/ingest` proxy |
| `@monashcoding/db` | `packages/db` | Drizzle client, shared columns, encrypted columns, list queries, `mac-db` CLI |
| `@monashcoding/features` | `packages/features` | Feature registry, PostHog flag source and sync, React components |
| `@monashcoding/server` | `packages/server` | Env, errors, route wrappers, validation, rate limits, health, logging, jobs, caching |
| `@monashcoding/lint` | `packages/lint` | Oxlint preset and the vendored anti-slop plugin |
| `@monashcoding/tsconfig` | `packages/tsconfig` | TypeScript presets |

## Commands

```bash
pnpm install
pnpm check        # build, lint, typecheck, test
pnpm lint:fix     # apply the spacing autofix
pnpm changeset    # describe a change for the next release
```

## Rules

- `CONVENTIONS.md` is the rule set for apps built on these packages. A new package capability gets its rule there.
- READMEs are usage only: a description, a table of contents, then one section per task with a commented code block.
- Every package is a library an app calls. Nothing here owns an app's routes, schema or deploy.
- A package never reads an app's files. Configuration comes in through function options, with environment variables as defaults.
- Anything that talks to the network or the clock takes it as an option (`fetch`, `keys`, `loadPostHog`, `createClient`). Tests pass a fake through that option; `vi.mock` is a lint error.
- Parse untrusted input with zod where it enters. `typeof` narrowing, `unknown` parameters and unexplained `as` are lint errors.
- A type assertion needs a `// SAFETY:` comment stating the invariant.
- `react`, `next`, `express`, `drizzle-orm`, `postgres`, `posthog-js` and `posthog-node` are peer dependencies. Never move one to `dependencies`.
- Analytics events carry a `macUserId` and non-identifying properties. Never an email, a name or user-typed text.
- `packages/lint/src/anti-slop` is a vendored copy of dmmulroy/anti-slop. Record every local change in its `UPSTREAM.md`.
- A change to a published package needs a changeset. A change to the token claims in `packages/auth/src/claims.ts` is a breaking change for every app.
- Commits follow Conventional Commits.
