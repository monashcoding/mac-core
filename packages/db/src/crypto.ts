import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

const VERSION = "mac1";
const KEY_BYTES = 32;
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_ID = /^[a-z0-9_-]{1,16}$/;

export type DataCryptoErrorCode = "bad_key" | "bad_ciphertext" | "unknown_key";

export class DataCryptoError extends Error {
  readonly code: DataCryptoErrorCode;

  constructor(code: DataCryptoErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DataCryptoError";
    this.code = code;
  }
}

export interface KeyringOptions {
  /**
   * Data keys as `id:base64,id:base64`. The first key encrypts; every
   * key decrypts. Defaults to `MAC_DATA_KEYS`.
   */
  readonly dataKeys?: string | undefined;
  /** Base64 key for blind indexes. Defaults to `MAC_INDEX_KEY`. */
  readonly indexKey?: string | undefined;
}

export interface Keyring {
  /**
   * Encrypt with the current key. `context` names where the value lives
   * (`"member.phone"`), and the same context is needed to decrypt, so a
   * ciphertext copied into another column does not decrypt there.
   */
  encrypt(plaintext: string, context: string): string;
  decrypt(ciphertext: string, context: string): string;
  /** True when the value was encrypted with a key other than the current one. */
  needsRotation(ciphertext: string): boolean;
  /**
   * A deterministic keyed hash for equality lookups on an encrypted
   * column. Equal values give equal indexes within one context.
   */
  blindIndex(value: string, context: string): string;
}

function decodeKey(encoded: string, label: string): Buffer {
  const key = Buffer.from(encoded.trim(), "base64");

  if (key.length !== KEY_BYTES) {
    throw new DataCryptoError("bad_key", `${label} must be ${KEY_BYTES} bytes of base64.`);
  }

  return key;
}

interface DataKey {
  readonly id: string;
  readonly key: Buffer;
}

function parseDataKeys(spec: string): DataKey[] {
  const keys = spec
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      const separator = entry.indexOf(":");
      const id = entry.slice(0, separator);

      if (separator < 1 || !KEY_ID.test(id)) {
        throw new DataCryptoError("bad_key", "Data keys are written as `id:base64`.");
      }

      return { id, key: decodeKey(entry.slice(separator + 1), `Data key "${id}"`) };
    });

  if (new Set(keys.map((key) => key.id)).size !== keys.length) {
    throw new DataCryptoError("bad_key", "Two data keys share an id.");
  }

  return keys;
}

/** A new random key, base64-encoded, for `MAC_DATA_KEYS` or `MAC_INDEX_KEY`. */
export function generateKey(): string {
  return randomBytes(KEY_BYTES).toString("base64");
}

export function createKeyring(options: KeyringOptions = {}): Keyring {
  const keys = parseDataKeys(options.dataKeys ?? process.env.MAC_DATA_KEYS ?? "");
  const current = keys[0];

  if (!current) {
    throw new DataCryptoError("bad_key", "Set MAC_DATA_KEYS to at least one `id:base64` key.");
  }

  const indexSpec = options.indexKey ?? process.env.MAC_INDEX_KEY;
  const indexKey = indexSpec ? decodeKey(indexSpec, "The index key") : null;

  return {
    encrypt(plaintext, context) {
      const iv = randomBytes(IV_BYTES);
      const cipher = createCipheriv("aes-256-gcm", current.key, iv);

      cipher.setAAD(Buffer.from(context, "utf8"));

      const sealed = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final(), cipher.getAuthTag()]);

      return [VERSION, current.id, iv.toString("base64url"), sealed.toString("base64url")].join(".");
    },

    decrypt(ciphertext, context) {
      const [version, id, encodedIv, encodedSealed] = ciphertext.split(".");

      if (version !== VERSION || !id || !encodedIv || !encodedSealed) {
        throw new DataCryptoError("bad_ciphertext", "The value is not a MAC ciphertext.");
      }

      const dataKey = keys.find((key) => key.id === id);

      if (!dataKey) {
        throw new DataCryptoError("unknown_key", `No data key "${id}" is configured.`);
      }

      const iv = Buffer.from(encodedIv, "base64url");
      const sealed = Buffer.from(encodedSealed, "base64url");

      if (iv.length !== IV_BYTES || sealed.length < TAG_BYTES) {
        throw new DataCryptoError("bad_ciphertext", "The ciphertext is truncated.");
      }

      const decipher = createDecipheriv("aes-256-gcm", dataKey.key, iv);

      decipher.setAAD(Buffer.from(context, "utf8"));
      decipher.setAuthTag(sealed.subarray(sealed.length - TAG_BYTES));

      try {
        const body = sealed.subarray(0, sealed.length - TAG_BYTES);

        return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
      } catch (cause) {
        throw new DataCryptoError("bad_ciphertext", "The ciphertext failed authentication.", { cause });
      }
    },

    needsRotation(ciphertext) {
      return ciphertext.split(".")[1] !== current.id;
    },

    blindIndex(value, context) {
      if (!indexKey) {
        throw new DataCryptoError("bad_key", "Set MAC_INDEX_KEY to use blind indexes.");
      }

      return createHmac("sha256", indexKey).update(context).update("\0").update(value).digest("base64url");
    },
  };
}
