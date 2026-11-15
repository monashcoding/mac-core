# @monashcoding/db

Postgres for MAC apps through Drizzle. Connects to the shared server, encrypts sensitive columns and creates a database per app.

## Table of contents

* [Getting started](#getting-started)
* [Connecting](#connecting)
* [Defining a table](#defining-a-table)
* [Encrypting a column](#encrypting-a-column)
* [Reading and writing encrypted values](#reading-and-writing-encrypted-values)
* [Looking up by an encrypted value](#looking-up-by-an-encrypted-value)
* [Rotating keys](#rotating-keys)
* [Running migrations](#running-migrations)
* [Creating a database for a new app](#creating-a-database-for-a-new-app)

## Getting started

```bash
pnpm add @monashcoding/db drizzle-orm postgres
pnpm add -D drizzle-kit
```

```bash
DATABASE_URL=postgres://monmap:...@host:5432/monmap

# Only for apps with encrypted columns. Generate each with: pnpm mac-db generate-key
MAC_DATA_KEYS=v1:<key>
MAC_INDEX_KEY=<key>
```

## Connecting

```ts
// lib/db.ts
import { createDb } from "@monashcoding/db";

import * as schema from "./schema";

export const { db, sql, close } = createDb({
  app: "monmap", // shown on the server as the connection's name
  schema,
  // pooled: true, // when DATABASE_URL points at a connection pooler
});
```

```ts
// db is a normal Drizzle client
const plans = await db.select().from(plan).where(eq(plan.macUserId, claims.macUserId));
```

## Defining a table

`macUserId()` and `timestamps` are the columns every MAC table shares.

```ts
// lib/schema.ts
import { macUserId, timestamps } from "@monashcoding/db";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const plan = pgTable("plan", {
  id: uuid("id").primaryKey().defaultRandom(),
  // The owner of the row: claims.macUserId from @monashcoding/auth
  macUserId: macUserId().notNull(),
  title: text("title").notNull(),
  // created_at and updated_at
  ...timestamps,
});
```

## Encrypting a column

Use `encryptedText()` or `encryptedJson()` for anything sensitive. The database only ever stores ciphertext.

```ts
import { createKeyring, encryptedJson, encryptedText, macUserId } from "@monashcoding/db";
import { pgTable, text } from "drizzle-orm/pg-core";
import { z } from "zod";

// Reads MAC_DATA_KEYS and MAC_INDEX_KEY
export const keyring = createKeyring();

export const member = pgTable("member", {
  macUserId: macUserId().primaryKey(),
  // context is "table.column". Do not change it once rows exist.
  phone: encryptedText("phone", { keyring, context: "member.phone" }),
  emergencyContact: encryptedJson("emergency_contact", {
    keyring,
    context: "member.emergency_contact",
    schema: z.object({ name: z.string(), phone: z.string() }),
  }),
});
```

## Reading and writing encrypted values

Wrap a value in `sensitive()` to write it, and call `reveal()` to read it.

```ts
import { sensitive } from "@monashcoding/db";

await db.insert(member).values({
  macUserId: claims.macUserId,
  phone: sensitive("0412 345 678"),
  emergencyContact: sensitive({ name: "Grace", phone: "0400 000 000" }),
});

const [row] = await db.select().from(member);

row.phone.reveal(); // "0412 345 678"

// The value stays out of logs and responses unless you reveal it
console.log(row.phone); // [redacted]
JSON.stringify(row); // {"phone":"[redacted]", ...}
```

## Looking up by an encrypted value

An encrypted column cannot be searched. Store a blind index next to it and search that instead.

```ts
export const member = pgTable("member", {
  macUserId: macUserId().primaryKey(),
  studentId: encryptedText("student_id", { keyring, context: "member.student_id" }),
  studentIdIndex: text("student_id_index"),
});

// Writing
await db.insert(member).values({
  macUserId: claims.macUserId,
  studentId: sensitive("31234567"),
  studentIdIndex: keyring.blindIndex("31234567", "member.student_id"),
});

// Finding
const [row] = await db
  .select()
  .from(member)
  .where(eq(member.studentIdIndex, keyring.blindIndex("31234567", "member.student_id")));
```

## Rotating keys

Put the new key first. The first key encrypts, and every key in the list still decrypts.

```bash
pnpm mac-db generate-key
```

```bash
MAC_DATA_KEYS=v2:<new key>,v1:<old key>
```

## Running migrations

```bash
# Writes a migration file to ./drizzle
pnpm drizzle-kit generate
```

```ts
// scripts/migrate.ts
// Run this before the app starts, from the container entrypoint
import { runMigrations } from "@monashcoding/db";

await runMigrations({ app: "monmap", migrationsFolder: "./drizzle" });
```

## Creating a database for a new app

Each app gets its own database and its own login on the shared server.

```bash
ADMIN_DATABASE_URL=postgres://admin:...@host:5432/postgres pnpm mac-db provision timetable

# Prints the app's connection string once:
# DATABASE_URL=postgres://timetable:<password>@host:5432/timetable
```
