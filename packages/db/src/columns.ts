import { customType, text, timestamp } from "drizzle-orm/pg-core";
import type { z } from "zod";

import type { Keyring } from "./crypto";
import { Sensitive } from "./sensitive";

/**
 * The owner of a row: the `macUserId` claim of a mac-auth token. Rows
 * are never keyed by email.
 */
export function macUserId(name = "mac_user_id") {
  return text(name);
}

/**
 * `created_at` and `updated_at`. Spread into a table definition.
 *
 * Millisecond precision, the most a JavaScript Date holds, so a
 * timestamp read from a row compares equal to the stored one. Keyset
 * paging on `created_at` depends on that.
 */
export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export interface EncryptedOptions {
  readonly keyring: Keyring;
  /** Where the value lives, as `table.column`. Changing it makes stored rows undecryptable. */
  readonly context: string;
}

/**
 * A text column encrypted with AES-256-GCM before it leaves the app.
 * The database, its backups and its operators only ever hold ciphertext.
 * Reads give a `Sensitive<string>`; call `reveal()` at the point of use.
 */
export function encryptedText(name: string, options: EncryptedOptions) {
  const { keyring, context } = options;

  return customType<{ data: Sensitive<string>; driverData: string }>({
    dataType: () => "text",
    toDriver: (value) => keyring.encrypt(value.reveal(), context),
    fromDriver: (stored) => new Sensitive(keyring.decrypt(stored, context)),
  })(name);
}

export interface EncryptedJsonOptions<Value> extends EncryptedOptions {
  /** Parses the decrypted JSON on every read. */
  readonly schema: z.ZodType<Value>;
}

/** An encrypted column holding JSON, parsed with `schema` on read. */
export function encryptedJson<Value>(name: string, options: EncryptedJsonOptions<Value>) {
  const { keyring, context, schema } = options;

  return customType<{ data: Sensitive<Value>; driverData: string }>({
    dataType: () => "text",
    toDriver: (value) => keyring.encrypt(JSON.stringify(value.reveal()), context),
    fromDriver: (stored) => new Sensitive(schema.parse(JSON.parse(keyring.decrypt(stored, context)))),
  })(name);
}
