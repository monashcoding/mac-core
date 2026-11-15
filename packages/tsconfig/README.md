# @monashcoding/tsconfig

TypeScript presets. One for Next.js apps, one for Node services, one for libraries.

## Table of contents

* [Getting started](#getting-started)
* [Next.js app](#nextjs-app)
* [Node service](#node-service)
* [Library](#library)

## Getting started

```bash
pnpm add -D @monashcoding/tsconfig typescript
```

## Next.js app

```jsonc
// tsconfig.json
{
  "extends": "@monashcoding/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
}
```

## Node service

For Express servers, scripts and bots.

```jsonc
// tsconfig.json
{
  "extends": "@monashcoding/tsconfig/node.json",
  "include": ["src"]
}
```

## Library

For a package built with a bundler.

```jsonc
// tsconfig.json
{
  "extends": "@monashcoding/tsconfig/library.json",
  "include": ["src"]
}
```
