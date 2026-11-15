/** Directories that hold installed agent tooling rather than application source. */
export const agentIgnorePatterns = [
  ".agent/**",
  ".agents/**",
  ".claude/**",
  ".codex/**",
  ".continue/**",
  ".cursor/**",
  ".gemini/**",
  ".opencode/**",
  ".pi/**",
  ".roo/**",
  ".windsurf/**",
  ".superpowers/**",
  ".superdesign/**",
];

export const buildIgnorePatterns = [
  "dist/**",
  ".next/**",
  "coverage/**",
  "drizzle/**",
  "next-env.d.ts",
];

/** Every generic anti-slop rule, plus the native companion rule. */
export const antiSlopRules = {
  "oxc/no-accumulating-spread": "error",
  "anti-slop/no-array-filter-map": "error",
  "anti-slop/no-reduce-accumulator-copy": "error",
  "anti-slop/no-chained-type-assertions": "error",
  "anti-slop/no-conditional-empty-object-spread": "error",
  "anti-slop/no-known-value-widening": "error",
  "anti-slop/no-module-mocking": "error",
  "anti-slop/no-object-parameters": "error",
  "anti-slop/no-reflect-apply": "error",
  "anti-slop/no-reflect-get": "error",
  "anti-slop/no-runtime-typeof": "error",
  "anti-slop/no-shape-in-symbol-names": "error",
  "anti-slop/no-unknown-parameters": "error",
  "anti-slop/no-unknown-returns": "error",
  "anti-slop/no-unknown-type-aliases": "error",
  "anti-slop/no-unsafe-dictionary-type": "error",
  "anti-slop/no-widen-then-assert": "error",
  "anti-slop/require-readable-spacing": "error",
  "anti-slop/require-safety-comment-for-type-assertion": "error",
} as const;

export const antiSlopEffectRules = {
  "anti-slop-effect/no-manual-effect-error-tag": "error",
  "anti-slop-effect/no-manual-tag-comparison": "error",
  "anti-slop-effect/no-manual-tagged-construction": "error",
  "anti-slop-effect/no-service-constructor-imports": "error",
  "anti-slop-effect/prefer-effect-match": "error",
} as const;

/**
 * Modules that only one file in an app may import. The MAC packages wrap
 * each of these, so a direct import bypasses the shared privacy rules.
 */
const wrappedModules = [
  {
    name: "posthog-js",
    message: "Use @monashcoding/analytics/client.",
  },
  {
    name: "posthog-node",
    message: "Use @monashcoding/analytics/server.",
  },
];

type RuleSeverity = "off" | "warn" | "error";

type RuleEntry = RuleSeverity | readonly [RuleSeverity, ...unknown[]];

export interface MacLintOptions {
  /** Enable the Effect rule group. Only for apps that depend on Effect. */
  readonly effect?: boolean;
  /** Extra ignore globs, added to the agent and build output ignores. */
  readonly ignorePatterns?: readonly string[];
  /** Rule overrides, applied after the preset. */
  readonly rules?: Readonly<Record<string, RuleEntry>>;
}

export interface MacLintConfig {
  readonly ignorePatterns: string[];
  readonly jsPlugins: { name: string; specifier: string }[];
  readonly rules: Record<string, RuleEntry>;
}

/**
 * The MAC Oxlint preset. Pass the result to `defineConfig` from `oxlint`.
 */
export function macLintConfig(options: MacLintOptions = {}): MacLintConfig {
  const effect = options.effect === true;

  const genericPlugin = {
    name: "anti-slop",
    specifier: "@monashcoding/lint/anti-slop",
  };

  const effectPlugin = {
    name: "anti-slop-effect",
    specifier: "@monashcoding/lint/anti-slop-effect",
  };

  const effectRules = effect ? antiSlopEffectRules : undefined;

  return {
    ignorePatterns: [
      ...agentIgnorePatterns,
      ...buildIgnorePatterns,
      ...(options.ignorePatterns ?? []),
    ],
    jsPlugins: effect ? [genericPlugin, effectPlugin] : [genericPlugin],
    rules: {
      ...antiSlopRules,
      "no-restricted-imports": ["error", { paths: wrappedModules }],
      ...effectRules,
      ...options.rules,
    },
  };
}
