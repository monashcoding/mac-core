# mac-core

Shared TypeScript packages for Monash Association of Coding apps.

| Package | Use |
|---|---|
| [`@monashcoding/auth`](packages/auth) | Sign-in through mac-auth, the signed-in user, role guards |
| [`@monashcoding/analytics`](packages/analytics) | PostHog and Google Analytics |
| [`@monashcoding/db`](packages/db) | Postgres through Drizzle, encrypted columns, per-app databases |
| [`@monashcoding/lint`](packages/lint) | Oxlint preset with the anti-slop rules |
| [`@monashcoding/tsconfig`](packages/tsconfig) | TypeScript presets |

```bash
pnpm add @monashcoding/auth @monashcoding/analytics @monashcoding/db
pnpm add -D @monashcoding/lint @monashcoding/tsconfig oxlint
```

[`docs/ADOPTING.md`](docs/ADOPTING.md) lists what each MAC app replaces.

## Development

```bash
pnpm install
pnpm check
```

`pnpm check` builds every package, lints, typechecks and runs the tests.

## Releasing

```bash
pnpm changeset
```

Commit the generated file with the change. On `main`, the Release workflow opens a "Version Packages" pull request; merging it publishes the changed packages to npm. The workflow needs an `NPM_TOKEN` repository secret with publish access to the `@monashcoding` scope.

## Trying a change in an app before release

```bash
pnpm build
cd packages/auth && pnpm pack
cd ~/your-app && pnpm add ~/mac-core/packages/auth/monashcoding-auth-0.1.0.tgz
```
