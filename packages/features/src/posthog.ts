import { PostHog } from "posthog-node";

import type { FlagSource } from "./registry";

export interface PostHogFlagsOptions {
  /** PostHog project token. Without one, the source answers nothing. */
  readonly token?: string | undefined;
  /**
   * A project secret key (`phs_...`). With it, flags are evaluated in
   * this process from definitions PostHog refreshes in the background,
   * so a request makes no network call.
   */
  readonly secretKey?: string | undefined;
  readonly host?: string | undefined;
}

/** Flag values from PostHog, for `defineFeatures({ flags })`. */
export function posthogFlags(options: PostHogFlagsOptions = {}): FlagSource {
  const token = options.token;

  if (!token) return async () => ({});

  let client: PostHog | null = null;

  return async ({ distinctId, keys, properties }) => {
    client ??= new PostHog(token, {
      ...(options.host ? { host: options.host } : undefined),
      ...(options.secretKey ? { secretKey: options.secretKey } : undefined),
    });

    const snapshot = await client.evaluateFlags(distinctId, {
      flagKeys: [...keys],
      personProperties: { ...properties },
    });

    const values = new Map<string, boolean>();

    for (const key of keys) {
      // Reading a whole registry is not an exposure, so no event is sent.
      const value = snapshot.getFlag(key, { sendFeatureFlagEvents: false });

      if (value !== undefined) values.set(key, value !== false);
    }

    return Object.fromEntries(values);
  };
}
