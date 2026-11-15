import { PostHog } from "posthog-node";

import type { EventProperties } from "./properties";

/** The part of posthog-node this module uses. */
export interface PostHogServerClient {
  capture(message: { distinctId: string; event: string; properties?: EventProperties }): void;
  flush(): Promise<void>;
}

export interface ServerAnalyticsOptions {
  /** PostHog project token. Nothing is sent when omitted. */
  readonly posthogToken?: string | undefined;
  readonly host?: string | undefined;
  /** Send anything at all. Defaults to production only. */
  readonly enabled?: boolean;
  /** Where the PostHog client comes from. Defaults to posthog-node. */
  readonly createClient?: (token: string, host: string | undefined) => PostHogServerClient;
}

export interface ServerAnalytics {
  /**
   * Send one event for a macUserId and wait until it is sent. A PostHog
   * failure is dropped, so analytics never fails the action that called it.
   */
  capture(macUserId: string, event: string, properties?: EventProperties): Promise<void>;
}

function createPostHog(token: string, host: string | undefined): PostHogServerClient {
  // Server actions and route handlers can exit right after responding,
  // so every event is flushed on its own.
  return new PostHog(token, { ...(host ? { host } : undefined), flushAt: 1, flushInterval: 0 });
}

export function createServerAnalytics(options: ServerAnalyticsOptions = {}): ServerAnalytics {
  const enabled = options.enabled ?? process.env.NODE_ENV === "production";
  const token = options.posthogToken;
  const create = options.createClient ?? createPostHog;

  let client: PostHogServerClient | null = null;

  return {
    async capture(macUserId, event, properties) {
      if (!enabled || !token) return;

      client ??= create(token, options.host);
      client.capture({ distinctId: macUserId, event, ...(properties ? { properties } : undefined) });

      await client.flush().catch(() => {
        // The event is lost; the caller carries on.
      });
    },
  };
}
