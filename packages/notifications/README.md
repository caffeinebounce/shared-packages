# @caffeinebounce/notifications

Shared notification UI components and hooks for apps that provide their own
notification data.

## Public Entrypoints

- `@caffeinebounce/notifications` exports `NotificationBell`,
  `NotificationDropdown`, `NotificationList`, `NotificationItem`,
  `NotificationBadge`, `useNotifications`, and notification types.

## Belongs Here

- Reusable notification display, interaction states, hook contracts, and typed
  notification data shapes.

## Does Not Belong Here

- App-owned delivery systems, persistence, polling endpoints, permissions,
  business-specific notification rules, or provider credentials.

## Focused Commands

```bash
corepack yarn turbo run lint typecheck test build --filter=@caffeinebounce/notifications
```

## Gotchas

- `next` is an optional peer; avoid requiring Next-specific behavior for every
  consumer.
- Keep delivery and data fetching injectable or app-owned.
- `fetchEndpoint` may be relative or absolute and may already include query
  parameters; `useNotifications` sets or replaces the `limit` parameter.
- Add a changeset for published behavior, source, manifest, or export changes.
