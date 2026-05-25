# Package Boundaries

This repo is the shared source of truth for reusable package behavior. Consumer
apps should compose these packages; this repo should not absorb app-specific
business logic just because one app needs a local fix.

## Ownership Model

- Shared packages own reusable contracts, primitives, helpers, and build output.
- Consumer apps own routing, app-specific copy, server actions, data fetching,
  deployment details, and product-specific composition.
- Package exports are public contracts. Treat additions, removals, renamed
  exports, moved subpaths, and dependency changes as consumer-impacting.
- Keep package APIs small and explicit. Add a new public export only when a
  consumer has a real reusable need.

## UI Entrypoints

`@caffeinebounce/ui` intentionally has both broad and narrow entrypoints.

- Use `@caffeinebounce/ui/primitives` for primitive-only consumers.
- Use feature subpaths such as `@caffeinebounce/ui/forms`,
  `@caffeinebounce/ui/navigation`, `@caffeinebounce/ui/marketing`,
  `@caffeinebounce/ui/settings`, and `@caffeinebounce/ui/portal` when a consumer
  needs a focused surface.
- Treat `@caffeinebounce/ui` as a broad compatibility entrypoint.
- Keep heavy surfaces such as charts, editors, 3D marketing, and media behind
  explicit subpaths.
- Run `yarn size:ui` when changing UI exports or dependencies.

Do not add a heavy dependency to a primitive or narrow entrypoint unless the
entrypoint truly owns that behavior.

## Client And Server Boundaries

- Mark React client components with `"use client"` in the leaf files that need
  browser APIs, hooks, event handlers, or client-only libraries.
- Keep server-safe utilities free of browser globals and browser-only imports.
- Keep server-only handlers in server entrypoints such as
  `@caffeinebounce/identity/server`.
- Do not import Next-specific helpers into framework-neutral utility packages.
- Use peer dependencies for host frameworks that should be supplied by the
  consuming app.

## CSS And Styling

- Keep package CSS exports explicit and listed in package manifests.
- Preserve `sideEffects` metadata for CSS so bundlers do not drop styles.
- Prefer shared tokens and component-level variants over consumer-specific style
  assumptions.
- Do not bake one app's theme, copy, spacing quirks, or image assets into a
  shared primitive.

## Dependency Rules

- Internal `@caffeinebounce/*` dependency ranges must match the current
  workspace package version as `^<version>`.
- Use peer dependencies when the consumer should provide the runtime.
- Use optional peer dependency metadata for integrations that are not required
  by every consumer.
- Avoid widening dependency surfaces from narrow entrypoints.
- Validate package manifests with `yarn validate:packages`.

## Export Rules

- Add public APIs through package entrypoints or intentional subpaths.
- Update `package.json` `exports`, `main`, `module`, and `types` targets when
  adding a new built surface.
- Keep generated `dist` targets aligned with package exports.
- Run build and consumer smoke checks before changing published exports.
- Add tests beside the source for new or changed behavior.

## Consumer Compatibility

Before changing a package contract, check likely consumers and choose the least
disruptive interface that solves the shared problem.

- Prefer additive changes for backward-compatible improvements.
- Use changesets to communicate consumer-facing changes.
- Do not remove exports without a migration path.
- Do not move a broad export to a narrow subpath unless the old path remains
  available or the change is intentionally breaking.

## Verification

Useful checks for package-boundary work:

```bash
yarn build
yarn validate:packages
yarn test:consumer-smoke
yarn size:ui
yarn check:conventions
```

For affected PR checks:

```bash
TURBO_SCM_BASE=origin/main yarn ci:affected
TURBO_SCM_BASE=origin/main yarn validate:packages:affected
CONSUMER_SMOKE_SCOPE=affected TURBO_SCM_BASE=origin/main yarn test:consumer-smoke
```
