/** A calendar date, `YYYY-MM-DD`. */
export type IsoDate = `${number}-${number}-${number}`;

interface Described {
  /** What the feature is, for whoever reads the registry or the PostHog flag list. */
  readonly description: string;
  /** Who removes the flag once the feature has shipped. */
  readonly owner: string;
}

export interface ReleaseOptions extends Described {
  /** The day the flag should be gone: the feature is either on for everyone or deleted. */
  readonly expires: IsoDate;
}

export interface StaffOptions extends Described {
  /** mac-auth roles that get the feature. Nobody else can be given it. */
  readonly roles: readonly [string, ...string[]];
}

export type FeatureKind = "release" | "killSwitch" | "staff";

export interface FeatureDefinition extends Described {
  readonly kind: FeatureKind;
  /** The value when PostHog has no answer: no flag exists, or PostHog is unreachable. */
  readonly fallback: boolean;
  readonly roles: readonly string[] | null;
  readonly expires: IsoDate | null;
}

/**
 * The three kinds of feature. Every feature in a registry is one of them.
 */
export const feature = {
  /**
   * New work that is not ready for everyone. Off until its PostHog flag
   * turns it on, and it carries the date the flag is removed by.
   */
  release(options: ReleaseOptions): FeatureDefinition {
    return { ...options, kind: "release", fallback: false, roles: null };
  },

  /**
   * A shipped feature that can be turned off in an incident. On unless
   * its PostHog flag turns it off. Never expires.
   */
  killSwitch(options: Described): FeatureDefinition {
    return { ...options, kind: "killSwitch", fallback: true, roles: null, expires: null };
  },

  /**
   * A feature for committee, exec or admin. On for a user holding one
   * of the roles, off for everyone else, and its PostHog flag can turn
   * it off for the staff too.
   */
  staff(options: StaffOptions): FeatureDefinition {
    return { ...options, kind: "staff", fallback: true, expires: null };
  },
};
