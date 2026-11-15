import { PGlite } from "@electric-sql/pglite";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { pgTable, text } from "drizzle-orm/pg-core";
import { inspect } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { encryptedJson, encryptedText, macUserId, timestamps } from "./columns";
import { createKeyring, generateKey } from "./crypto";
import { sensitive } from "./sensitive";

const keyring = createKeyring({ dataKeys: `v1:${generateKey()}`, indexKey: generateKey() });

const member = pgTable("member", {
  macUserId: macUserId().primaryKey(),
  phone: encryptedText("phone", { keyring, context: "member.phone" }).notNull(),
  emailIndex: text("email_index").notNull(),
  emergencyContact: encryptedJson("emergency_contact", {
    keyring,
    context: "member.emergency_contact",
    schema: z.object({ name: z.string(), phone: z.string() }),
  }),
  ...timestamps,
});

const client = new PGlite();
const db = drizzle(client);

beforeAll(async () => {
  await db.execute(sql`
    create table member (
      mac_user_id text primary key,
      phone text not null,
      email_index text not null,
      emergency_contact text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
});

afterAll(async () => {
  await client.close();
});

describe("encrypted columns", () => {
  it("stores ciphertext and reads the value back", async () => {
    await db.insert(member).values({
      macUserId: "user_1",
      phone: sensitive("0412 345 678"),
      emailIndex: keyring.blindIndex("ada@monash.edu", "member.email"),
      emergencyContact: sensitive({ name: "Grace", phone: "0400 000 000" }),
    });

    const raw = await db.execute<{ phone: string; emergency_contact: string }>(
      sql`select phone, emergency_contact from member`,
    );

    const stored = raw.rows[0];

    expect(stored?.phone).toMatch(/^mac1\.v1\./);
    expect(JSON.stringify(stored)).not.toContain("0412");
    expect(JSON.stringify(stored)).not.toContain("Grace");

    const [row] = await db
      .select()
      .from(member)
      .where(eq(member.emailIndex, keyring.blindIndex("ada@monash.edu", "member.email")));

    expect(row?.phone.reveal()).toBe("0412 345 678");
    expect(row?.emergencyContact?.reveal()).toEqual({ name: "Grace", phone: "0400 000 000" });
    expect(row?.createdAt).toBeInstanceOf(Date);
  });

  it("keeps the value out of logs and JSON", async () => {
    const [row] = await db.select().from(member);

    expect(JSON.stringify(row)).not.toContain("0412");
    expect(inspect(row)).not.toContain("0412");
    expect(`${row?.phone}`).toBe("[redacted]");
  });
});
