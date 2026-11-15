# @monashcoding/lint

The MAC Oxlint preset: every [anti-slop](https://github.com/dmmulroy/anti-slop) rule, plus import restrictions for the modules the MAC packages wrap.

```bash
pnpm add -D @monashcoding/lint oxlint@1.93.0
```

```ts
// oxlint.config.ts
import { macLintConfig } from "@monashcoding/lint";
import { defineConfig } from "oxlint";

export default defineConfig(macLintConfig());
```

```jsonc
// package.json
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix"
  }
}
```

## Options

```ts
export default defineConfig(
  macLintConfig({
    effect: true,                                    // apps that depend on Effect
    ignorePatterns: ["src/generated/**"],
    rules: {
      "anti-slop/no-runtime-typeof": ["error", { allowInTypeGuards: true }],
      "anti-slop/no-module-mocking": "off",
    },
  }),
);
```

## Adopting in an existing app

```ts
macLintConfig({
  rules: {
    "anti-slop/no-unknown-parameters": "warn",
    "anti-slop/require-safety-comment-for-type-assertion": "warn",
  },
});
```

Run `oxlint --fix` first: `require-readable-spacing` fixes itself. Then turn each `warn` back to `error` as the count reaches zero.

## Rules

| Rule | Rejects |
|---|---|
| `no-array-filter-map` | adjacent `filter().map()` passes |
| `no-reduce-accumulator-copy` | copying the accumulator inside `reduce` |
| `no-chained-type-assertions` | `value as unknown as T` |
| `no-conditional-empty-object-spread` | `...(cond ? { a } : {})` |
| `no-known-value-widening` | a known value assigned to `unknown`, `object` or an open dictionary |
| `no-module-mocking` | `vi.mock`, `jest.mock` |
| `no-object-parameters` | `object` as a parameter type |
| `no-reflect-apply`, `no-reflect-get` | `Reflect.apply`, `Reflect.get` |
| `no-runtime-typeof` | `typeof x === "string"` narrowing |
| `no-shape-in-symbol-names` | `Shape` in a symbol name |
| `no-unknown-parameters`, `no-unknown-returns`, `no-unknown-type-aliases` | `unknown` in a function contract |
| `no-unsafe-dictionary-type` | `Record<string, unknown>` |
| `no-widen-then-assert` | widening to `unknown`, then asserting back |
| `require-readable-spacing` | missing blank lines (autofix) |
| `require-safety-comment-for-type-assertion` | `as T` without a `// SAFETY:` comment |
| `no-restricted-imports` | `posthog-js`, `posthog-node` outside `@monashcoding/analytics` |

The plugin source is a vendored copy at `src/anti-slop`. `src/anti-slop/UPSTREAM.md` records the upstream revision and local changes.
