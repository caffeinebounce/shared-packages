# Setup Guide: Pre-Commit Hooks & Auto-Publish System

This guide walks through setting up the pre-commit hooks and auto-publish system in both shared-packages and Compass.

## Prerequisites

- Node.js 20.9+
- Yarn 4.11.0
- Git 2.9+
- pip (Python package manager, for pre-commit framework)

## Shared Packages Setup

### 1. Install Pre-Commit Framework

Pre-commit is a framework for managing git hooks. Install it:

```bash
# Via pip (recommended)
pip install pre-commit

# Via Homebrew (macOS)
brew install pre-commit

# Verify installation
pre-commit --version
```

### 2. Install Secrets Baseline

The pre-commit hooks detect secrets using a baseline file. Create it if not present:

```bash
cd shared-packages

# Detect any secrets currently in the repo
detect-secrets scan --baseline .secrets.baseline

# Review and approve (or modify)
# This creates .secrets.baseline file
```

### 3. Setup Git Hooks

Run the setup script we created:

```bash
./scripts/setup-hooks.sh

# Or manually:
chmod +x ./scripts/git-hooks/pre-commit
pre-commit install
pre-commit install --hook-type commit-msg
```

### 4. Verify Setup

```bash
# Test the hooks with a dummy commit
pre-commit run --all-files

# This should run and display results for:
# - Trailing whitespace
# - File endings
# - JSON/YAML/TOML validation
# - Biome linting/formatting
# - TypeScript type checking
# - Secrets detection
# - Conventional commit format
```

### 5. Install Husky (Optional, for package.json integration)

Husky makes it easy to manage git hooks across team members:

```bash
# Husky is already in package.json devDependencies
yarn install

# Verify
npx husky install
```

### 6. Test Pre-Commit Hooks

```bash
# Try making a change and committing
echo "test" >> src/test.txt
git add src/test.txt

# Commit - this will trigger hooks
git commit -m "test: add test file"

# You should see:
# ✅ Trailing whitespace check passed
# ✅ Biome formatting applied
# ✅ TypeScript check passed
# ✅ Conventional commit format valid

# If Biome made changes, commit will be retried with fixes re-staged
```

---

## Compass Setup

### 1. Install Pre-Commit Framework

```bash
# Same as shared-packages
pip install pre-commit
```

Compass already has pre-commit configured via the existing setup.

### 2. Ensure GitHub Token is Available

The auto-publish system needs a GitHub token to:
- Trigger workflows
- Create pull requests

Set up your local environment:

```bash
# Add to .env or .bashrc/.zshrc
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"

# Get a token:
# 1. Go to GitHub → Settings → Developer settings → Personal access tokens
# 2. Generate new token with: repo, actions, pull-requests scopes
# 3. Copy and set GITHUB_TOKEN
```

For CI/CD, the token is automatically available as `secrets.GITHUB_TOKEN`.

### 3. Verify Update Workflow

The update workflow is already in place. Verify it:

```bash
# Check the workflow file
cat .github/workflows/update-shared-packages.yml

# Verify it has:
# - on: repository_dispatch
# - on: workflow_dispatch
# - Matrix for consuming repos (compass)
```

### 4. Test Manual Update

```bash
# Manually trigger the update workflow
gh workflow run update-shared-packages.yml

# Or specific packages
gh workflow run update-shared-packages.yml \
  -f packages="@caffeinebounce/ui @caffeinebounce/identity"

# Monitor the run
gh run watch <run-id>
```

---

## GitHub Configuration

### 1. Enable Repository Dispatch

Both repos need to allow repository dispatch events (default):

```bash
# Verify in Compass
gh repo view caffeinebounce/compass --json archivedAt

# If blocked, check Settings → Actions → General
```

### 2. Configure Workflow Permissions

shared-packages `publish.yml` needs write permissions:

**Settings → Actions → General → Workflow permissions**
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

### 3. Add Repository Secrets

Both repos need `GITHUB_TOKEN` (usually automatic), but verify:

**Settings → Secrets and variables → Actions**

Required secrets:
- `GITHUB_TOKEN` - Automatic (provided by GitHub)

Optional (for better logging):
- `TURBO_TOKEN` - For Turbo remote cache (if using)

---

## Testing the Full System

### Test shared-packages → Compass

```bash
# 1. In shared-packages, make a change
cd shared-packages
echo "// test" >> packages/ui/src/index.tsx
git checkout -b test/hook-system

# 2. Commit with changeset
git add packages/ui/src/index.tsx
git commit -m "test(ui): verify hook system"
# Hooks should run and lint/format

# 3. Create changeset
yarn changeset
# Select: ui = patch
# Enter summary: "Test commit for hook system verification"

# 4. Commit changeset
git add .changeset/*.md
git commit -m "chore: add changeset for test"

# 5. Push and create PR
git push origin test/hook-system
# Create PR on GitHub

# 6. Merge to main

# 7. In Compass, monitor the update
cd ../compass
gh run watch -i 30
# Should see: Update Shared Packages workflow trigger

# 8. Check PR in Compass
gh pr list -L 1
# Should see PR updating @caffeinebounce/ui
```

