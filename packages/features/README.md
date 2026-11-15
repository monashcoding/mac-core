# @monashcoding/features

A typed feature registry for MAC apps. Features are declared once, gated by PostHog flags and mac-auth roles, and evaluated on the server.

## Table of contents

* [Getting started](#getting-started)
* [Declaring features](#declaring-features)
* [Checking a feature on the server](#checking-a-feature-on-the-server)
* [Checking a feature in a client component](#checking-a-feature-in-a-client-component)
* [Turning features on locally](#turning-features-on-locally)
* [Creating the PostHog flags](#creating-the-posthog-flags)
* [Failing CI on an overdue flag](#failing-ci-on-an-overdue-flag)
* [Testing](#testing)

## Getting started

```bash
pnpm add @monashcoding/features posthog-node
```

```bash
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...

# Optional. Evaluates flags in-process, with no network call per request.
POSTHOG_SECRET_KEY=phs_...
```

## Declaring features

Every gated feature lives in one registry. There are three kinds.

```ts
// lib/features.ts
import { defineFeatures, feature } from "@monashcoding/features";
import { posthogFlags } from "@monashcoding/features/posthog";

export const features = defineFeatures({
  // PostHog flag keys are "<app>-<feature-name>": monmap-ai-planner
  app: "monmap",
  flags: posthogFlags({
    token: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
    secretKey: process.env.POSTHOG_SECRET_KEY,
  }),
  features: {
    // Off until its flag turns it on. Carries the date the flag is deleted by.
    aiPlanner: feature.release({
      description: "AI plan suggestions",
      owner: "swofty",
      expires: "2027-03-01",
    }),

    // On unless its flag turns it off.
    reviews: feature.killSwitch({
      description: "Unit reviews",
      owner: "swofty",
    }),

    // On for these mac-auth roles, off for everyone else. No flag can widen it.
    moderation: feature.staff({
      description: "Review moderation queue",
      owner: "swofty",
      roles: ["committee", "exec"],
    }),
  },
});
```

## Checking a feature on the server

Evaluate once per request, then read as often as you like.

```ts
// lib/features.ts
import { getClaims } from "@monashcoding/auth/next";
import { cache } from "react";

export const getFeatures = cache(async () => features.evaluate(await getClaims()));
```

```tsx
// A server component
const set = await getFeatures();

if (set.isEnabled("aiPlanner")) {
  // ...
}
```

```ts
// A server action or route handler: throws a 404 error when the feature is off
const set = await getFeatures();

set.require("moderation");
```

```ts
// Signed-out visitors only join a percentage rollout if you give them a stable id
const set = await features.evaluate(null, { anonymousId: visitorId });
```

## Checking a feature in a client component

The server hands its values to the page, so the first render already knows them.

```ts
// lib/feature-components.ts
"use client";

import { createFeatureComponents } from "@monashcoding/features/react";

import { features } from "./features";

export const { FeaturesProvider, Feature, useFeature } = createFeatureComponents(features);
```

```tsx
// app/layout.tsx
const set = await getFeatures();

<FeaturesProvider values={set.values}>{children}</FeaturesProvider>
```

```tsx
"use client";

export function Toolbar() {
  const showPlanner = useFeature("aiPlanner"); // "aiPlaner" is a type error

  return (
    <>
      {showPlanner && <PlannerButton />}
      <Feature name="reviews" fallback={<ReviewsPaused />}>
        <ReviewList />
      </Feature>
    </>
  );
}
```

## Turning features on locally

```bash
# .env.local. Ignored in production.
MAC_FEATURES=aiPlanner=on,reviews=off
```

## Creating the PostHog flags

`syncFlags` creates the flag of every feature that has none yet. Existing flags are never changed.

```ts
// scripts/sync-flags.ts
import { formatSyncReport, syncFlags } from "@monashcoding/features/sync";

import { features } from "../lib/features";

console.log(formatSyncReport(await syncFlags(features)));
```

```bash
POSTHOG_PERSONAL_API_KEY=phx_... POSTHOG_PROJECT_ID=12345 node scripts/sync-flags.ts

# created   monmap-ai-planner     new, starts at 0%
# existing  monmap-reviews
# orphaned  monmap-old-search     in PostHog, not in the registry: delete it
# expired   monmap-ai-planner     past its date: ship it or remove it
```

```ts
// See what would be created without creating it
await syncFlags(features, { dryRun: true });
```

## Failing CI on an overdue flag

```ts
import { expect, it } from "vitest";

import { features } from "@/lib/features";

it("has no release flag past its date", () => {
  expect(features.expired().map((entry) => entry.name)).toEqual([]);
});
```

## Testing

```ts
// A FeatureSet with exactly these features on
const set = features.fromValues({ aiPlanner: true });

// A registry with a fake flag source
const testFeatures = defineFeatures({
  app: "monmap",
  features: { /* ... */ },
  flags: async () => ({ "monmap-ai-planner": true }),
});
```
