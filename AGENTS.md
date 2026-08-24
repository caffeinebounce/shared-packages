# Agent Context

## What This Repo Is

`shared-packages` is the source of truth for reusable `@caffeinebounce/*`
packages consumed by multiple applications.

- Published TypeScript packages live under `packages/*`.
- Shared SwiftUI/AppKit primitives live under `swift/` and are exposed by
  `Package.swift`.
- Release, validation, hook, and consumer-update tooling lives under `scripts/`.
- CI and publish automation lives under `.github/workflows`.
- Architecture, security, local CI, and publishing notes live under `docs/`.

This repo owns reusable primitives, shared contracts, package exports, and
release automation. Consumer repos own app-specific composition, routing,
business copy, data fetching, and deployment configuration.

## Stack

- Node.js 25+
- Yarn 4.12.0 through Corepack
- Turborepo
- React 19
- TypeScript 5.9 with strict package configs
- Tailwind CSS 4 for shared UI styling
- Biome for linting and formatting
- Vitest and Testing Library for package tests
- Tsup for package builds
- Changesets for package versioning and publishing
- GitHub Packages for private `@caffeinebounce/*` publication
- Swift Package Manager for `CaffeineNativeUI`

## Package Map

- `@caffeinebounce/ui` owns shared React UI primitives, composed blocks,
  layouts, navigation, marketing surfaces, settings components, portal
  surfaces, media helpers, and CSS exports.
- `@caffeinebounce/ui/primitives` is the lightweight entrypoint for consumers
  that only need core primitives and should not inherit broad UI dependencies.
- `@caffeinebounce/identity` owns reusable auth UI, Supabase auth helpers,
  callback handlers, redirect helpers, and identity contracts.
- `@caffeinebounce/email` owns email templates, shared email components,
  delivery clients, unsubscribe token utilities, and email category types.
- `@caffeinebounce/logger` owns structured logging utilities and Better Stack
  integration surfaces.
- `@caffeinebounce/shared-utils` owns framework-neutral helpers, analytics
  utilities, formatters, string helpers, and image helpers.
- `@caffeinebounce/commerce` owns checkout and Stripe helper contracts.
- `@caffeinebounce/notifications` owns shared notification UI and hooks.
- `@caffeinebounce/ai-assistant` owns reusable AI assistant panel components and
  provider contracts.
- `CaffeineNativeUI` owns native macOS UI primitives in Swift.

## Local Setup

Use the README for the full setup flow. The short version:

```bash
corepack enable
yarn install
yarn build
yarn test
```

Private package publish and install flows use GitHub Packages. Configure a
token with `read:packages` and `write:packages` when working with registry
operations:

