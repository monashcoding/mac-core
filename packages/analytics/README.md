# @monashcoding/analytics

PostHog and Google Analytics for MAC apps. One setup per app, with replay masking and the PostHog proxy included.

## Table of contents

* [Getting started](#getting-started)
* [Creating the analytics object](#creating-the-analytics-object)
* [Starting it in the root layout](#starting-it-in-the-root-layout)
* [Capturing events](#capturing-events)
* [Adding the PostHog proxy](#adding-the-posthog-proxy)
* [Capturing events on the server](#capturing-events-on-the-server)

## Getting started

```bash
pnpm add @monashcoding/analytics posthog-js posthog-node
```

```bash
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...
NEXT_PUBLIC_GA_ID=G-...
```

## Creating the analytics object

Create one per app and import it wherever you capture events.

```ts
// lib/analytics.ts
import { createAnalytics } from "@monashcoding/analytics/client";

export const analytics = createAnalytics({
  // Sent with every event, so one PostHog project holds every MAC app
  app: "monmap",
  // Leave either out to turn that service off
  posthogToken: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
  gaId: process.env.NEXT_PUBLIC_GA_ID,
  // Nothing is sent outside production builds. Set this to test locally.
  // enabled: true,
});
```

## Starting it in the root layout

`<MacAnalytics />` starts PostHog and Google Analytics, and ties events to the signed-in user.

```tsx
// components/analytics.tsx
"use client";

import { MacAnalytics } from "@monashcoding/analytics/react";
import { useMacSession } from "@monashcoding/auth/react";

import { analytics } from "@/lib/analytics";

export function Analytics() {
  const session = useMacSession();

  // undefined while the session loads, null when signed out
  const userId = session.status === "loading" ? undefined : (session.user?.macUserId ?? null);

  return <MacAnalytics analytics={analytics} userId={userId} />;
}
```

```tsx
// app/layout.tsx
<body>
  {children}
  <Analytics />
</body>
```

## Capturing events

```ts
import { analytics } from "@/lib/analytics";

analytics.capture("unit_added");

// Properties are strings, numbers, booleans or null.
// Never pass an email, a name or anything the user typed.
analytics.capture("unit_added", { year: 2, semester: 1 });
```

## Adding the PostHog proxy

PostHog is called through `/ingest` on your own domain, so ad blockers do not drop events.

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
export default {
  // PostHog calls /ingest/e/ with a trailing slash
  skipTrailingSlashRedirect: true,
};
```

## Capturing events on the server

```ts
import { createServerAnalytics } from "@monashcoding/analytics/server";

const analytics = createServerAnalytics({
  app: "monmap",
  posthogToken: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
});

// The first argument is the user's macUserId
await analytics.capture(claims.macUserId, "plan_saved", { units: 24 });
```
