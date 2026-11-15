# @monashcoding/auth

Sign-in for MAC apps through [mac-auth](https://github.com/monashcoding/mac-auth). The app stores no passwords and no sessions; it verifies a 15-minute EdDSA token locally and keys its data by `macUserId`.

```bash
pnpm add @monashcoding/auth
```

## Claims

```ts
interface MacClaims {
  macUserId: string;       // stable id, the foreign key for app data
  email: string;
  name: string;
  roles: string[];         // "member" | "committee" | "exec" | "admin"
  team: string | null;
  ver: number;
}
```

## Next.js

```ts
// app/dashboard/page.tsx
import { getClaims } from "@monashcoding/auth/next";

export default async function Dashboard() {
  const claims = await getClaims();

  if (!claims) return <SignIn />;

  return <p>Hi {claims.name}</p>;
}
```

```ts
// app/actions.ts
"use server";

import { requireClaims } from "@monashcoding/auth/next";

export async function publishEvent(id: string) {
  const claims = await requireClaims("committee", "exec");

  await db.update(event).set({ publishedBy: claims.macUserId }).where(eq(event.id, id));
}
```

```ts
// app/api/notes/route.ts
import { withMacAuth } from "@monashcoding/auth/next";

export const GET = withMacAuth(async (_request, claims) => {
  return Response.json(await notesFor(claims.macUserId));
});

export const DELETE = withMacAuth(deleteAll, { roles: ["admin"] });
```

## Express

```ts
import { attachMacUser, getMacUser, requireAuth } from "@monashcoding/auth/express";

app.use(attachMacUser());

app.get("/api/me", requireAuth(), (req, res) => {
  res.json(getMacUser(req));
});

app.post("/api/admin/import", requireAuth("committee", "exec"), importHandler);
```

## Browser

```ts
import { getMacAuthClient } from "@monashcoding/auth/client";

const auth = getMacAuthClient();

await auth.signIn("google");                    // or "microsoft"
const response = await auth.fetch("/api/me");   // Bearer token attached, renewed on 401
await auth.signOut();
```

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

## Anything else

```ts
import { createMacAuth, hasRole, requireRole } from "@monashcoding/auth";

const auth = createMacAuth();

const claims = await auth.claimsFromHeaders(request.headers);   // bearer, then cookie
const sameClaims = await auth.verifyToken(token);               // throws MacAuthError

if (hasRole(claims, "committee")) { /* ... */ }
```

`MacAuthError` carries `status` (401 or 403) and `code` (`unauthenticated`, `invalid_token`, `forbidden`).

## Tests

```ts
import { createMacAuth } from "@monashcoding/auth";
import { createTestIssuer, TEST_AUTH_URL } from "@monashcoding/auth/testing";

const issuer = await createTestIssuer();
const auth = createMacAuth({ authUrl: TEST_AUTH_URL, keys: issuer.keys });
const token = await issuer.sign({ claims: { roles: ["member", "exec"] } });
```

## Environment

| Variable | Default |
|---|---|
| `AUTH_URL` | `https://auth.monashcoding.com` |
| `JWT_AUDIENCE` | `mac-suite` |

The shared session cookie is set on `.monashcoding.com`, so cookie sign-in works on `*.monashcoding.com` hosts. On localhost, add the dev origin to mac-auth's `TRUSTED_ORIGINS`.
