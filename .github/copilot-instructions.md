# Copilot Instructions for Shared Packages

Use the root docs as the source of truth for this repository:

- [AGENTS.md](../AGENTS.md) contains repo context, package ownership,
  verification commands, working rules, and PR hygiene.
- [CONTRIBUTING.md](../CONTRIBUTING.md) contains setup, registry access,
  changeset policy, release flow, and PR readiness guidance.
- [PACKAGE_BOUNDARIES.md](../PACKAGE_BOUNDARIES.md) contains the shared package
  ownership model, export rules, UI entrypoint rules, peer dependency guidance,
  and consumer compatibility expectations.
- Each `packages/*/README.md` file contains the package-local purpose,
  entrypoints, boundaries, focused commands, and gotchas.

When changing agent instructions, keep `AGENTS.md` and `CLAUDE.md` byte-for-byte
identical. Run:

```bash
corepack yarn check:conventions
```

This repository publishes reusable `@caffeinebounce/*` packages. Keep changes
scoped, preserve package boundaries, add changesets for published package
changes, and do not copy app-specific business logic into shared packages.

This repository is MIT-licensed. Keep public-facing docs generic, route
suspected vulnerabilities through [docs/SECURITY.md](../docs/SECURITY.md), and
avoid publishing consumer-specific runbooks or private operational details.

Do not add repo-local assistant runtime state such as `.claude/`, `.codex/`, or
package-local agent instruction files unless the root docs explicitly call for
them.
