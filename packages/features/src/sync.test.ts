import { describe, expect, it } from "vitest";

import { feature } from "./feature";
import { defineFeatures } from "./registry";
import { formatSyncReport, syncFlags } from "./sync";

const features = defineFeatures({
  app: "monmap",
  features: {
    aiPlanner: feature.release({ description: "AI plan suggestions", owner: "swofty", expires: "2020-01-01" }),
    reviews: feature.killSwitch({ description: "Unit reviews", owner: "swofty" }),
    moderation: feature.staff({ description: "Moderation queue", owner: "swofty", roles: ["exec"] }),
  },
});

function fakePostHog(existing: string[]) {
  const requests: string[] = [];

  const send: typeof fetch = async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";

    requests.push(`${method} ${url} ${new Headers(init?.headers).get("authorization")} ${String(init?.body ?? "")}`);

    if (method === "POST") return Response.json({}, { status: 201 });

    if (url.endsWith("page=2")) {
      return Response.json({ results: [{ key: "jobs-alerts", deleted: false }], next: null });
    }

    return Response.json({
      results: [...existing.map((key) => ({ key, deleted: false })), { key: "monmap-gone", deleted: true }],
      next: "https://us.posthog.com/api/projects/42/feature_flags/?page=2",
    });
  };

  return { requests, options: { apiKey: "phx_test", projectId: "42", fetch: send } };
}

describe("syncFlags", () => {
  it("creates missing flags at their fallback and leaves existing ones alone", async () => {
    const { requests, options } = fakePostHog(["monmap-reviews", "monmap-old-thing"]);
    const report = await syncFlags(features, options);

    expect(report).toEqual({
      created: ["monmap-ai-planner", "monmap-moderation"],
      existing: ["monmap-reviews"],
      orphaned: ["monmap-old-thing"],
      expired: ["monmap-ai-planner"],
    });

    const posts = requests.filter((request) => request.startsWith("POST"));

    expect(posts).toHaveLength(2);
    expect(posts[0]).toContain("POST https://us.posthog.com/api/projects/42/feature_flags/ Bearer phx_test");
    expect(posts[0]).toContain('"key":"monmap-ai-planner"');
    expect(posts[0]).toContain('"rollout_percentage":0');
    expect(posts[1]).toContain('"key":"monmap-moderation"');
    expect(posts[1]).toContain('"rollout_percentage":100');
  });

  it("creates nothing on a dry run", async () => {
    const { requests, options } = fakePostHog([]);
    const report = await syncFlags(features, { ...options, dryRun: true });

    expect(report.created).toHaveLength(3);
    expect(requests.some((request) => request.startsWith("POST"))).toBe(false);
  });

  it("fails loudly when PostHog refuses", async () => {
    const refuse: typeof fetch = async () => new Response("Invalid API key", { status: 401 });

    await expect(syncFlags(features, { apiKey: "bad", projectId: "42", fetch: refuse })).rejects.toThrowError(/401/);
  });

  it("formats a report", () => {
    expect(formatSyncReport({ created: ["a"], existing: [], orphaned: ["b"], expired: [] })).toBe("created   a\norphaned  b");
  });
});
