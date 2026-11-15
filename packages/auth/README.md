# @monashcoding/auth

Sign-in for MAC apps through mac-auth. Gives an app the signed-in user and role checks in Next.js, Express and the browser.

## Table of contents

* [Getting started](#getting-started)
* [Getting the signed-in user in Next.js](#getting-the-signed-in-user-in-nextjs)
* [Requiring a role](#requiring-a-role)
* [Requiring a club member](#requiring-a-club-member)
* [Protecting a route handler](#protecting-a-route-handler)
* [Express](#express)
* [Signing in and out from the browser](#signing-in-and-out-from-the-browser)
* [Linking a membership from the browser](#linking-a-membership-from-the-browser)
* [The session in a React component](#the-session-in-a-react-component)
* [Verifying a token yourself](#verifying-a-token-yourself)
* [Testing](#testing)

## Getting started

```bash
pnpm add @monashcoding/auth
```

```bash
# Both are optional. These are the defaults.
AUTH_URL=https://auth.monashcoding.com
JWT_AUDIENCE=mac-suite
```

## Getting the signed-in user in Next.js

Call `getClaims()` in a server component or a server action. It returns `null` for a visitor who is not signed in.

```tsx
import { getClaims } from "@monashcoding/auth/next";

export default async function Dashboard() {
  const claims = await getClaims();

  if (!claims) return <SignIn />;

  //
  // claims.macUserId  stable id, use it as the foreign key for the user's data
  // claims.email
  // claims.name
  // claims.roles      "member", "committee", "exec", "admin"
  // claims.team       "Events", or null when not on the committee
  //
  return <p>Hi {claims.name}</p>;
}
```

## Requiring a role

`requireClaims()` throws a `MacAuthError` when nobody is signed in, or when the user holds none of the roles.

```ts
"use server";

import { requireClaims } from "@monashcoding/auth/next";

export async function publishEvent(id: string) {
  // Any signed-in user: requireClaims()
  // Committee or exec only:
  const claims = await requireClaims("committee", "exec");

  await db.update(event).set({ publishedBy: claims.macUserId }).where(eq(event.id, id));
}
```

## Requiring a club member

`clubMember` is true for a current member on the MSA roster. The `member` role is everyone who is signed in.

```ts
import { isClubMember } from "@monashcoding/auth";
import { getClaims, requireClubMember, withMacAuth } from "@monashcoding/auth/next";

// A server component
const claims = await getClaims();

if (isClubMember(claims)) {
  // ...
}

// A server action: throws a 401 or 403 MacAuthError
const member = await requireClubMember();

// A route handler
export const GET = withMacAuth(async (request, claims) => Response.json(await perksFor(claims.macUserId)), {
  clubMember: true,
});
```

```ts
// Express, after attachMacUser()
import { requireClubMember } from "@monashcoding/auth/express";

app.get("/api/perks", requireClubMember(), listPerks);
```

## Protecting a route handler

`withMacAuth()` answers 401 or 403 as JSON before your handler runs.

```ts
// app/api/notes/route.ts
import { withMacAuth } from "@monashcoding/auth/next";

export const GET = withMacAuth(async (request, claims) => {
  return Response.json(await notesFor(claims.macUserId));
});

// Pass roles to limit who gets through
export const DELETE = withMacAuth(deleteAllNotes, { roles: ["admin"] });
```

## Express

Mount `attachMacUser()` once, then guard routes with `requireAuth()`.

```ts
import { attachMacUser, getMacUser, requireAuth } from "@monashcoding/auth/express";

// Resolves the user for every request. Never rejects.
app.use(attachMacUser());

// 401 when nobody is signed in
app.get("/api/me", requireAuth(), (req, res) => {
  res.json(getMacUser(req));
});

// 403 unless the user is committee or exec
app.post("/api/admin/import", requireAuth("committee", "exec"), importHandler);
```

## Signing in and out from the browser

```ts
import { getMacAuthClient } from "@monashcoding/auth/client";

const auth = getMacAuthClient();

// Redirects to Google or Microsoft, then back to this page
await auth.signIn("google");
await auth.signIn("microsoft", "https://jobs.monashcoding.com/saved");

// fetch with the user's token attached. Renews the token on a 401.
const response = await auth.fetch("/api/me");

// Ends the session in every MAC app
await auth.signOut();
```

## Linking a membership from the browser

A member who signed in with an email the roster does not know links their account once, with their student ID.

```ts
import { getMacAuthClient } from "@monashcoding/auth/client";

const auth = getMacAuthClient();

// null when signed out
const membership = await auth.getMembership();

if (membership && !membership.clubMember && membership.canEnterStudentId) {
  const result = await auth.linkStudentId(studentId);

  if (result.ok) {
    // The session has reloaded: useMacSession().user.clubMember is current
  } else {
    showError(result.message, result.attemptsRemaining);
  }
}

// Out of attempts for the next hour
if (membership?.contactUs) showContactCommittee();
```

## The session in a React component

```tsx
"use client";

import { useMacSession } from "@monashcoding/auth/react";

export function AccountMenu() {
  const session = useMacSession();

  if (session.status === "loading") return null;
  if (session.status === "signed-out") return <SignInButton />;

  return <span>{session.user.name}</span>;
}
```

## Verifying a token yourself

For a backend that is neither Next.js nor Express.

```ts
import { createMacAuth, hasRole, MacAuthError } from "@monashcoding/auth";

const auth = createMacAuth();

// From a Request: reads the Bearer token first, then the session cookie
const claims = await auth.claimsFromHeaders(request.headers);

// From a token you already hold. Throws MacAuthError when it is not valid.
const verified = await auth.verifyToken(token);

if (hasRole(claims, "committee")) {
  // ...
}
```

## Testing

`createTestIssuer()` signs tokens your tests can verify, with no network.

```ts
import { createMacAuth } from "@monashcoding/auth";
import { createTestIssuer, TEST_AUTH_URL } from "@monashcoding/auth/testing";

const issuer = await createTestIssuer();
const auth = createMacAuth({ authUrl: TEST_AUTH_URL, keys: issuer.keys });

const token = await issuer.sign({ claims: { macUserId: "user_2", roles: ["member", "exec"] } });
const claims = await auth.verifyToken(token);
```
