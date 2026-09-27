---
"@caffeinebounce/logger": minor
---

Add a `@caffeinebounce/logger/node` entrypoint for plain Node processes such as workers, CLIs, and MCP servers. It loads without `next` or React installed. Importing the root entry in a non-Next install fails with `ERR_MODULE_NOT_FOUND` for `next`, because the root loads the `@logtail/next` package index.

The Node entry exports `logger`, `Logger`, `getServerLogger`, `authLogger`, `adminLogger`, `sanitizeErrorMessageForClient`, the error context helpers, and deployment environment detection. Better Stack forwarding reads the same `BETTER_STACK_SOURCE_TOKEN` and `BETTER_STACK_INGESTING_URL` settings as the root entry. `logger.flush()` sends batched events before a short-lived process exits.

The root and `/client` entrypoints keep the same exports and behavior. No existing import path changes.
