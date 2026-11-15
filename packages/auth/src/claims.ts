import { z } from "zod";

/** Roles mac-auth issues. `member` is anyone signed in; club membership is `clubMember`. */
export const MAC_ROLES = ["member", "committee", "exec", "admin"] as const;

export type MacRole = (typeof MAC_ROLES)[number];

/**
 * The claims of a mac-auth token. mac-auth imports this schema too, so
 * the issuer and every verifier share one contract.
 */
export const macClaimsSchema = z.object({
  macUserId: z.string().min(1),
  email: z.string().min(1),
  name: z
    .string()
    .nullish()
    .transform((name) => name ?? ""),
  roles: z.array(z.string()).default([]),
  team: z
    .string()
    .nullish()
    .transform((team) => team ?? null),
  /** A current member on the MSA member roster. Not the `member` role. */
  clubMember: z.boolean().default(false),
  ver: z.number().default(1),
});

export type MacClaims = z.infer<typeof macClaimsSchema>;
