# @monashcoding/lint

The MAC Oxlint preset. Turns on every [anti-slop](https://github.com/dmmulroy/anti-slop) rule in three lines of config.

## Table of contents

* [Getting started](#getting-started)
* [Configuring Oxlint](#configuring-oxlint)
* [Running it](#running-it)
* [Changing rules](#changing-rules)
* [Adding it to an existing app](#adding-it-to-an-existing-app)

## Getting started

```bash
pnpm add -D @monashcoding/lint oxlint@1.93.0
```

## Configuring Oxlint

```ts
// oxlint.config.ts
import { macLintConfig } from "@monashcoding/lint";
import { defineConfig } from "oxlint";

export default defineConfig(macLintConfig());
```

## Running it

```jsonc
// package.json
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix"
  }
}
```

```bash
pnpm lint

# Fixes spacing on its own. Everything else is fixed by hand.
pnpm lint:fix
```

## Changing rules

```ts
export default defineConfig(
  macLintConfig({
    // Turn on the Effect rules, for apps that use Effect
    effect: true,
    // Skip generated code
    ignorePatterns: ["src/generated/**"],
    // Override any rule
    rules: {
      "anti-slop/no-module-mocking": "off",
      "anti-slop/no-runtime-typeof": ["error", { allowInTypeGuards: true }],
    },
  }),
);
```

## Adding it to an existing app

Start the strictest rules as warnings, then switch each one back to `"error"` once its count reaches zero.

```ts
export default defineConfig(
  macLintConfig({
    rules: {
      "anti-slop/no-unknown-parameters": "warn",
      "anti-slop/no-runtime-typeof": "warn",
      "anti-slop/require-safety-comment-for-type-assertion": "warn",
    },
  }),
);
```
