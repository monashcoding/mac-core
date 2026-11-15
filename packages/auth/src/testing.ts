import { createLocalJWKSet, exportJWK, generateKeyPair, type JWTVerifyGetKey, SignJWT } from "jose";

export const TEST_AUTH_URL = "https://auth.test";

export interface TokenOverrides {
  readonly claims?: Readonly<Record<string, string | number | string[] | null>>;
  readonly issuer?: string;
  readonly audience?: string;
  readonly expiresIn?: string;
}

export interface TestIssuer {
  readonly keys: JWTVerifyGetKey;
  sign(overrides?: TokenOverrides): Promise<string>;
}

const DEFAULT_CLAIMS = {
  macUserId: "user_1",
  email: "ada@student.monash.edu",
  name: "Ada Lovelace",
  roles: ["member", "committee"],
  team: "Projects",
  ver: 1,
};

/** A stand-in for mac-auth: an Ed25519 key pair and a token signer. */
export async function createTestIssuer(): Promise<TestIssuer> {
  const { publicKey, privateKey } = await generateKeyPair("EdDSA");
  const jwk = await exportJWK(publicKey);
  const keys = createLocalJWKSet({ keys: [{ ...jwk, alg: "EdDSA" }] });

  return {
    keys,
    sign(overrides = {}) {
      return new SignJWT({ ...DEFAULT_CLAIMS, ...overrides.claims })
        .setProtectedHeader({ alg: "EdDSA" })
        .setIssuer(overrides.issuer ?? TEST_AUTH_URL)
        .setAudience(overrides.audience ?? "mac-suite")
        .setIssuedAt()
        .setExpirationTime(overrides.expiresIn ?? "15m")
        .sign(privateKey);
    },
  };
}
