# Shared Scripts

This directory contains reusable DevOps scripts for shared-packages and
consuming apps.

## Directory Structure

```
scripts/
├── core/                        # Environment utilities
│   ├── sync-env.sh             # Sync .env.example → .env.local
│   ├── export-env.sh           # Export env vars from file
│   ├── with-env.sh             # Run command with env vars
│   └── update-yarnrc-local.sh  # Update .yarnrc.local.yml with auth token
├── git-hooks/                   # Git hook templates
│   ├── pre-commit              # Base hook (lockfile check + auto-restage)
│   ├── pre-commit.portal       # Enhanced with portal handling
│   ├── post-commit.portal      # Portal restoration after commit
│   └── pre-push                # Publishing reminder
├── portal/                      # Portal management
│   ├── toggle-portals.sh       # Toggle portal resolutions on/off
│   └── update-shared-packages.sh  # Update to latest published versions
├── templates/                   # Configuration templates
│   └── pre-commit-config.yaml  # Pre-commit hooks template
├── setup-devops.sh             # One-command setup for apps
├── setup-hooks.sh              # Git hooks setup
├── publish-local.sh            # Publish packages locally
└── README.md                   # This file
```

## For Consuming Apps

### Quick Setup

Run from your app's root directory:

```bash
# Basic setup
../shared-packages/scripts/setup-devops.sh

# With portal support (for local shared-packages development)
../shared-packages/scripts/setup-devops.sh --with-portals
```

### Configuration

Create `devops.config.json` in your app root:

`portalPackages` is the default portal-linked subset for app development. It is intentionally narrower than the full shared-packages workspace inventory.

```json
{
  "portalPackages": [
    "@caffeinebounce/ui",
    "@caffeinebounce/identity",
    "@caffeinebounce/email",
    "@caffeinebounce/ai-assistant",
    "@caffeinebounce/logger",
    "@caffeinebounce/shared-utils"
  ],
  "sharedPackagesPath": "../shared-packages/packages",
  "hasPortals": true
}
```

### Package.json Scripts

Add these scripts to your app's `package.json`:

```json
{
  "scripts": {
    "portals": "../shared-packages/scripts/portal/toggle-portals.sh",
    "portals:on": "../shared-packages/scripts/portal/toggle-portals.sh on",
    "portals:off": "../shared-packages/scripts/portal/toggle-portals.sh off",
    "update:shared": "../shared-packages/scripts/portal/update-shared-packages.sh"
  }
}
```

### Portal Workflow

Portals let you develop against local shared-packages code:

1. **Enable portals**: `yarn portals:on`
   - Adds `portal:` resolutions to package.json
   - Symlinks node_modules to local packages
   - Changes in shared-packages reflect immediately

2. **Make changes in shared-packages**
   - Edit code in `../shared-packages/packages/*`
   - Run `yarn build` in shared-packages
   - Changes appear in your app

3. **Commit** (happens automatically via pre-commit hook):
   - Portal resolutions are removed
   - Committed package.json uses published versions
   - CI sees clean package.json

4. **After commit** (happens automatically via post-commit hook):
   - Portal resolutions are restored
   - Local development continues seamlessly

### Manual Portal Commands

```bash
yarn portals              # Toggle current state
yarn portals:on           # Enable portals
yarn portals:off          # Disable portals
yarn portals status       # Show current state
yarn update:shared        # Update to latest published versions
```

## For Shared-Packages Development

### Setup

```bash
./scripts/setup-hooks.sh
```

This installs:
- Pre-commit hook with lockfile check and auto-restage
- Pre-push hook with publishing reminder
- Pre-commit framework hooks

### Publishing Workflow

1. Make changes and commit
2. Create a changeset for publishable package changes
3. Merge to `main` and let `publish.yml` handle release automation
4. Or run manually for local-only publishing: `./scripts/publish-local.sh`

## Git Hooks

### pre-commit (Base)

- Verifies yarn.lock consistency
- Runs pre-commit framework hooks
- Auto-restages files modified by hooks
- Retries up to 3 times for auto-fixes

### pre-commit.portal

Everything in base, plus:
- Checks for shared-packages updates
- Temporarily removes portal resolutions before commit
- Stages clean package.json for commit

### post-commit.portal

- Restores portal resolutions after commit
- Restores yarn.lock to portal state
- Development continues with local packages

### pre-push

- Checks if pushing to main
- Prompts to publish packages if not recently published
- Can skip with `git push --no-verify`

## Environment Scripts

### sync-env.sh

Syncs `.env.example` to `.env.local`, preserving existing values:

```bash
./scripts/sync-env.sh [example] [local]
# Default: apps/web/.env.example → apps/web/.env.local
```

### export-env.sh

Exports environment variables from a file:

```bash
source ./scripts/export-env.sh [path]
# Default: ./apps/web/.env.local
```

### with-env.sh

Runs a command with environment variables loaded:

```bash
./scripts/with-env.sh [path] -- <command>
./scripts/with-env.sh -- yarn dev
```

### update-yarnrc-local.sh

Updates `.yarnrc.local.yml` with GitHub auth token:

```bash
./scripts/update-yarnrc-local.sh [env-file]
```

## Pre-commit Framework

The `.pre-commit-config.yaml` template includes:

- **File hygiene**: trailing-whitespace, end-of-file-fixer, check-yaml/json/toml
- **Branch protection**: no-commit-to-branch (main, develop)
- **Biome**: lint and format
- **Yarn lockfile**: integrity check
- **TypeScript**: type check via turbo
- **Secrets**: detect-secrets
- **Conventional commits**: commit message validation

See `templates/pre-commit-config.yaml` for the full template.
