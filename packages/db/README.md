# @monashcoding/db

Postgres for MAC apps: one managed server, one database and one login role per app.

```bash
pnpm add @monashcoding/db drizzle-orm postgres
pnpm add -D drizzle-kit
```

## Client

```ts
// lib/db.ts
import { createDb } from "@monashcoding/db";

import * as schema from "./schema";

export const { db, sql, close } = createDb({ app: "monmap", schema });
```

Connections use TLS for every host except localhost. Pass `pooled: true` when `DATABASE_URL` points at a transaction pooler.

## Schema

```ts
// lib/schema.ts
import { createKeyring, encryptedJson, encryptedText, macUserId, timestamps } from "@monashcoding/db";
import { index, pgTable, text } from "drizzle-orm/pg-core";
import { z } from "zod";

export const keyring = createKeyring();

export const member = pgTable(
  "member",
  {
    macUserId: macUserId().primaryKey(),
    degree: text("degree"),
    phone: encryptedText("phone", { keyring, context: "member.phone" }),
    studentIdIndex: text("student_id_index"),
    emergencyContact: encryptedJson("emergency_contact", {
      keyring,
      context: "member.emergency_contact",
      schema: z.object({ name: z.string(), phone: z.string() }),
    }),
    ...timestamps,
  },
  (table) => [index("member_student_id_index").on(table.studentIdIndex)],
);
```

## Sensitive data

```ts
import { sensitive } from "@monashcoding/db";

await db.insert(member).values({
  macUserId: claims.macUserId,
  phone: sensitive("0412 345 678"),
  studentIdIndex: keyring.blindIndex("31234567", "member.student_id"),
});

const [row] = await db
  .select()
  .from(member)
  .where(eq(member.studentIdIndex, keyring.blindIndex("31234567", "member.student_id")));

row.phone.reveal();      // "0412 345 678"
console.log(row);        // phone: [redacted]
JSON.stringify(row);     // "phone":"[redacted]"
```

- An encrypted column holds `mac1.<key id>.<iv>.<ciphertext>` (AES-256-GCM). The server, its backups and its operators hold ciphertext only.
- `context` binds a ciphertext to its column. A value copied into another column fails to decrypt.
- An encrypted column cannot be searched or sorted. Store `keyring.blindIndex(value, context)` beside it for equality lookups.
- Reads give `Sensitive<T>`, which prints and serialises as `[redacted]`.

## Keys

```bash
pnpm mac-db generate-key
```

```bash
MAC_DATA_KEYS=v1:<base64>
MAC_INDEX_KEY=<base64>
```

Rotate by putting a new key first. The first key encrypts; every listed key decrypts.

```bash
MAC_DATA_KEYS=v2:<base64>,v1:<base64>
```

```ts
if (keyring.needsRotation(stored)) {
  // re-encrypt: read the row and write it back
}
```

Losing a data key loses every value encrypted with it. Losing or changing `MAC_INDEX_KEY` breaks every blind index. Keep both in the committee password manager as well as the deploy environment.

## Migrations

```bash
pnpm drizzle-kit generate
```

```ts
// scripts/migrate.ts, run from the container entrypoint
import { runMigrations } from "@monashcoding/db";

await runMigrations({ app: "monmap", migrationsFolder: "./drizzle" });
```

`drizzle-kit push` is never used against a shared database.

## A new app on the shared server

```bash
ADMIN_DATABASE_URL=postgres://admin:...@host:5432/postgres pnpm mac-db provision timetable
# DATABASE_URL=postgres://timetable:<generated>@host:5432/timetable
```

The role owns its database, has a connection limit of 20, and cannot connect to another app's database.

## Environment

| Variable | Use |
|---|---|
| `DATABASE_URL` | The app's connection string |
| `DB_POOL_MAX` | Pool size, default 10 |
| `MAC_DATA_KEYS` | `id:base64` data keys, current key first |
| `MAC_INDEX_KEY` | base64 key for blind indexes |
| `ADMIN_DATABASE_URL` | Administrator connection, `mac-db provision` only |
