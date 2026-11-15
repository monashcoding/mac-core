# @monashcoding/analytics

PostHog and Google Analytics for MAC apps.

```bash
pnpm add @monashcoding/analytics posthog-js posthog-node
```

## Browser

```ts
// lib/analytics.ts
import { createAnalytics } from "@monashcoding/analytics/client";

export const analytics = createAnalytics({
  posthogToken: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
  gaId: process.env.NEXT_PUBLIC_GA_ID,
});
```

```tsx
// components/analytics.tsx
"use client";

import { MacAnalytics } from "@monashcoding/analytics/react";
import { useMacSession } from "@monashcoding/auth/react";

import { analytics } from "@/lib/analytics";

export function Analytics() {
  const session = useMacSession();
  const userId = session.status === "loading" ? undefined : (session.user?.macUserId ?? null);

  return <MacAnalytics analytics={analytics} userId={userId} />;
}
```

```ts
analytics.capture("unit_added", { year: 2, semester: 1 });
```

## PostHog proxy

```ts
// app/ingest/[...path]/route.ts
import { createIngestHandler } from "@monashcoding/analytics/ingest";

const handler = createIngestHandler();

export const dynamic = "force-dynamic";
export const GET = handler;
export const POST = handler;
export const OPTIONS = handler;
```

```js
// next.config.mjs
export default { skipTrailingSlashRedirect: true };
```

The proxy forwards an allowlist of headers. The `.monashcoding.com` session cookie never reaches PostHog.

## Server

```ts
import { createServerAnalytics } from "@monashcoding/analytics/server";

const analytics = createServerAnalytics({
  posthogToken: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

await analytics.capture(claims.macUserId, "plan_saved", { units: 24 });
```

## Rules

- Nothing is sent outside production builds. Pass `enabled: true` to override.
- Events are identified by `macUserId`. Properties are strings, numbers, booleans or null; never an email, a name or user-typed text.
- Session replay masks all text, inputs and text-bearing attributes, and never records request bodies or headers.
- Google Analytics records page views only.
- `posthog-js` and `posthog-node` are imported by this package alone. The `@monashcoding/lint` preset makes a direct import an error.
