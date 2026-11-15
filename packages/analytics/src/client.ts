import type { PostHogConfig } from "posthog-js";

import type { EventProperties } from "./properties";

/** The part of posthog-js this module uses. */
export interface PostHogClient {
  init(token: string, config: Partial<PostHogConfig>): void;
  capture(event: string, properties?: EventProperties): void;
  identify(distinctId: string): void;
  reset(): void;
}

export interface AnalyticsOptions {
  /** PostHog project token. PostHog stays off when omitted. */
  readonly posthogToken?: string | undefined;
  /** Google Analytics measurement id (`G-...`). GA stays off when omitted. */
  readonly gaId?: string | undefined;
  /** Send anything at all. Defaults to production builds only. */
  readonly enabled?: boolean;
  /** Same-origin path of the PostHog proxy from `@monashcoding/analytics/ingest`. */
  readonly apiHost?: string;
  readonly uiHost?: string;
  /** posthog-js settings applied over the MAC defaults. */
  readonly posthog?: Partial<PostHogConfig>;
  /** Where posthog-js comes from. Defaults to a lazy `import("posthog-js")`. */
  readonly loadPostHog?: () => Promise<PostHogClient>;
}

export interface Analytics {
  /** Start PostHog and Google Analytics without sending an event. */
  start(): void;
  capture(event: string, properties?: EventProperties): void;
  /** Tie later events to the macUserId. Never pass an email. */
  identify(macUserId: string): void;
  reset(): void;
}

/*
 * Attributes that carry readable text. Apps put names and other user
 * content in some of them (an aria-label, a title), so replays mask
 * them. Layout attributes such as class and style stay, or the replay
 * loses its styling.
 */
const TEXT_ATTRIBUTES = new Set([
  "alt",
  "aria-description",
  "aria-label",
  "aria-placeholder",
  "aria-roledescription",
  "aria-valuetext",
  "content",
  "label",
  "placeholder",
  "title",
  "value",
]);

/** The replay value of an element attribute: text-bearing attributes are masked. */
export function maskReplayAttribute(name: string, value: string): string {
  return TEXT_ATTRIBUTES.has(name) ? "*" : value;
}

/** The posthog-js settings every MAC app starts from. */
export function posthogDefaults(apiHost: string, uiHost: string): Partial<PostHogConfig> {
  return {
    api_host: apiHost,
    ui_host: uiHost,
    defaults: "2026-01-30",
    capture_exceptions: true,
    // Replays and autocaptured clicks record no page text, no inputs
    // and no text-bearing attributes.
    mask_all_text: true,
    mask_all_element_attributes: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "*",
      maskAttributeFn: maskReplayAttribute,
      // A local false wins over the project setting, so a dashboard
      // toggle cannot turn request payload capture on.
      recordBody: false,
      recordHeaders: false,
    },
  };
}

declare global {
  interface Window {
    dataLayer?: IArguments[];
  }
}

function startGoogleAnalytics(gaId: string): void {
  const layer = (window.dataLayer ??= []);

  // gtag.js reads the `arguments` object itself, not an array of it.
  function gtag(..._command: (string | Date)[]): void {
    // oxlint-disable-next-line prefer-rest-params
    layer.push(arguments);
  }

  gtag("js", new Date());
  gtag("config", gaId);

  const script = document.createElement("script");

  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.append(script);
}

function whenIdle(): Promise<void> {
  return new Promise((resolve) => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => resolve(), { timeout: 3000 });
    } else {
      setTimeout(resolve, 1000);
    }
  });
}

async function importPostHog(): Promise<PostHogClient> {
  const module = await import("posthog-js");

  return module.default;
}

const isProduction = typeof process !== "undefined" && process.env.NODE_ENV === "production";

/**
 * One analytics object per app. PostHog loads on demand once the browser
 * is idle, so it stays off the first-load bundle and never delays the
 * first interaction. Calls made before then wait for it.
 */
export function createAnalytics(options: AnalyticsOptions = {}): Analytics {
  const enabled = options.enabled ?? isProduction;
  const token = options.posthogToken;
  const load = options.loadPostHog ?? importPostHog;

  const config = {
    ...posthogDefaults(options.apiHost ?? "/ingest", options.uiHost ?? "https://us.posthog.com"),
    ...options.posthog,
  };

  let posthog: Promise<PostHogClient | null> | null = null;
  let googleStarted = false;

  function startPostHog(projectToken: string): Promise<PostHogClient | null> {
    posthog ??= whenIdle()
      .then(load)
      .then((client) => {
        client.init(projectToken, config);

        return client;
      })
      .catch(() => {
        // A failed chunk load (a redeploy, a flaky network) must not
        // stick. The next call retries.
        posthog = null;

        return null;
      });

    return posthog;
  }

  function withPostHog(use: (client: PostHogClient) => void): void {
    if (!enabled || !token) return;

    void startPostHog(token).then((client) => {
      if (client) use(client);
    });
  }

  return {
    start() {
      if (enabled && options.gaId && !googleStarted) {
        googleStarted = true;
        startGoogleAnalytics(options.gaId);
      }

      withPostHog(() => {});
    },
    capture(event, properties) {
      withPostHog((client) => client.capture(event, properties));
    },
    identify(macUserId) {
      withPostHog((client) => client.identify(macUserId));
    },
    reset() {
      withPostHog((client) => client.reset());
    },
  };
}