### Test Manual Update (without publish)

```bash
# In Compass
gh workflow run update-shared-packages.yml -f packages="@caffeinebounce/ui"

# Monitor
gh run list -w update-shared-packages.yml
gh run view <id> --log
```

---

## Troubleshooting Setup

### Pre-commit Framework Not Found

```bash
# Reinstall
pip uninstall pre-commit
pip install pre-commit

# Verify
pre-commit --version
```

### Hooks Not Running on Commit

```bash
# Check if installed
cat .git/hooks/pre-commit
# Should show path to pre-commit script

# Reinstall
pre-commit install --hook-type commit-msg
pre-commit install
```

### "No module named 'pre_commit'"

```bash
# Pre-commit may not be in Python path
# Solution: Use system install
# macOS:
brew install pre-commit

# Linux (apt):
sudo apt install pre-commit

# Then verify
pre-commit --version
```

### Type Check Hook Failing

If TypeScript checks fail:

```bash
# The hook runs: yarn turbo run build --dry-run -- --noEmit
# This is just a type check, not a full build

# Fix locally
yarn build

# Check for type errors
yarn test
```

### Biome Keep Failing After Auto-fix

```bash
# Manually run biome
yarn format

# Then commit
git add .
git commit -m "style: biome formatting"
```

### Conventional Commit Validation Failing

```bash
# Your commit message must start with:
# feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

# Correct format:
git commit -m "feat(ui): add Button component"
#             ^^^^  Type
#                   ^^^^^ Scope
#                         ^^^^^^^^^^^^^^^^^^ Description
```

### Secrets Detection False Positive

```bash
# If a file is flagged but isn't a secret
# Add to .secrets.baseline:

detect-secrets scan --update .secrets.baseline

# Review the changes
git diff .secrets.baseline

# Commit
git add .secrets.baseline
git commit -m "chore: update secrets baseline"
```

---

## Ongoing Maintenance

### Update Pre-commit Hooks

```bash
# Check for updated hook versions
pre-commit autoupdate

# Review changes
git diff .pre-commit-config.yaml

# Commit if satisfied
git add .pre-commit-config.yaml
git commit -m "chore: update pre-commit hooks"
```

### Clean Pre-commit Cache

```bash
# If hooks seem stale
pre-commit clean

# Run again
pre-commit run --all-files
```

### Bypass Hooks (Emergency Only)

```bash
# If hooks are blocking a critical commit
git commit --no-verify -m "emergency: critical fix"

# DO NOT use this regularly - defeats the purpose of hooks
# Create an issue instead and get hooks working properly
```

---

## Daily Workflow with Hooks

### Making a Change

```bash
# 1. Create feature branch
git checkout -b feat/new-component

# 2. Make changes
echo "new component code" >> packages/ui/src/components/NewComponent.tsx

# 3. Stage changes
git add packages/ui/src/components/NewComponent.tsx

# 4. Commit (hooks run automatically)
git commit -m "feat(ui): add NewComponent"

# Hooks will:
# ✅ Check trailing whitespace
# ✅ Format with Biome (auto-fixes if needed)
# ✅ Type-check with TypeScript
# ✅ Detect secrets
# ✅ Validate conventional commit format

# 5. If hooks auto-fixed files, create changeset
yarn changeset

# 6. Commit changeset
git add .changeset/*.md
git commit -m "chore: add changeset for new component"

# 7. Push and create PR
git push origin feat/new-component
```

### Reviewing a PR

Reviewers see:
- ✅ Pre-commit checks passed (in the commit)
- ✅ CI/CD workflow passed (in PR checks)
- ✅ Code review feedback (in comments)
- ✅ Changeset included (if applicable)

### After Merge

For shared-packages:
1. Changesets action creates version bump PR
2. Merge version bump PR
3. Publish workflow triggers
4. Compass gets update notification

For Compass:
1. Monitor for update PR
2. Review and merge
3. Changes live on main

---

## Quick Reference

| Task | Command |
|------|---------|
| Setup hooks | `./scripts/setup-hooks.sh` |
| Run hooks on all files | `pre-commit run --all-files` |
| Create changeset | `yarn changeset` |
| Auto-fix linting | `yarn format` |
| Type check | `yarn build` |
| Test locally | `yarn dev` |
| Update pre-commit | `pre-commit autoupdate` |
| Bypass hooks (emergency) | `git commit --no-verify` |
| Trigger update in consumer | `gh workflow run update-shared-packages.yml` |

---

## Support

For issues with the system:

1. **Check this guide** for common solutions
2. **Search GitHub Issues** in shared-packages and Compass
3. **Create an issue** with details:
   - What command you ran
   - Error message
   - Your OS and versions
