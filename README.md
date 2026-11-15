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
Connects to the shared server, encrypts sensitive columns and creates a database per app.

### [@monashcoding/lint](packages/lint)

The MAC Oxlint preset.
Turns on every anti-slop rule in three lines of config.

### [@monashcoding/tsconfig](packages/tsconfig)

TypeScript presets.
One for Next.js apps, one for Node services, one for libraries.
