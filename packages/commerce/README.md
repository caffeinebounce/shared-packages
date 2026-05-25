# @caffeinebounce/commerce

Shared checkout and Stripe helper contracts for apps that need payment flows.

## Public Entrypoints

- `@caffeinebounce/commerce` exports client-safe Stripe helpers and checkout UI.
- `@caffeinebounce/commerce/server` exports server-only Stripe helpers, fee
  calculations, and refund helpers.

## Belongs Here

- Reusable checkout components, client Stripe loading helpers, fee math, refund
  helpers, and server Stripe client creation.
- Generic payment contracts that can be reused across apps.

## Does Not Belong Here

- App-specific pricing plans, product catalogs, route handlers, checkout copy,
  webhook persistence, or fulfillment logic.

## Focused Commands

```bash
corepack yarn turbo run lint typecheck test build --filter=@caffeinebounce/commerce
```

## Gotchas

- Keep server-only code behind `@caffeinebounce/commerce/server`.
- `stripe` is an optional peer; do not force every consumer to load server
  Stripe code from client surfaces.
- Add a changeset for published behavior, source, manifest, or export changes.
