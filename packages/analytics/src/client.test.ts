import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAnalytics, maskReplayAttribute, type PostHogClient, posthogDefaults } from "./client";

function fakePostHog() {
  const calls: string[] = [];

  const client: PostHogClient = {
    init: (token, config) => calls.push(`init ${token} ${config.api_host}`),
    register: (properties) => calls.push(`register ${JSON.stringify(properties)}`),
    capture: (event, properties) => calls.push(`capture ${event} ${JSON.stringify(properties ?? null)}`),
    identify: (id) => calls.push(`identify ${id}`),
    reset: () => calls.push("reset"),
  };

  return { calls, loadPostHog: async () => client };
}

beforeEach(() => {
  vi.stubGlobal("window", { setTimeout });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("createAnalytics", () => {
  it("initialises PostHog once and replays calls made before it loaded", async () => {
    const { calls, loadPostHog } = fakePostHog();
    const analytics = createAnalytics({ app: "monmap", posthogToken: "phc_test", enabled: true, loadPostHog });

    analytics.identify("user_1");
    analytics.capture("unit_added", { year: 2 });
    await vi.runAllTimersAsync();

    expect(calls).toEqual([
      "init phc_test /ingest",
      'register {"app":"monmap"}',
      "identify user_1",
      'capture unit_added {"year":2}',
    ]);
  });

  it("does nothing when disabled or without a token", async () => {
    const { calls, loadPostHog } = fakePostHog();

    createAnalytics({ app: "monmap", posthogToken: "phc_test", enabled: false, loadPostHog }).capture("e");
    createAnalytics({ app: "monmap", enabled: true, loadPostHog }).capture("e");
    await vi.runAllTimersAsync();

    expect(calls).toEqual([]);
  });

  it("retries after a failed load", async () => {
    const { calls, loadPostHog } = fakePostHog();
    let attempts = 0;

    const analytics = createAnalytics({
      app: "monmap",
      posthogToken: "phc_test",
      enabled: true,
      loadPostHog: async () => {
        attempts += 1;

        if (attempts === 1) throw new Error("chunk failed to load");

        return loadPostHog();
      },
    });

    analytics.capture("first");
    await vi.runAllTimersAsync();
    analytics.capture("second");
    await vi.runAllTimersAsync();

    expect(calls).toEqual(["init phc_test /ingest", 'register {"app":"monmap"}', "capture second null"]);
  });
});

describe("privacy defaults", () => {
  it("masks text-bearing attributes and keeps layout ones", () => {
    expect(maskReplayAttribute("aria-label", "Ada's plan")).toBe("*");
    expect(maskReplayAttribute("class", "flex gap-2")).toBe("flex gap-2");
  });

  it("masks all text and never records request bodies", () => {
    const config = posthogDefaults("/ingest", "https://us.posthog.com");

    expect(config.mask_all_text).toBe(true);
    expect(config.session_recording?.recordBody).toBe(false);
    expect(config.session_recording?.maskAllInputs).toBe(true);
  });
});
