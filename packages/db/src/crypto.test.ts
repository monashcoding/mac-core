import { describe, expect, it } from "vitest";

import { createKeyring, DataCryptoError, generateKey } from "./crypto";

const k1 = generateKey();
const k2 = generateKey();
const indexKey = generateKey();

describe("createKeyring", () => {
  it("round-trips a value and never repeats a ciphertext", () => {
    const keyring = createKeyring({ dataKeys: `v1:${k1}` });
    const first = keyring.encrypt("0412 345 678", "member.phone");
    const second = keyring.encrypt("0412 345 678", "member.phone");

    expect(first).toMatch(/^mac1\.v1\./);
    expect(first).not.toContain("0412");
    expect(first).not.toBe(second);
    expect(keyring.decrypt(first, "member.phone")).toBe("0412 345 678");
  });

  it("does not decrypt in another context", () => {
    const keyring = createKeyring({ dataKeys: `v1:${k1}` });
    const ciphertext = keyring.encrypt("secret", "member.phone");

    expect(() => keyring.decrypt(ciphertext, "member.address")).toThrowError(
      expect.objectContaining({ code: "bad_ciphertext" }),
    );
  });

  it("rejects a tampered ciphertext", () => {
    const keyring = createKeyring({ dataKeys: `v1:${k1}` });
    const parts = keyring.encrypt("secret", "c").split(".");
    const sealed = Buffer.from(parts[3] ?? "", "base64url");

    sealed[0] = (sealed[0] ?? 0) ^ 1;

    const tampered = [parts[0], parts[1], parts[2], sealed.toString("base64url")].join(".");

    expect(() => keyring.decrypt(tampered, "c")).toThrowError(DataCryptoError);
    expect(() => keyring.decrypt("plain text", "c")).toThrowError(DataCryptoError);
  });

  it("rotates: the first key encrypts and older keys still decrypt", () => {
    const before = createKeyring({ dataKeys: `v1:${k1}` });
    const after = createKeyring({ dataKeys: `v2:${k2},v1:${k1}` });
    const old = before.encrypt("secret", "c");

    expect(after.decrypt(old, "c")).toBe("secret");
    expect(after.needsRotation(old)).toBe(true);
    expect(after.encrypt("secret", "c")).toMatch(/^mac1\.v2\./);
    expect(after.needsRotation(after.encrypt("secret", "c"))).toBe(false);
    expect(() => before.decrypt(after.encrypt("secret", "c"), "c")).toThrowError(
      expect.objectContaining({ code: "unknown_key" }),
    );
  });

  it("rejects missing, short and duplicate keys", () => {
    expect(() => createKeyring({ dataKeys: "" })).toThrowError(DataCryptoError);
    expect(() => createKeyring({ dataKeys: "v1:c2hvcnQ=" })).toThrowError(DataCryptoError);
    expect(() => createKeyring({ dataKeys: k1 })).toThrowError(DataCryptoError);
    expect(() => createKeyring({ dataKeys: `v1:${k1},v1:${k2}` })).toThrowError(DataCryptoError);
  });
});

describe("blindIndex", () => {
  it("is deterministic within a context and differs across contexts", () => {
    const keyring = createKeyring({ dataKeys: `v1:${k1}`, indexKey });

    expect(keyring.blindIndex("a@monash.edu", "member.email")).toBe(
      keyring.blindIndex("a@monash.edu", "member.email"),
    );
    expect(keyring.blindIndex("a@monash.edu", "member.email")).not.toBe(
      keyring.blindIndex("a@monash.edu", "sponsor.email"),
    );
    expect(keyring.blindIndex("a@monash.edu", "member.email")).not.toContain("monash");
  });

  it("needs an index key", () => {
    const keyring = createKeyring({ dataKeys: `v1:${k1}`, indexKey: "" });

    expect(() => keyring.blindIndex("a", "c")).toThrowError(DataCryptoError);
  });
});
