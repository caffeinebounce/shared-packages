# @caffeinebounce/identity

Reusable auth UI, Supabase auth helpers, callback handler contracts, and
identity utilities.

## Public Entrypoints

- `@caffeinebounce/identity` exports auth UI, client-facing hooks, callback
  handler types, and shared identity utilities.
- `@caffeinebounce/identity/server` exports server-safe callback handlers and
  utilities without client component directives.

## Auth Callback Policy

`createAuthCallbackHandler` owns reusable OAuth and OTP callback mechanics:
safe redirect parsing, Supabase exchange/verification, authenticated user
lookup, post-auth hooks, and error redirects.

Consumers own product-specific policy. Use `postAuthHook` for app-local setup,
`resolveSuccessRedirect` for role or approval routing, `isLinkingFlow` for
consumer account-linking routes, and `resolveLinkingErrorMessage` for branded
linking-error copy.

## Belongs Here

- Shared sign-in, sign-up, password reset, MFA, account settings, callback, and
  redirect behavior.
- Typed auth contracts that multiple apps can wire to their own routes.

## Does Not Belong Here

- App-specific authorization policy, private route structure, branded auth copy,
  database migrations, or org-specific business rules.

## Focused Commands

```bash
corepack yarn turbo run lint typecheck test build --filter=@caffeinebounce/identity
```

## Gotchas

- Keep client and server surfaces separate.
- Do not import browser-only code from `@caffeinebounce/identity/server`.
- Preserve callback and redirect behavior as public contracts.
- Add a changeset for published behavior, source, manifest, or export changes.
