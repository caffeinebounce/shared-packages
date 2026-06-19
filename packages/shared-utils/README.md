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
- `getClientIP` trusts client IP headers in this order: `cf-connecting-ip`,
  `true-client-ip`, `x-real-ip`, then the first `x-forwarded-for` value.
  Consumers should only use it behind infrastructure that strips incoming
  client-supplied copies before setting trusted header values.
- Prefer narrow subpaths when consumers only need a utility family.
- Add a changeset for published behavior, source, manifest, or export changes.
