# Shared Packages

Reusable packages published to GitHub Packages under the `@caffeinebounce/*` scope, plus a shared Swift package for native macOS UI. The monorepo uses Turborepo, React 19, TypeScript (strict), Tailwind CSS v4, Biome, Vitest, Tsup, and Changesets.

This repository keeps common product building blocks in one place so apps do not
need to copy the same UI, auth, email, logging, commerce, notification, and
utility code over and over. The intention is to make shared behavior easy to
reuse, easy to test, and safe to publish without hiding app-specific business
logic inside shared packages.

## Packages

| Package | Description |
|---------|-------------|
| `@caffeinebounce/ui` | Shared UI primitives and blocks (Button, Card, Dialog, layouts) |
| `@caffeinebounce/ui/primitives` | Lightweight UI primitives for packages that do not need composed blocks or Next-specific surfaces |
| `@caffeinebounce/identity` | Auth components and handlers |
| `@caffeinebounce/email` | Email templates and Resend client |
| `@caffeinebounce/ai-assistant` | AI chat panel components |
| `@caffeinebounce/logger` | Structured logging utilities |
| `@caffeinebounce/shared-utils` | Common utilities and formatters |
| `@caffeinebounce/commerce` | Checkout and Stripe helpers |
| `@caffeinebounce/notifications` | Shared notification UI and hooks |

## Swift Package

| Package | Description |
|---------|-------------|
| `CaffeineNativeUI` | Shared SwiftUI/AppKit primitives for native macOS surfaces, defined by [Package.swift](Package.swift) and sourced from `swift/` |

## Requirements & Registry

- Node.js 25+, Yarn 4.12.0 (Berry)
- `GITHUB_TOKEN` with `read:packages` and `write:packages`
- `.npmrc` (or user-level config):

```ini
@caffeinebounce:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

## Quick Start

```bash
cd shared-packages
yarn install          # Installs deps and runs ./scripts/setup-hooks.sh via prepare
yarn dev              # Watch mode for all packages
yarn build            # Build all packages
yarn typecheck        # Type-check all packages
yarn lint             # Non-mutating lint check
yarn test             # Run package tests
swift test            # Run CaffeineNativeUI tests
yarn check:conventions # Fast agent-focused docs and package contract check
yarn test:consumer-smoke # Verify built package imports the way consumers resolve them
yarn size:ui          # Report UI public entrypoint sizes and enforce lightweight budgets
yarn validate:packages # Verify published package contracts after build
```

### Day-to-day workflow

```bash
git checkout -b feat/my-change
# edit code
git commit -m "feat(ui): add Button variant"   # Hooks validate & auto-fix
yarn changeset                                  # Track version bump for published package changes
git commit -m "chore: add changeset"           # Commit the changeset
git push && open PR                             # CI builds, publish flows after merge
```

## Pre-Commit Hooks

Hooks install automatically via the `prepare` script, or run `./scripts/setup-hooks.sh`.

They check and auto-fix:
- Agent docs sync between `AGENTS.md` and `CLAUDE.md`
- File hygiene (trailing whitespace, EOF, conflict markers)
- Biome lint/format (auto-fix + re-stage)
- TypeScript type checks
- Secrets detection (uses `.secrets.baseline`)
- Conventional commit message format

## Versioning, Publishing, and Consumer Updates

1. Create a changeset with `yarn changeset` (choose patch/minor/major) for published package changes.
2. Merge feature PRs; Changesets action opens a version-bump PR.
3. Merge the version-bump PR; `publish.yml` builds and publishes to GitHub Packages.
4. After publish, `publish.yml` dispatches `update-shared-packages` to consumer apps such as Compass.

PR CI runs `yarn check:changelog` to enforce this. The check verifies every package changelog starts at its current `package.json` version, and source, package manifest, package build config, package CSS, and shared Tsup tooling changes require either a `.changeset/*.md` file or an explicit PR-body exception.

Docs-only, test-only, changelog-only, and internal tooling changes that do not alter published package contents or consumer-facing behavior can skip a changeset. Use a PR body marker such as `Changelog: skip - docs-only update.` when you use that exception.

PR CI economizes package checks with Turbo affected filtering: `yarn ci:affected` runs package lint, typecheck, test, and build only for packages changed since the base branch plus downstream dependents. `yarn validate:packages:affected` still validates every workspace manifest, but only checks built `dist` targets for affected packages. Pushes to `main` and publish workflows keep the full workspace validation.

Manual publishing (maintainers):

```bash
yarn release
```

Compass manual update (if needed):

```bash
gh workflow run update-shared-packages.yml --repo caffeinebounce/compass
```

## Docs

- Repository overview, quick start, and workflows: this README
- Agent context and working rules: [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md)
- Contribution workflow: [CONTRIBUTING.md](CONTRIBUTING.md)
- Package ownership and export boundaries: [PACKAGE_BOUNDARIES.md](PACKAGE_BOUNDARIES.md)
- Package-specific context: each `packages/*/README.md`
- Detailed system guides: [docs/auto-publish-system.md](docs/auto-publish-system.md), [docs/setup-hooks-and-publish.md](docs/setup-hooks-and-publish.md)
- Visuals: [docs/ARCHITECTURE_DIAGRAMS.md](docs/ARCHITECTURE_DIAGRAMS.md)
- Consumer guide (Compass): [../compass/docs/updating-shared-packages.md](../compass/docs/updating-shared-packages.md)
- Agent/automation guidance: [.github/copilot-instructions.md](.github/copilot-instructions.md)

## Reference Dev Scripts

Reusable shell scripts for env management and Yarn auth are available in `scripts/`:

- `scripts/export-env.sh [path]` — source variables from an env file (default `./.env.local`)
- `scripts/with-env.sh [path] -- <cmd>` — run a command with env loaded
- `scripts/sync-env.sh [example] [local]` — add missing keys from `.env.example` to `.env.local`
- `scripts/update-yarnrc-local.sh [env]` — write `GITHUB_TOKEN` to `.yarnrc.local.yml`

These are reference implementations to copy into consuming repos. Paths default to repo root; pass explicit paths (e.g., `apps/web/.env.local`) as needed.

Examples:

```bash
# Run with env (repo-root default)
./scripts/with-env.sh -- yarn dev

