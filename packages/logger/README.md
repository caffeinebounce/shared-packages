# @caffeinebounce/logger

Shared structured logging utilities for server and client code, including Better
Stack integration surfaces.

## Public Entrypoints

- `@caffeinebounce/logger` exports shared loggers, API error wrappers,
  auth-specific logging helpers, environment detection, and React error logging
  hooks.
- `@caffeinebounce/logger/client` exports client-safe logging helpers.

## Belongs Here

- Generic structured logging, error context extraction, correlation IDs, API
  wrappers, auth logging helpers, and safe client hooks.

## Does Not Belong Here

- App-specific event taxonomy that only one app understands, secrets, raw PII,
  auth cookies, request bodies, or noisy logs for expected validation failures.

## Focused Commands

```bash
corepack yarn turbo run lint typecheck test build --filter=@caffeinebounce/logger
```

## Gotchas

- Keep metadata useful but safe.
- Expected negative paths should return clear status codes without noisy error
  logs.
- Keep client-safe exports free of server-only dependencies.
- Add a changeset for published behavior, source, manifest, or export changes.
