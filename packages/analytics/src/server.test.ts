import { describe, expect, it } from "vitest";

import { createServerAnalytics, type PostHogServerClient } from "./server";

function recorder(flush: () => Promise<void> = async () => {}) {
  const events: string[] = [];

  const client: PostHogServerClient = {
    capture: (message) => {
      events.push(`${message.distinctId} ${message.event} ${JSON.stringify(message.properties ?? null)}`);
    },
    flush,
  };

  return { events, createClient: () => client };
}

describe("createServerAnalytics", () => {
  it("sends an event for the macUserId", async () => {
    const { events, createClient } = recorder();
    const analytics = createServerAnalytics({ app: "monmap", posthogToken: "phc_test", enabled: true, createClient });

    await analytics.capture("user_1", "plan_saved", { units: 24 });

    expect(events).toEqual(['user_1 plan_saved {"units":24,"app":"monmap"}']);
  });

  it("sends nothing when disabled or without a token", async () => {
    const { events, createClient } = recorder();

    await createServerAnalytics({ app: "monmap", posthogToken: "phc_test", enabled: false, createClient }).capture("u", "e");
    await createServerAnalytics({ app: "monmap", enabled: true, createClient }).capture("u", "e");

    expect(events).toEqual([]);
  });

  it("swallows a PostHog failure", async () => {
    const { createClient } = recorder(async () => {
      throw new Error("posthog is down");
    });

    const analytics = createServerAnalytics({ app: "monmap", posthogToken: "phc_test", enabled: true, createClient });

    await expect(analytics.capture("user_1", "plan_saved")).resolves.toBeUndefined();
  });
});
