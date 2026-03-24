# Auto-Publish & Version Bumping System

This document describes the automated system for publishing shared packages and updating consuming applications.

## Overview

The system has three main components:

1. **Changesets** - Tracks version changes locally and generates changelogs
2. **GitHub Actions (shared-packages)** - Validates in `ci.yml`, publishes in `publish.yml`, and notifies consumers
3. **GitHub Actions (Compass & others)** - Automatically updates to latest versions with PR review

## Workflow

```
Developer commit
    ↓
Run: yarn changeset
    ↓
PR merged to main
    ↓
GH Actions: Changesets creates version bump + changelog
    ↓
Packages published to GitHub Packages
    ↓
GH Actions: Trigger consumer repos
    ↓
Consumer repos: Auto-update dependencies (PR)
    ↓
Manual review & merge of update PR
```

## Step-by-Step Guide

### 1. Making Changes to Shared Packages

When you modify a package (e.g., `@caffeinebounce/ui`):

```bash
# Make your changes
vim packages/ui/src/components/Button.tsx

# Commit with conventional format
git commit -m "feat(ui): add color variants to Button"
```

### 2. Recording Version Changes

Before opening a PR, record the version change:

```bash
# This creates a `.changeset/*.md` file
yarn changeset

# The interactive prompt will ask:
# 1. Which packages changed? (select ui, identity, etc.)
# 2. What's the semver bump? (patch/minor/major)
# 3. Write a summary of the change

# Example: ui = minor (new feature, backward compatible)
```

This creates a file like `.changeset/tall-kings-57.md`:

```markdown
---
"@caffeinebounce/ui": minor
---

Add color variants to Button component

New button colors: primary, secondary, danger, success with hover states.
```

### 3. Commit & Push

```bash
# Stage the changeset file along with your code
git add .changeset/tall-kings-57.md packages/ui/src/components/Button.tsx

# Commit
git commit -m "feat(ui): add color variants to Button"

# Push to feature branch
git push origin feat/button-variants
```

### 4. Automated Version Bump on Merge

When your PR is merged to `main`:

1. **Changesets Action** creates a PR that:
   - Bumps versions in `package.json` files
   - Updates `CHANGELOG.md` files
   - Removes `.changeset/*.md` files

2. You (or maintainer) review and merge the version bump PR

3. **Publish workflow** immediately:
   - Runs `yarn lint`, `yarn typecheck`, `yarn test`, `yarn build`
   - Runs `yarn validate:packages`
   - Runs `yarn release` → publishes to GitHub Packages
   - Triggers consumer repos (Compass, etc.) through `repository_dispatch`

### 5. Consumer Apps Auto-Update

When Compass receives the update notification:

1. **Update workflow** runs:
   - Checks which packages were published
   - Updates `package.json` for each published package to `@latest`
   - Runs `yarn install` to lock new versions
   - Validates: lint, build, type-check

2. Creates a PR for manual review:
   - Lists updated packages
   - Shows validation results
   - Auto-labeled with `dependencies`, `automated`

3. You review and merge the update PR

## Changeset File Format

Changesets are YAML files in `.changeset/` directory:

```markdown
---
"@caffeinebounce/ui": minor
"@caffeinebounce/logger": patch
---

Brief summary of changes affecting multiple packages
```

**Version bump options:**
- `patch` - Bug fixes, non-breaking changes (0.0.X)
- `minor` - New features, backward compatible (0.X.0)
- `major` - Breaking changes (X.0.0)

## Manual Publishing (if needed)

If you need to manually publish or update versions:

```bash
# From shared-packages root

# See what will change
yarn changeset status

# Update versions based on changesets
yarn version-packages

# Publish to GitHub Packages
yarn release
```

This is normally done automatically by CI, but useful for hotfixes or edge cases.

## Triggering Manual Consumer Updates

If you need to update Compass (or another consumer) without a shared-packages publish:

```bash
# From Compass repo
# Use GitHub web UI or CLI to trigger workflow_dispatch:
gh workflow run update-shared-packages.yml -f packages="@caffeinebounce/ui @caffeinebounce/identity"
```

Or via GitHub UI:
1. Go to **Actions** tab
2. Select **Update Shared Packages** workflow
3. Click **Run workflow**
4. Enter packages to update (or leave empty for all)

## Environment Setup

### Shared Packages

Ensure `.npmrc` in shared-packages root:

```ini
@caffeinebounce:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

This allows publishing to GitHub Packages during CI.

### Consumer Apps (Compass)

Ensure `.npmrc`:

```ini
@caffeinebounce:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

This allows reading from GitHub Packages.

## Troubleshooting

### Changeset Status Shows No Changes

```bash
yarn changeset status
```

Should show changesets ready to be versioned. If empty:
- Run `yarn changeset` again to create changesets
- Or, there may not be unreleased changes

### Publish Fails with "Cannot find module"

Check that:
1. Package is in `packages/` directory
2. `package.json` has correct `name` field
3. Build output is in `dist/` (configured in `tsup.config.ts`)
4. `.npmrc` has correct registry URL

### Consumer Update PR Not Created

Check the **Update Shared Packages** workflow run:
1. Go to Compass → Actions → Update Shared Packages
2. Review the latest run
3. Check logs for errors
4. Manually trigger if needed: `gh workflow run update-shared-packages.yml`

### Version Already Published

If you publish the same version twice:

```bash
# Check npm registry
npm view @caffeinebounce/ui@0.1.4

# Increment version in package.json manually if needed
# Then run: yarn release
```

## CI/CD Workflows

### shared-packages Workflows

#### `ci.yml`
- Runs on: push to `main` or PR
- Steps: Install → Lint → Typecheck → Test → Build → Validate package contracts

#### `publish.yml`
- Runs on: push to `main` or manual dispatch
- Steps: Install → Lint → Typecheck → Test → Build → Validate package contracts → Version & Publish → Notify consumers
- Outputs: published packages list

### Compass Workflows

#### `update-shared-packages.yml`
- Triggered by: `update-shared-packages` repository dispatch event from shared-packages
- Or: Manual `workflow_dispatch`
- Steps: Install → Update packages → Validate → Create PR

## Best Practices

1. **Always run `yarn changeset`** before creating a PR to shared-packages
2. **Use semantic versioning**:
   - New component = minor
   - Bug fix = patch
   - Breaking changes = major
3. **Include meaningful changeset summaries** for changelog clarity
4. **Review auto-generated PRs** in consumers before merging
5. **Keep `main` branch protected** - all changes go through PRs
6. **Use conventional commits** for clear PR history

## Adding New Consumer Apps

To add a new app to the auto-update system:

1. Create the consuming app
2. Add `.npmrc` with GitHub Packages registry
3. In shared-packages `publish.yml`, add the repo to the matrix:
   ```yaml
   matrix:
     repo: [compass, new-app]
   ```
4. Ensure the new app has `update-shared-packages.yml` workflow
5. Enable repository dispatch on the new app (default in GitHub)

## Version History

When checking which versions are published:

```bash
# From shared-packages
npm view @caffeinebounce/ui versions

# Or directly
npm view @caffeinebounce/ui
```

Check **GitHub Packages** in the browser:
- Navigate to https://github.com/caffeinebounce/shared-packages/packages/
- View each package's version history and changelog
