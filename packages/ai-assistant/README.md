# @caffeinebounce/ai-assistant

Reusable React UI and provider contracts for embedding an AI assistant panel in
apps.

## Public Entrypoints

- `@caffeinebounce/ai-assistant` exports `AiAssistantProvider`,
  `AiAssistantPanel`, `useAiAssistant`, `useAiCapability`, and public assistant
  types.

## Belongs Here

- Shared assistant shell, panel, provider state, capability registration, and UI
  contracts.
- Reusable behavior that multiple apps can wire to their own AI backends.

## Does Not Belong Here

- Product-specific prompts, business context, model routing, API keys, or
  app-owned AI endpoints.
- One-off assistant workflows that only make sense in a single app.

## Focused Commands

```bash
corepack yarn turbo run lint typecheck test build --filter=@caffeinebounce/ai-assistant
```

## Gotchas

- Keep this package UI-focused and backend-agnostic.
- Do not hardcode product language, org context, or model assumptions.
- Add a changeset for published behavior, source, manifest, or export changes.
