import type { FeatureInfo, Features } from "./registry";

export interface SyncOptions {
  /** A personal API key with the `feature_flag:read` and `feature_flag:write` scopes. Defaults to `POSTHOG_PERSONAL_API_KEY`. */
  readonly apiKey?: string | undefined;
  /** The PostHog project id. Defaults to `POSTHOG_PROJECT_ID`. */
  readonly projectId?: string | undefined;
  /** The PostHog app host. Defaults to `POSTHOG_APP_HOST`, then https://us.posthog.com. */
  readonly host?: string | undefined;
  /** Report what would be created without creating it. */
  readonly dryRun?: boolean;
  readonly fetch?: typeof fetch;
}

export interface SyncReport {
  /** Flags created in PostHog by this run. */
  readonly created: string[];
  /** Flags that already existed. They are never changed: PostHog owns their rollout. */
  readonly existing: string[];
  /** Flags in PostHog with this app's prefix that no feature in the registry uses. */
  readonly orphaned: string[];
  /** Release features past their `expires` date. */
  readonly expired: string[];
}

interface RemoteFlag {
  readonly key: string;
  readonly deleted: boolean;
}

interface FlagPage {
  readonly results: RemoteFlag[];
  readonly next: string | null;
}

function setting(value: string | undefined, variable: string): string {
  const resolved = value ?? process.env[variable];

  if (!resolved) throw new Error(`Set ${variable}.`);

  return resolved;
}

/*
 * A new flag starts where its kind's fallback already is, so creating
 * it changes nothing for users: a release at 0%, a kill switch and a
 * staff feature at 100%.
 */
function initialFlag<Name extends string>(feature: FeatureInfo<Name>) {
  return {
    key: feature.key,
    name: `${feature.description} (${feature.kind}, owner: ${feature.owner})`,
    active: true,
    filters: { groups: [{ properties: [], rollout_percentage: feature.fallback ? 100 : 0 }] },
  };
}

/**
 * Create the PostHog flag of every feature in the registry that does
 * not have one yet, and report what needs cleaning up. Existing flags
 * are left exactly as they are.
 */
export async function syncFlags<Name extends string>(features: Features<Name>, options: SyncOptions = {}): Promise<SyncReport> {
  const apiKey = setting(options.apiKey, "POSTHOG_PERSONAL_API_KEY");
  const projectId = setting(options.projectId, "POSTHOG_PROJECT_ID");
  const host = (options.host ?? process.env.POSTHOG_APP_HOST ?? "https://us.posthog.com").replace(/\/+$/, "");
  const send = options.fetch ?? fetch;
  const headers = { authorization: `Bearer ${apiKey}`, "content-type": "application/json" };
  const endpoint = `${host}/api/projects/${encodeURIComponent(projectId)}/feature_flags/`;

  async function call(url: string, init?: RequestInit): Promise<Response> {
    const response = await send(url, { ...init, headers });

    if (!response.ok) {
      throw new Error(`PostHog answered ${response.status} for ${init?.method ?? "GET"} ${url}: ${await response.text()}`);
    }

    return response;
  }

  async function remoteKeys(): Promise<Set<string>> {
    const keys = new Set<string>();
    let url: string | null = `${endpoint}?limit=200`;

    while (url) {
      const response = await call(url);
      // SAFETY: the feature flag list endpoint returns { results: [{ key, deleted }], next }.
      const page = (await response.json()) as FlagPage;

      for (const flag of page.results) {
        if (!flag.deleted) keys.add(flag.key);
      }

      url = page.next;
    }

    return keys;
  }

  const registry = features.list();
  const remote = await remoteKeys();
  const wanted = new Set(registry.map((feature) => feature.key));
  const appPrefix = `${features.app}-`;
  const missing = registry.filter((feature) => !remote.has(feature.key));

  if (options.dryRun !== true) {
    for (const feature of missing) {
      await call(endpoint, { method: "POST", body: JSON.stringify(initialFlag(feature)) });
    }
  }

  return {
    created: missing.map((feature) => feature.key),
    existing: registry.filter((feature) => remote.has(feature.key)).map((feature) => feature.key),
    orphaned: [...remote].filter((key) => key.startsWith(appPrefix) && !wanted.has(key)).sort(),
    expired: features.expired().map((feature) => feature.key),
  };
}

/** A sync report as lines for a terminal or a CI log. */
export function formatSyncReport(report: SyncReport): string {
  const section = (title: string, keys: readonly string[]) => keys.map((key) => `${title}  ${key}`);

  return [
    ...section("created ", report.created),
    ...section("existing", report.existing),
    ...section("orphaned", report.orphaned),
    ...section("expired ", report.expired),
  ].join("\n");
}
