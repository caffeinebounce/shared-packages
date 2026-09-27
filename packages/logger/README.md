# @caffeinebounce/logger

Shared structured logging utilities for server and client code, including Better
Stack integration surfaces.

## Public Entrypoints

- `@caffeinebounce/logger` exports shared loggers, API error wrappers,
  auth-specific logging helpers, environment detection, and React error logging
  hooks.
- `@caffeinebounce/logger/client` exports client-safe logging helpers.
- `@caffeinebounce/logger/node` exports the framework-neutral server surface
  for plain Node processes such as workers, CLIs, and MCP servers: `logger`,
  `authLogger`, `adminLogger`, `getServerLogger`, environment detection, error
  context helpers, and `sanitizeErrorMessageForClient`. It does not load `next`
  or React. Call `await logger.flush()` before a short-lived process exits.

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
- Do not pass raw email addresses into log context; use account-domain metadata
  such as `accountDomain` or `targetAccountDomain` when the domain is useful.
- Expected negative paths should return clear status codes without noisy error
  logs.
- Keep client-safe exports free of server-only dependencies.
- The root entry loads `next` through the `@logtail/next` package index. Keep
  `src/node.ts` and its imports free of `next`, React, and that index;
  `node-logger.ts` imports only `@logtail/next/dist/logger.js` and
  `dist/config.js`. `yarn test:consumer-smoke` installs the package without
  `next` and fails if the Node entry regresses.
- `@logtail/next` declares `next` as a required peer. npm 7+ and pnpm with
  auto-installed peers still add `next` to a non-Next install; Yarn and
  `npm --legacy-peer-deps` do not. The Node entry works either way.
- Add a changeset for published behavior, source, manifest, or export changes.
