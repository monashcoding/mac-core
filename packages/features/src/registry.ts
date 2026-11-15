import type { FeatureDefinition } from "./feature";

/** Who a set of features is evaluated for. `MacClaims` from @monashcoding/auth fits. */
export interface FeatureSubject {
  readonly macUserId: string;
  readonly roles: readonly string[];
  readonly team?: string | null;
  readonly clubMember?: boolean;
}

/** What a flag source is asked: every flag key of the registry, for one person. */
export interface FlagRequest {
  readonly distinctId: string;
  readonly keys: readonly string[];
  readonly properties: Readonly<Record<string, string | boolean>>;
}

/**
 * Where flag values come from. A key missing from the answer means the
 * source has no opinion and the feature keeps its fallback.
 */
export type FlagSource = (request: FlagRequest) => Promise<Readonly<Record<string, boolean>>>;

export type FeatureValues<Name extends string> = Readonly<Record<Name, boolean>>;

export class FeatureDisabledError extends Error {
  /** Answer as if the route does not exist. */
  readonly status = 404;
  readonly feature: string;

  constructor(name: string) {
    super(`The "${name}" feature is off.`);
    this.name = "FeatureDisabledError";
    this.feature = name;
  }
}

/** The features of one request: evaluated once, then read as often as needed. */
export interface FeatureSet<Name extends string> {
  isEnabled(name: Name): boolean;
  /** Throws FeatureDisabledError (status 404) when the feature is off. */
  require(name: Name): void;
  /** Plain values, for `<FeaturesProvider>` or a JSON response. */
  readonly values: FeatureValues<Name>;
}

export interface EvaluateOptions {
  /** A stable id for a signed-out visitor, so a percentage rollout can include them. */
  readonly anonymousId?: string;
}

export interface FeatureInfo<Name extends string> extends FeatureDefinition {
  readonly name: Name;
  /** The PostHog flag key. */
  readonly key: string;
}

export interface Features<Name extends string> {
  readonly app: string;
  /** Evaluate every feature for a signed-in user, or `null` for a visitor. */
  evaluate(subject: FeatureSubject | null, options?: EvaluateOptions): Promise<FeatureSet<Name>>;
  /** A FeatureSet from plain values: the client side of `evaluate`, and tests. */
  fromValues(values: Partial<FeatureValues<Name>>): FeatureSet<Name>;
  /** Every feature with its PostHog flag key. */
  list(): FeatureInfo<Name>[];
  /** Release features past their `expires` date. */
  expired(today?: Date): FeatureInfo<Name>[];
}

export interface FeaturesOptions<Name extends string> {
  /** The app's name. PostHog flag keys are `<app>-<feature-name>`. */
  readonly app: string;
  readonly features: Readonly<Record<Name, FeatureDefinition>>;
  /** Where flag values come from. Without one, every feature keeps its fallback. */
  readonly flags?: FlagSource | undefined;
  /**
   * Local overrides as `name=on,other=off`. Defaults to `MAC_FEATURES`.
   * Ignored in production.
   */
  readonly overrides?: string | undefined;
}

const APP_NAME = /^[a-z][a-z0-9-]*$/;
const FEATURE_NAME = /^[a-z][A-Za-z0-9]*$/;
const ON = new Set(["on", "true", "1"]);
const OFF = new Set(["off", "false", "0"]);

/** `aiPlanner` in app `monmap` is the PostHog flag `monmap-ai-planner`. */
export function flagKey(app: string, name: string): string {
  return `${app}-${name.replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

function parseOverrides(spec: string, names: ReadonlySet<string>): Map<string, boolean> {
  const overrides = new Map<string, boolean>();

  for (const entry of spec.split(",")) {
    const [name = "", value = ""] = entry.split("=").map((part) => part.trim());

    if (!name) continue;

    if (!names.has(name)) throw new Error(`MAC_FEATURES names an unknown feature "${name}".`);

    if (ON.has(value)) overrides.set(name, true);
    else if (OFF.has(value)) overrides.set(name, false);
    else throw new Error(`MAC_FEATURES gives "${name}" the value "${value}". Use on or off.`);
  }

  return overrides;
}

function readEnvironment(name: string): string | undefined {
  return typeof process === "undefined" ? undefined : process.env[name];
}

/**
 * The feature registry of one app. Declare every gated feature here,
 * once; code asks the registry by name and never touches a flag key.
 */
export function defineFeatures<Name extends string>(options: FeaturesOptions<Name>): Features<Name> {
  if (!APP_NAME.test(options.app)) {
    throw new Error("An app name is lowercase letters, digits and hyphens.");
  }

  // SAFETY: Object.keys of a Record<Name, _> yields exactly the Name keys the caller declared.
  const names = Object.keys(options.features) as Name[];

  for (const name of names) {
    if (!FEATURE_NAME.test(name)) throw new Error(`Feature "${name}" must be camelCase.`);
  }

  const keys = new Map(names.map((name) => [name, flagKey(options.app, name)]));
  const production = readEnvironment("NODE_ENV") === "production";
  const overrideSpec = production ? "" : (options.overrides ?? readEnvironment("MAC_FEATURES") ?? "");
  const overrides = parseOverrides(overrideSpec, new Set<string>(names));

  function info(name: Name): FeatureInfo<Name> {
    return { ...options.features[name], name, key: keys.get(name) ?? flagKey(options.app, name) };
  }

  function createSet(values: FeatureValues<Name>): FeatureSet<Name> {
    return {
      values,
      isEnabled: (name) => values[name],
      require(name) {
        if (!values[name]) throw new FeatureDisabledError(name);
      },
    };
  }

  function resolve(name: Name, subject: FeatureSubject | null, flags: Readonly<Record<string, boolean>>): boolean {
    const override = overrides.get(name);

    if (override !== undefined) return override;

    const definition = options.features[name];
    const roles = definition.roles;

    // A role gate is a hard limit: no flag can hand the feature to someone outside it.
    if (roles && !roles.some((role) => subject?.roles.includes(role))) return false;

    // So is club membership.
    if (definition.clubMembersOnly && !subject?.clubMember) return false;

    return flags[keys.get(name) ?? ""] ?? definition.fallback;
  }

  async function fetchFlags(subject: FeatureSubject | null, anonymousId: string | undefined) {
    const distinctId = subject?.macUserId ?? anonymousId;

    if (!options.flags || !distinctId) return {};

    return options
      .flags({
        distinctId,
        keys: [...keys.values()],
        properties: {
          signedIn: subject !== null,
          roles: subject?.roles.join(",") ?? "",
          team: subject?.team ?? "",
          clubMember: subject?.clubMember ?? false,
        },
      })
      .catch(() => ({}));
  }

  function build(read: (name: Name) => boolean): FeatureSet<Name> {
    const entries = names.map((name) => [name, read(name)] as const);

    // SAFETY: entries holds one [name, boolean] pair for every Name in the registry.
    return createSet(Object.fromEntries(entries) as FeatureValues<Name>);
  }

  return {
    app: options.app,

    async evaluate(subject, evaluateOptions = {}) {
      const flags = await fetchFlags(subject, evaluateOptions.anonymousId);

      return build((name) => resolve(name, subject, flags));
    },

    fromValues(values) {
      return build((name) => values[name] ?? false);
    },

    list: () => names.map(info),

    expired(today = new Date()) {
      const day = today.toISOString().slice(0, 10);

      return names.map(info).filter((entry) => entry.expires !== null && entry.expires < day);
    },
  };
}
