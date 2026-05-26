# Contributing

Thanks for helping improve `shared-packages`. This repo publishes reusable
packages consumed by multiple apps, so small changes can have a wide blast
radius. Keep changes scoped, verified, and explicit about package boundaries.

## Start Here

- Read [AGENTS.md](./AGENTS.md) for repo context, working rules, verification
  commands, and package ownership.
- Read [PACKAGE_BOUNDARIES.md](./PACKAGE_BOUNDARIES.md) before changing package
  exports, UI entrypoints, peer dependencies, CSS, shared components, or
  framework-specific integrations.
- Read [docs/SECURITY.md](./docs/SECURITY.md) before reporting or handling
  security issues.
- Read [LICENSE](./LICENSE) before copying, modifying, distributing, or
  sublicensing the code.

This repository is MIT-licensed. Contributions are accepted under the same MIT
license unless a separate written agreement says otherwise.

## Access

Packages publish to GitHub Packages under `@caffeinebounce/*`. Registry
operations require a GitHub token with package access.

```ini
@caffeinebounce:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Do not commit `.npmrc`, `.yarnrc.local.yml`, environment files, tokens, or
machine-specific auth state with real secrets.

## Local Development

```bash
corepack enable
yarn install
./scripts/setup-hooks.sh
yarn build
yarn test
```

The hook setup installs local git hooks and the pre-commit framework. Hooks are
also installed by the root `prepare` script during `yarn install`.

## Branches And Commits

- Keep work scoped to one package, tool, or review thread when possible.
- Check `git status --short` before editing, staging, and committing.
- Use conventional commit prefixes such as `feat:`, `fix:`, `refactor:`,
  `docs:`, `test:`, `build:`, or `ci:`.
- Agent-generated commits in this environment should use
  `git commit --no-verify`, then run the relevant checks explicitly.
- Do not stage unrelated local changes.

## Package Changes

Use the existing package as the unit of ownership:

- Put reusable UI in `@caffeinebounce/ui`.
- Put auth UI and auth handler contracts in `@caffeinebounce/identity`.
- Put email templates and delivery helpers in `@caffeinebounce/email`.
- Put structured logging surfaces in `@caffeinebounce/logger`.
- Put framework-neutral utilities in `@caffeinebounce/shared-utils`.
- Put Stripe and checkout helpers in `@caffeinebounce/commerce`.
- Put notification UI and hooks in `@caffeinebounce/notifications`.
- Put shared AI assistant UI contracts in `@caffeinebounce/ai-assistant`.

If behavior is app-specific, keep it in the consumer app. If behavior is shared,
extend the package with a typed, tested, documented contract.

## Changesets

Create a changeset for package behavior, source, manifest, build config, or CSS
changes that affect published contents:

```bash
yarn changeset
```

Docs-only, test-only, changelog-only, and internal tooling changes that do not
alter published package contents or consumer-facing behavior can skip a
changeset. When skipping, include a PR body marker such as:

```text
Changelog: skip - docs-only/internal-only change.
```

## Verification

Run the narrowest useful proof set for the change, then broaden when touching
shared contracts, exports, package manifests, build tooling, or release
automation.

Common checks:

```bash
yarn check:conventions
yarn format:check
yarn lint
yarn typecheck
yarn test
yarn build
yarn validate:packages
yarn test:consumer-smoke
yarn size:ui
swift test
```

For narrow local iteration before broader CI, affected checks are usually
enough:

```bash
TURBO_SCM_BASE=origin/main yarn ci:affected
TURBO_SCM_BASE=origin/main yarn validate:packages:affected
CONSUMER_SMOKE_SCOPE=affected TURBO_SCM_BASE=origin/main yarn test:consumer-smoke
```

## Pull Requests

Before marking a PR ready:

- Confirm the diff contains only files related to the change.
- Include commands run and their result.
- Include a changeset or a clear changeset skip marker.
- Note any tests that were skipped and why.
- Confirm package exports, peer dependencies, and consumer import paths still
  match the intended public contract.
- Confirm no secrets, tokens, credentials, private data, token-shaped
  placeholders, or consumer-specific runbooks are included.
- Confirm public documentation remains consistent with the MIT license.

For the full public-readiness proof set, run:

```bash
yarn verify:pre-public
```

## Release Flow

Feature PRs merge to `main`. Changesets opens a version PR. Merging the version
PR publishes updated packages to GitHub Packages and triggers consumer update
automation where configured.

Maintainer references:

- [docs/auto-publish-system.md](./docs/auto-publish-system.md)
- [docs/setup-hooks-and-publish.md](./docs/setup-hooks-and-publish.md)
- [docs/LOCAL-CI.md](./docs/LOCAL-CI.md)

## Security

Do not open public issues for suspected vulnerabilities. Follow
[docs/SECURITY.md](./docs/SECURITY.md).
