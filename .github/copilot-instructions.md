# Copilot Instructions for Shared Packages

Use the root docs as the source of truth for this repository:

- [AGENTS.md](../AGENTS.md) contains repo context, package ownership,
  verification commands, working rules, and PR hygiene.
- [CONTRIBUTING.md](../CONTRIBUTING.md) contains setup, registry access,
  changeset policy, release flow, and PR readiness guidance.
- [PACKAGE_BOUNDARIES.md](../PACKAGE_BOUNDARIES.md) contains the shared package
  ownership model, export rules, UI entrypoint rules, peer dependency guidance,
  and consumer compatibility expectations.

When changing agent instructions, keep `AGENTS.md` and `CLAUDE.md` byte-for-byte
identical. Run:

```bash
corepack yarn check:conventions
```

This repository publishes reusable `@caffeinebounce/*` packages. Keep changes
scoped, preserve package boundaries, add changesets for published package
changes, and do not copy app-specific business logic into shared packages.
