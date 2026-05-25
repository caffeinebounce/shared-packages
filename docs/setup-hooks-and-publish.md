# Setup Guide: Hooks And Publishing

This guide documents the repository-local development hooks and the package
release workflow for `shared-packages`.

## Prerequisites

- Node.js 25+
- Yarn 4.12.0
- Git 2.9+
- `pre-commit`

## Install Hooks

Hooks install automatically through the root `prepare` script during
`yarn install`. To install them manually:

```bash
./scripts/setup-hooks.sh
```

The hooks check:

- file hygiene
- JSON, YAML, and TOML syntax
- Biome formatting and linting
- TypeScript type checking
- secrets detection
- conventional commit messages

Run the hooks against the full repository when changing hook configuration:

```bash
pre-commit run --all-files
```

## Registry Auth

Local installs from GitHub Packages require a token with `read:packages`.
Maintainers who publish releases need `write:packages` in the release workflow.

Use either user-level npm config or a local `.npmrc`:

```ini
@caffeinebounce:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Do not commit local auth files such as `.env`, `.npmrc` with real tokens, or
`.yarnrc.local.yml`.

## Publish Flow

1. Make the package change.
2. Add tests for behavioral changes.
3. Create a changeset with `yarn changeset`.
4. Open a PR and wait for CI.
5. Merge the feature PR.
6. Changesets opens a version PR.
7. Merge the version PR.
8. The publish workflow builds and publishes packages to GitHub Packages.

Docs-only, test-only, changelog-only, and repository tooling changes that do
not alter published package contents can skip a changeset with a clear PR body
marker such as:

```text
Changelog: skip - docs-only update.
```

## Validation

Run the local proof set before release-sensitive changes:

```bash
yarn install --immutable
yarn lint
yarn typecheck
yarn test
yarn build
yarn validate:packages
yarn test:consumer-smoke
yarn size:ui
swift test
```

For dependency security checks:

```bash
yarn npm audit --recursive --json
```

For secret scanning:

```bash
gitleaks detect --source . --redact
```

## Consumer Updates

Consumer-specific update workflows should live in the consuming repositories.
If a consumer exposes a manual update workflow, maintainers can trigger it with:

```bash
gh workflow run update-shared-packages.yml --repo <owner>/<consumer-repo>
```

Keep consumer repository names, deployment details, and operational runbooks in
the consuming repositories unless they are intended to be public here.

## Troubleshooting

If hooks fail because tooling is missing, reinstall dependencies and hooks:

```bash
yarn install
./scripts/setup-hooks.sh
```

If Biome changed files, review the diff and stage the generated fixes.

If secrets detection flags a false positive, update `.secrets.baseline` only
after manually verifying the value is not a secret.

Bypass hooks only for emergencies:

```bash
git commit --no-verify -m "fix: critical release repair"
```

Follow up by fixing the hook failure instead of normalizing bypasses.
