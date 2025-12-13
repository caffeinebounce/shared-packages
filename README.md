yarn build
yarn dev
yarn lint
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
direnv allow
yarn changeset
yarn version-packages
yarn release
# Shared Packages

Reusable packages for Capital Collective projects published to GitHub Packages under the `@caffeinebounce/*` scope. The monorepo uses Turborepo, React 19, TypeScript (strict), Tailwind CSS v4, Biome, Vitest, Tsup, and Changesets.

## Packages

| Package | Description |
|---------|-------------|
| `@caffeinebounce/ui` | Shared UI primitives and blocks (Button, Card, Dialog, layouts) |
| `@caffeinebounce/identity` | Auth components and handlers |
| `@caffeinebounce/email` | Email templates and Resend client |
| `@caffeinebounce/ai-assistant` | AI chat panel components |
| `@caffeinebounce/logger` | Structured logging utilities |

## Requirements & Registry

- Node.js 20.9+, Yarn 4.11 (Berry)
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
yarn build            # Type-check & build
yarn lint             # Biome lint/format check
```

### Day-to-day workflow

```bash
git checkout -b feat/my-change
# edit code
git commit -m "feat(ui): add Button variant"   # Hooks validate & auto-fix
yarn changeset                                  # Track version bump
git commit -m "chore: add changeset"           # Commit the changeset
git push && open PR                             # CI builds, publish flows after merge
```

## Pre-Commit Hooks

Hooks install automatically via the `prepare` script, or run `./scripts/setup-hooks.sh`.

They check and auto-fix:
- File hygiene (trailing whitespace, EOF, conflict markers)
- Biome lint/format (auto-fix + re-stage)
- TypeScript type checks
- Secrets detection (uses `.secrets.baseline`)
- Conventional commit message format

## Versioning, Publishing, and Consumer Updates

1. Create a changeset with `yarn changeset` (choose patch/minor/major).
2. Merge feature PRs; Changesets action opens a version-bump PR.
3. Merge the version-bump PR; `publish.yml` builds and publishes to GitHub Packages.
4. After publish, `publish.yml` dispatches to Compass; Compass `update-shared-packages.yml` updates dependencies, runs lint/build, and opens an update PR.

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
- Detailed system guides: [docs/auto-publish-system.md](docs/auto-publish-system.md), [docs/setup-hooks-and-publish.md](docs/setup-hooks-and-publish.md)
- Visuals: [docs/ARCHITECTURE_DIAGRAMS.md](docs/ARCHITECTURE_DIAGRAMS.md)
- Consumer guide (Compass): [../compass/docs/updating-shared-packages.md](../compass/docs/updating-shared-packages.md)
- Agent/automation guidance: [.github/copilot-instructions.md](.github/copilot-instructions.md)

## Conventions

- Conventional commits: `type(scope): description` (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert)
- Strict TypeScript; export new public APIs from package entry points
- Prefer server-safe code by default; mark client components with `"use client"`

## Support

- Re-run hooks: `./scripts/setup-hooks.sh`
- Auto-fix formatting: `yarn format`
- Type errors: `yarn build`

