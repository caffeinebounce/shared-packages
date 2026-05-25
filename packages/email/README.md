# @caffeinebounce/email

Reusable email templates, shared email components, provider clients, mock
transports, and unsubscribe helpers.

## Public Entrypoints

- `@caffeinebounce/email` exports email clients, universal provider helpers,
  SMTP and mock transports, shared components, templates, themes, provider
  types, and unsubscribe utilities.

## Belongs Here

- Shared email layouts, primitives, templates, theme helpers, send-client
  contracts, provider mocks, and unsubscribe token/header utilities.
- Tests for rendering, provider behavior, mocks, and unsubscribe flows.

## Does Not Belong Here

- App-specific campaign content, private recipient data, route handlers,
  product workflows, or secrets.

## Focused Commands

```bash
corepack yarn turbo run lint typecheck test build --filter=@caffeinebounce/email
```

## Gotchas

- Keep provider mocks deterministic so apps can test email flows without real
  delivery.
- Do not log or embed secrets, tokens, raw payloads, or private recipient data.
- Add a changeset for published behavior, source, manifest, or export changes.
