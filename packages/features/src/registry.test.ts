import { describe, expect, it } from "vitest";

import { feature } from "./feature";
import { defineFeatures, FeatureDisabledError, flagKey, type FlagSource } from "./registry";

const definitions = {
  aiPlanner: feature.release({ description: "AI plan suggestions", owner: "swofty", expires: "2027-03-01" }),
  reviews: feature.killSwitch({ description: "Unit reviews", owner: "swofty" }),
  moderation: feature.staff({ description: "Review moderation queue", owner: "swofty", roles: ["committee", "exec"] }),
};

const member = { macUserId: "user_1", roles: ["member"] };
const exec = { macUserId: "user_2", roles: ["member", "committee", "exec"], team: "Projects" };

function registry(flags?: FlagSource, overrides = "") {
  return defineFeatures({ app: "monmap", features: definitions, flags, overrides });
}

describe("defineFeatures", () => {
  it("uses each kind's fallback when there is no flag source", async () => {
    const set = await registry().evaluate(member);

    expect(set.values).toEqual({ aiPlanner: false, reviews: true, moderation: false });
  });

  it("gives staff features to the roles only", async () => {
    expect((await registry().evaluate(exec)).isEnabled("moderation")).toBe(true);
    expect((await registry().evaluate(null)).isEnabled("moderation")).toBe(false);
  });

  it("lets a flag turn a release on and a kill switch off", async () => {
    const set = await registry(async () => ({ "monmap-ai-planner": true, "monmap-reviews": false })).evaluate(member);

    expect(set.values).toEqual({ aiPlanner: true, reviews: false, moderation: false });
  });

  it("never lets a flag hand a staff feature to someone outside the roles", async () => {
    const flags: FlagSource = async () => ({ "monmap-moderation": true });

    expect((await registry(flags).evaluate(member)).isEnabled("moderation")).toBe(false);
    expect((await registry(async () => ({ "monmap-moderation": false })).evaluate(exec)).isEnabled("moderation")).toBe(false);
  });

  it("asks the source once, for every key, with non-identifying properties", async () => {
    const requests: string[] = [];

    const flags: FlagSource = async (request) => {
      requests.push(JSON.stringify(request));

      return {};
    };

    await registry(flags).evaluate(exec);

    expect(requests).toEqual([
      JSON.stringify({
        distinctId: "user_2",
        keys: ["monmap-ai-planner", "monmap-reviews", "monmap-moderation"],
        properties: { signedIn: true, roles: "member,committee,exec", team: "Projects" },
      }),
    ]);
  });

  it("skips the source for a visitor without an anonymous id", async () => {
    let calls = 0;

    const flags: FlagSource = async () => {
      calls += 1;

      return { "monmap-ai-planner": true };
    };

    expect((await registry(flags).evaluate(null)).isEnabled("aiPlanner")).toBe(false);
    expect((await registry(flags).evaluate(null, { anonymousId: "anon_1" })).isEnabled("aiPlanner")).toBe(true);
    expect(calls).toBe(1);
  });

  it("keeps the fallbacks when the source fails", async () => {
    const set = await registry(async () => {
      throw new Error("posthog is down");
    }).evaluate(member);

    expect(set.values).toEqual({ aiPlanner: false, reviews: true, moderation: false });
  });

  it("applies local overrides over everything", async () => {
    const set = await registry(async () => ({ "monmap-reviews": true }), "aiPlanner=on, reviews=off,moderation=on").evaluate(null);

    expect(set.values).toEqual({ aiPlanner: true, reviews: false, moderation: true });
  });

  it("rejects bad overrides and bad names", () => {
    expect(() => registry(undefined, "aiPlaner=on")).toThrowError(/unknown feature/);
    expect(() => registry(undefined, "aiPlanner=maybe")).toThrowError(/on or off/);
    expect(() => defineFeatures({ app: "Mon Map", features: definitions })).toThrowError();
    expect(() => defineFeatures({ app: "monmap", features: { "ai-planner": definitions.aiPlanner } })).toThrowError(/camelCase/);
  });
});

describe("FeatureSet", () => {
  it("throws a 404 error from require", async () => {
    const set = await registry().evaluate(member);

    expect(() => set.require("reviews")).not.toThrow();
    expect(() => set.require("aiPlanner")).toThrowError(FeatureDisabledError);
    expect(() => set.require("aiPlanner")).toThrowError(expect.objectContaining({ status: 404, feature: "aiPlanner" }));
  });

  it("rebuilds from plain values, with missing features off", () => {
    const set = registry().fromValues({ reviews: true });

    expect(set.values).toEqual({ aiPlanner: false, reviews: true, moderation: false });
  });
});

describe("registry housekeeping", () => {
  it("lists features with their flag keys", () => {
    expect(registry().list().map((entry) => `${entry.name} ${entry.key} ${entry.kind}`)).toEqual([
      "aiPlanner monmap-ai-planner release",
      "reviews monmap-reviews killSwitch",
      "moderation monmap-moderation staff",
    ]);
    expect(flagKey("jobs", "savedSearchAlerts")).toBe("jobs-saved-search-alerts");
  });

  it("reports release features past their date", () => {
    expect(registry().expired(new Date("2027-02-28T12:00:00Z"))).toEqual([]);
    expect(registry().expired(new Date("2027-03-02T00:00:00Z")).map((entry) => entry.name)).toEqual(["aiPlanner"]);
  });
});
