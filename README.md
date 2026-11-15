# mac-core

Shared TypeScript packages for Monash Association of Coding apps.

## Components

### [@monashcoding/auth](packages/auth)

Sign-in for MAC apps through mac-auth.
Gives an app the signed-in user and role checks in Next.js, Express and the browser.

### [@monashcoding/analytics](packages/analytics)

PostHog and Google Analytics for MAC apps.
One setup per app, with replay masking and the PostHog proxy included.

### [@monashcoding/db](packages/db)

Postgres for MAC apps through Drizzle.
Connects to the shared server, encrypts sensitive columns, and filters, sorts and pages lists.

### [@monashcoding/features](packages/features)

A typed feature registry.
Features are declared once and gated by PostHog flags and mac-auth roles.

### [@monashcoding/server](packages/server)

The server plumbing every app repeats.
Environment, errors, validation, rate limits, health checks, logging, jobs and caching.

### [@monashcoding/lint](packages/lint)

The MAC Oxlint preset.
Turns on every anti-slop rule in three lines of config.

### [@monashcoding/tsconfig](packages/tsconfig)

TypeScript presets.
One for Next.js apps, one for Node services, one for libraries.

## Conventions

[CONVENTIONS.md](CONVENTIONS.md) is how every MAC app is built on these packages.
