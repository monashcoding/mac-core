# @monashcoding/tsconfig

```bash
pnpm add -D @monashcoding/tsconfig typescript
```

```jsonc
// Next.js app
{
  "extends": "@monashcoding/tsconfig/nextjs.json",
  "compilerOptions": { "paths": { "@/*": ["./*"] } },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
}
```

```jsonc
// Node service (Express, scripts, bots)
{ "extends": "@monashcoding/tsconfig/node.json", "include": ["src"] }
```

```jsonc
// Library built with a bundler
{ "extends": "@monashcoding/tsconfig/library.json", "include": ["src"] }
```

| Preset | Adds to `base.json` |
|---|---|
| `base.json` | `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, bundler resolution |
| `nextjs.json` | DOM libs, `jsx: preserve`, the Next plugin |
| `node.json` | NodeNext modules, Node types |
| `library.json` | declarations |
