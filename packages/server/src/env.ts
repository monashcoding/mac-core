import { z } from "zod";

export class EnvError extends Error {
  readonly problems: string[];

  constructor(problems: string[]) {
    super(`Invalid environment:\n${problems.map((problem) => `  ${problem}`).join("\n")}`);
    this.name = "EnvError";
    this.problems = problems;
  }
}

type EnvSource = Readonly<Record<string, string | undefined>>;

/**
 * Read and validate the environment once, at startup. Every problem is
 * reported together, so a deploy with three missing variables fails
 * once, not three times. An empty variable counts as unset.
 */
export function defineEnv<Schema extends Readonly<Record<string, z.ZodType>>>(schema: Schema, source: EnvSource = process.env): z.infer<z.ZodObject<Schema>> {
  const present = Object.entries(source).filter(([, value]) => value !== undefined && value !== "");
  const parsed = z.object(schema).safeParse(Object.fromEntries(present));

  if (!parsed.success) {
    throw new EnvError(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`));
  }

  return parsed.data;
}

/** Schemas for the shapes environment variables keep taking. */
export const env = {
  /** `A_LIST=one, Two,three` → `["one", "two", "three"]`. Unset gives the fallback. */
  list(fallback: readonly string[] = []) {
    return z
      .string()
      .optional()
      .transform((value) =>
        value === undefined
          ? [...fallback]
          : value
              .split(",")
              .map((entry) => entry.trim().toLowerCase())
              .filter((entry) => entry.length > 0),
      );
  },

  /** `1`, `true` or `on` → true. Unset or anything else → false. */
  flag() {
    return z
      .string()
      .optional()
      .transform((value) => value !== undefined && ["1", "true", "on"].includes(value.toLowerCase()));
  },

  /** A whole number, with a fallback when unset. */
  integer(fallback: number) {
    return z.coerce.number().int().default(fallback);
  },

  /** An http(s) URL without a trailing slash. */
  url() {
    return z.url().transform((value) => value.replace(/\/+$/, ""));
  },
};