# Run with explicit app env
./scripts/with-env.sh apps/web/.env.local -- yarn build

# Sync envs using explicit paths
./scripts/sync-env.sh apps/web/.env.example apps/web/.env.local

# Update Yarn auth token from explicit env file
./scripts/update-yarnrc-local.sh apps/web/.env.local
```

## Conventions

- Conventional commits: `type(scope): description` (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert)
- Strict TypeScript; export new public APIs from package entry points
- Prefer server-safe code by default; mark client components with `"use client"`
- Prefer `@caffeinebounce/ui/primitives` for primitive-only shared package imports. The root `@caffeinebounce/ui` entrypoint remains broad for backward compatibility.
- Heavy optional UI surfaces such as editor, charts, 3D marketing, media, and the root compatibility entrypoint are intentional subpaths and are reported by `yarn size:ui`.
- `@caffeinebounce/ui` uses colocated `.test.ts(x)` files alongside the source they cover
- Internal `@caffeinebounce/*` dependencies that refer to packages in this workspace must use `^<current workspace version>` in published package manifests; this is enforced by `yarn validate:packages`
- Keep `AGENTS.md` and `CLAUDE.md` byte-for-byte identical; `yarn check:conventions` verifies this.

## License

This repository is licensed under the [MIT License](LICENSE.md).

## Support

- Supabase auth redirects: for localhost, preview, Tailscale, or any dynamic callback host, add `origin/**` to Supabase Auth > URL Configuration > Additional Redirect URLs. `@caffeinebounce/identity` builds callbacks from the active origin, and `@caffeinebounce/shared-utils` exposes `getSupabaseRedirectUrls(origin)` to generate the canonical entries.
- Re-run hooks: `./scripts/setup-hooks.sh`
- Auto-fix linting: `yarn lint:fix`
- Auto-fix formatting: `yarn format`
- Type errors: `yarn typecheck`
