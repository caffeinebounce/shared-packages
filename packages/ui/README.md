# @caffeinebounce/ui

Shared React UI primitives, composed blocks, layouts, navigation, marketing,
settings, portal, media, and CSS exports.

## Public Entrypoints

- `@caffeinebounce/ui` is the broad compatibility entrypoint.
- `@caffeinebounce/ui/primitives` is the lightweight primitive-only entrypoint.
- Feature subpaths include `./forms`, `./hooks`, `./layouts`, `./navigation`,
  `./marketing`, `./marketing-3d`, `./settings`, `./portal`, `./blog`,
  `./data-table`, `./charts`, `./editor`, `./media`, and `./styles.css`.

## Belongs Here

- Reusable UI primitives, shared blocks, design-system components, common
  interaction patterns, and CSS meant for multiple apps.

## Does Not Belong Here

- App-specific page composition, business copy, route behavior, product-specific
  data fetching, or one-off styling that should live in a consumer app.

## Focused Commands

```bash
corepack yarn turbo run lint typecheck test build --filter=@caffeinebounce/ui
corepack yarn size:ui
```

## Gotchas

- Prefer `@caffeinebounce/ui/primitives` for primitive-only consumers.
- Keep heavy surfaces behind explicit subpaths and watch bundle budgets with
  `yarn size:ui`.
- Keep CSS exports explicit and preserve `sideEffects` metadata.
- Mark client components with `"use client"` at the leaf files that need it.
- Add a changeset for published behavior, source, manifest, CSS, or export
  changes.
