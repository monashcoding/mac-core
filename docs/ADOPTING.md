# Adopting mac-core

## What each app replaces

| App | Repo | Auth | Analytics | Database |
|---|---|---|---|---|
| MAC website | `monashcoding-site` | `lib/mac-auth.ts` → `@monashcoding/auth/next` | add `createAnalytics` + `/ingest` | Sanity stays |
| MonMap | `monmap` | `lib/mac-auth.ts`, `getClaims` in `lib/auth-server.ts`, `lib/auth-client.ts` | `lib/analytics.ts`, `lib/posthog-server.ts`, `lib/ingest-proxy.ts`, `components/posthog-identify.tsx` | `packages/db` client → `createDb`; move to the shared server |
| Study app | `mac-study` | `src/lib/auth/mac-auth.ts`, `mac-auth-browser.ts` | add | Supabase → shared server |
| Job board | `mploy-app` | `frontend/src/lib/mac-auth.ts` | `components/analytics/posthog-*.tsx` | MongoDB → shared server |
| Timetabler | new | start on `@monashcoding/auth` | start on `@monashcoding/analytics` | start on `@monashcoding/db` |
| verification, resource-hub, hackathons | Express | `src/server/auth/mac-auth.ts` → `@monashcoding/auth/express`; `web/src/auth.ts` → `@monashcoding/auth/client` | add | `createDb`; move to the shared server |
| sponsorship-crm | Express | `src/middleware/auth.ts` | add | `createDb`; move to the shared server |
| eox-vote | Next | own device and admin login stays | add | `createDb` |
| mac-auth | issuer | import `macClaimsSchema` for the token payload | none | `createDb` |

## Order

1. `@monashcoding/lint` and `@monashcoding/tsconfig`, with the strict rules at `warn`.
2. `@monashcoding/auth`. Delete the app's copy of the verifier.
3. `@monashcoding/analytics`.
4. `@monashcoding/db`, then the move to the shared server.

## Moving an app's database to the shared server

```bash
# 1. Role and database
ADMIN_DATABASE_URL=... pnpm mac-db provision monmap

# 2. Copy the data (app in maintenance mode)
pg_dump --no-owner --no-acl "$OLD_DATABASE_URL" | psql "$NEW_DATABASE_URL"

# 3. Point the app at it
#    Dokploy: set DATABASE_URL, redeploy

# 4. Compare row counts, then retire the old database
```

MongoDB (job board) and Supabase (study app) need a schema written in Drizzle and a one-off import script; `pg_dump` covers the Postgres apps.

## Shared server checklist

- Daily automated backups with point-in-time recovery, and one restore rehearsed.
- TLS required. `createDb` connects with `require` to every host except localhost.
- Network access limited to the MAC box.
- One role and one database per app (`mac-db provision`). The administrator role is used for provisioning only.
- `MAC_DATA_KEYS` and `MAC_INDEX_KEY` per app, stored in Dokploy and the committee password manager.