```ini
@caffeinebounce:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Do not commit local tokens or machine-specific auth files.

## Package Boundary Rules

Read [PACKAGE_BOUNDARIES.md](./PACKAGE_BOUNDARIES.md) before changing exports,
entrypoints, UI dependencies, package manifests, peer dependencies, CSS exports,
or behavior that affects more than one consumer.

- Put reusable behavior in the owning package, not in a consumer repo.
- Keep app-specific copy, routing, server actions, and product logic out of
  shared packages unless the behavior is truly reusable.
- Prefer narrow package subpaths for narrow consumers.
- Use `@caffeinebounce/ui/primitives` when a consumer only needs primitives.
- Keep heavy or framework-specific surfaces behind explicit subpaths.
- Do not make a broad package entrypoint heavier to solve one app's local need.
- Keep React client components marked with `"use client"` at the leaf files that
  need it.
- Keep server-only helpers out of browser entrypoints.
- Treat package exports and generated `dist` target paths as public contracts.

## Package Local Context

Use package-level `README.md` files as the first stop for package-specific
context. They are intentionally short package cards with purpose, public
entrypoints, ownership boundaries, focused commands, and gotchas.

Do not add per-package `AGENTS.md` or `CLAUDE.md` files by default. Add
package-local agent files only if a package develops genuinely different rules
that cannot be captured in the package README or root guidance.

Do not add repo-tracked Codex `SKILL.md` files in the package tree. Real Codex
skills should live in the user or workspace skill system, not in this package
monorepo.

## Published Package Rules

- Export new public APIs from the package entrypoint or an intentional subpath.
- Update `package.json` `exports` when adding a new public subpath.
- Keep `main`, `module`, `types`, `files`, `publishConfig`, and `repository`
  fields complete for published packages.
- Internal `@caffeinebounce/*` dependency ranges must match the current
  workspace package version as `^<version>`.
- Use peer dependencies for host-owned framework/runtime packages when the
  consumer should supply them.
- Use optional peer metadata for optional framework integrations.
- Add or update tests beside the source they cover.
- Add a changeset for package behavior, source, manifest, build config, or CSS
  changes that affect published contents.

Docs-only, test-only, changelog-only, and internal tooling changes that do not
alter published package contents can skip a changeset. When skipping, use a PR
body marker such as `Changelog: skip - docs-only/internal-only change.`

## Verification

Run the narrowest useful proof set first, then broaden when touching shared
contracts, exports, package manifests, build tooling, release automation, or
consumer-facing UI.

Common checks:

```bash
corepack yarn check:conventions
corepack yarn format:check
corepack yarn lint
corepack yarn typecheck
corepack yarn test
corepack yarn build
corepack yarn validate:packages
corepack yarn test:consumer-smoke
corepack yarn size:ui
swift test
```

Useful focused checks:

```bash
corepack yarn turbo run lint typecheck test build --filter=@caffeinebounce/ui
corepack yarn turbo run test --filter=@caffeinebounce/identity
corepack yarn validate:packages:affected
CONSUMER_SMOKE_SCOPE=affected corepack yarn test:consumer-smoke
```

Use `TURBO_SCM_BASE=origin/main` for affected checks when the base branch is not
otherwise obvious.

## Convention Checks

Use `corepack yarn check:conventions` when changing agent instructions, package
boundaries, published package manifests, exports, release tooling, changeset
rules, consumer smoke coverage, or UI entrypoint budgets.

The convention check verifies:

- `AGENTS.md` and `CLAUDE.md` are byte-for-byte identical.
- changelog and changeset discipline still passes.
- workspace package contracts are valid.
- consumer import smoke tests pass.
- UI public entrypoint size budgets are respected.

It complements lint, typecheck, tests, build, and Swift tests. It does not
replace broader checks for runtime or package behavior changes.

## Organization development knowledge

After a durable change to architecture, deployment, CI, infrastructure,
repository relationships, lifecycle, or operating procedures, update the
repository changelog. Capture the operating meaning to each materially affected
company brain: `factory`, `capital-collective`, or both. Do not create an
organization capture when the change has no durable impact on that organization.
Link that organization’s `[[sources/topics/development-hub|development hub]]`
and current evidence. Skip ordinary patches. Keep credentials, private data,
and detailed threat information out of general development pages.

## Working Rules

- Keep changes scoped to the package or tooling surface in the task.
- Check `git status --short` before editing and before staging.
- Do not stage unrelated local changes.
- Prefer structured package manifests, typed exports, and existing validation
  scripts over ad hoc checks.
- Preserve package boundaries even when a consumer app needs an urgent fix.
- Do not copy app-specific behavior into shared packages without a reusable
  contract.
- Do not hardcode org-specific business context into shared package logic.
- Keep expected negative paths explicit and quiet in shared helpers.
- Keep browser-only dependencies out of server-safe utilities.
- Keep package tests colocated with the source they verify.
- Do not edit unrelated OpenClaw, agent, or machine-level config from this repo.

## Important Areas

- UI public exports and budgets: `packages/ui/package.json`,
  `packages/ui/src`, `scripts/check-ui-entrypoint-sizes.mjs`
- Package contract validation: `scripts/validate-workspace-packages.mjs`
- Changeset discipline: `scripts/check-changelog-discipline.mjs`
- Consumer import smoke: `tests/consumer-smoke/package-imports.mjs`
- Build helpers: `scripts/tsup`
- Release automation: `.github/workflows/publish.yml`,
  `.github/workflows/automerge-changesets.yml`
- CI checks: `.github/workflows/ci.yml`
- Hook setup: `scripts/setup-hooks.sh`, `scripts/git-hooks`
- Native package: `Package.swift`, `swift/`

## Pull Request Hygiene

- Start from a clean branch or worktree when possible.
- Use focused commits with prefixes such as `feat:`, `fix:`, `refactor:`,
  `docs:`, `test:`, `build:`, or `ci:`.
- Agent-generated commits in this environment should use
  `git commit --no-verify`, then run the relevant verification explicitly.
- Include a changeset for published package changes or a clear skip marker for
  docs-only, test-only, or internal-only work.
- Before calling a PR ready, verify the diff contains only files related to the
  change and list the commands run.
