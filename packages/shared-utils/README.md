# @caffeinebounce/shared-utils

Framework-neutral utility functions for formatting, analytics snippets, strings,
images, auth metadata parsing, request helpers, and URL validation.

## Public Entrypoints

- `@caffeinebounce/shared-utils` exports the broad utility surface.
- Subpaths include `./analytics`, `./formatters`, `./string`, and `./image` for
  narrower consumers.

## Belongs Here

- Small, deterministic, framework-neutral helpers that are useful in more than
  one app.
- Typed utilities that do not require React, Next, or app-owned runtime state.

## Does Not Belong Here

- App-specific business rules, UI components, server routes, persistence logic,
  secrets, or framework-specific helpers.

## Focused Commands

```bash
corepack yarn turbo run lint typecheck test build --filter=@caffeinebounce/shared-utils
```

## Gotchas

- Keep utilities server-safe and browser-safe unless an entrypoint clearly says
  otherwise.
- `getClientIP` prefers trusted CDN edge headers before forwarded-chain
  fallbacks; consumers should confirm their deployment preserves those headers.
- Prefer narrow subpaths when consumers only need a utility family.
- Add a changeset for published behavior, source, manifest, or export changes.
