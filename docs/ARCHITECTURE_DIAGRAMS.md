# System Architecture & Workflow Diagrams

## Complete System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      SHARED-PACKAGES REPO                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Developer commits (shared-packages)                             │
│  │                                                                │
│  ├─→ Pre-commit hooks run:                                       │
│  │   ├─ File validation ✅                                        │
│  │   ├─ Biome lint/format (auto-fixes if needed) ✅             │
│  │   ├─ TypeScript type check ✅                                 │
│  │   ├─ Secrets detection ✅                                     │
│  │   └─ Conventional commit validation ✅                        │
│  │                                                                │
│  ├─→ If hooks auto-fixed files:                                  │
│  │   ├─ Re-stage files                                           │
│  │   └─ Retry (up to 2 times)                                    │
│  │                                                                │
│  └─→ Commit succeeds ✅                                          │
│                                                                   │
│  Developer creates changeset (CRITICAL!)                         │
│  │                                                                │
│  └─→ .changeset/*.md files created                               │
│      ├─ Lists affected packages                                  │
│      ├─ Specifies version bump (patch/minor/major)              │
│      └─ Describes changes for changelog                          │
│                                                                   │
│  Developer pushes → Creates PR → Merges to main                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CHANGESETS ACTION (GITHUB)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Triggered on: Push to main with .changeset/* files              │
│                                                                   │
│  Steps:                                                            │
│  1. Collect all changesets from .changeset/                       │
│  2. Determine version bumps:                                      │
│     ├─ If patch in any: next is patch                             │
│     ├─ If minor in any: next is minor                             │
│     └─ If major in any: next is major                             │
│  3. Update package.json with new versions                         │
│  4. Generate CHANGELOG.md entries                                 │
│  5. Remove .changeset/*.md files                                  │
│  6. Create PR titled "chore: release packages"                    │
│  7. Await manual merge                                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    (maintainer merges)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               PUBLISH WORKFLOW (publish.yml)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Triggered on: Push to main with package changes                 │
│                                                                   │
│  Steps:                                                            │
│  1. Checkout latest main                                          │
│  2. Install dependencies                                          │
│  3. Run: yarn build (compile TypeScript)                          │
│  4. Run: yarn lint (validate code quality)                        │
│  5. Run: yarn release (publish to GitHub Packages)                │
│     ├─ Builds dist/ for each package                              │
│     ├─ Publishes to npm.pkg.github.com                            │
│     ├─ Creates git tags (v0.1.2, etc.)                            │
│     └─ Outputs: published_packages list                           │
│  6. Notify consumer repos (Compass, etc.):                        │
│     └─→ Repository dispatch: "update-shared-packages"             │
│                                                                   │
│  Result: ✅ Packages live on GitHub Packages                     │
│          ✅ Tags in git history                                   │
│          ✅ Consumer repos notified                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              COMPASS REPO (CONSUMER APP)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Receives: repository_dispatch event                             │
│            ├─ event_type: "update-shared-packages"                │
│            └─ payload: list of published packages                 │
│                                                                   │
│  Triggered: update-shared-packages.yml workflow                  │
│                                                                   │
│  Steps:                                                            │
│  1. Checkout latest main                                          │
│  2. Install dependencies                                          │
│  3. Update package.json for each published package:               │
│     └─ Upgrade to @latest version                                 │
│  4. Run: yarn install (lock new versions)                         │
│  5. Validate:                                                     │
│     ├─ yarn lint                                                  │
│     ├─ yarn build                                                 │
│     └─ yarn test                                                  │
│  6. Create PR with:                                               │
│     ├─ Updated package.json entries                               │
│     ├─ Updated yarn.lock                                          │
│     ├─ PR title: "chore: update @caffeinebounce packages"        │
│     ├─ PR body: List of updated packages + validation results    │
│     ├─ Labels: [dependencies, automated]                          │
│     └─ Delete branch after merge                                  │
│                                                                   │
│  Awaits: Manual review & merge                                   │
│                                                                   │
│  Result: ✅ Compass has latest shared packages                   │
│          ✅ All validations passed                                │
│          ✅ Clear PR for audit trail                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    (developer reviews & merges)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COMPASS MAIN UPDATED                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ✅ Latest @caffeinebounce packages installed                    │
│  ✅ All dependencies compatible                                   │
│  ✅ No type errors                                                │
│  ✅ Lint & format passing                                         │
│  ✅ Full audit trail (PR → commit → tag)                         │
│                                                                   │
│  Ready to deploy to production                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Pre-Commit Hook Flow

```
Developer commits
│
├─→ shared-packages/.pre-commit-config.yaml
│   └─→ Defines which hooks to run
│
├─→ scripts/git-hooks/pre-commit (main script)
│   │
│   └─→ Retry loop (up to 2 retries):
│       │
│       ├─→ Get list of staged files
│       │
│       ├─→ Run pre-commit hooks:
│       │   ├─→ File validation
│       │   │   ├─ Trailing whitespace
│       │   │   ├─ File endings
│       │   │   └─ JSON/YAML/TOML validity
│       │   │
│       │   ├─→ Biome linting
│       │   │   ├─ ESLint equivalent (auto-fixes)
│       │   │   └─ Prettier equivalent (auto-formats)
│       │   │
│       │   ├─→ TypeScript checking
│       │   │   └─ Full type validation (no build)
│       │   │
│       │   ├─→ Secrets detection
│       │   │   └─ Prevents API keys/tokens
│       │   │
│       │   └─→ Conventional commits
│       │       └─ Validates message format
│       │
│       ├─→ Check for failures:
│       │   │
│       │   ├─→ If success: Exit 0 ✅
│       │   │
│       │   └─→ If failed:
│       │       ├─→ Check if files were modified (auto-fixed)
│       │       │   │
│       │       │   ├─→ If yes:
│       │       │   │   ├─ Re-stage modified files
│       │       │   │   ├─ Increment retry counter
│       │       │   │   └─ GOTO: Run pre-commit hooks
│       │       │   │
│       │       │   └─→ If no:
│       │       │       ├─ No auto-fixes possible
│       │       │       └─ Exit 1 ❌ (show errors)
│       │       │
│       │       └─→ If retries exhausted:
│       │           └─ Exit 1 ❌ (still failing)
│
└─→ Commit complete ✅ or Failed ❌

If commit failed:
┌─ Developer reviews errors
├─ Fixes code manually (or runs yarn format)
├─ Stages again
└─ Retries commit
```

## Version Bumping Strategy

```
Changesets Analysis:
│
├─→ Collect all .changeset/*.md files
│
├─→ Analyze version bumps:
│   ├─ patch = 0.0.X (bug fixes)
│   ├─ minor = 0.X.0 (new features)
│   └─ major = X.0.0 (breaking changes)
│
├─→ Determine final version:
│   │
│   ├─→ If ANY major: Bump major version
│   │   └─ Example: 0.1.3 → 1.0.0
│   │
│   ├─→ Else if ANY minor: Bump minor version
│   │   └─ Example: 0.1.3 → 0.2.0
│   │
│   └─→ Else: Bump patch version
│       └─ Example: 0.1.3 → 0.1.4
│
├─→ Update all package.json versions
│
├─→ Generate CHANGELOG.md
│
└─→ Create version bump PR + Merge
```

Example with multiple changesets:

```
Changesets collected:
├─ ui: minor     (new Button variant)
├─ email: patch  (fix template spacing)
└─ identity: patch (fix validation)

Decision tree:
├─ max(minor, patch, patch) = minor
├─ Therefore: All packages bump minor version

Results:
├─ @caffeinebounce/ui: 0.1.3 → 0.2.0
├─ @caffeinebounce/email: 0.1.0 → 0.1.1
└─ @caffeinebounce/identity: 0.1.1 → 0.1.2
```

## Publishing to GitHub Packages

```
Publish Workflow (yarn release)
│
├─→ Build phase
│   └─→ yarn build
│       └─→ Tsup compiles each package
│           ├─ TypeScript → JavaScript
│           ├─ Create dist/ folder
│           └─ Generate .d.ts type files
│
├─→ Publish phase
│   └─→ changeset publish
│       └─→ For each package:
│           ├─ Read package.json
│           ├─ Get name and version
│           ├─ Publish to npm.pkg.github.com
│           │  └─ Registry: npm.pkg.github.com
│           │  └─ Auth: GITHUB_TOKEN
│           ├─ Create git tag (e.g., @caffeinebounce/ui@0.2.0)
│           └─ Remove .changeset/*.md files
│
├─→ Notification phase
│   └─→ Repository dispatch to compass
│       ├─ Event: update-shared-packages
│       ├─ Payload: list of published packages
│       └─ Consumer repo receives notification
│
└─→ Complete ✅
```

## Manual vs Automated Updates

```
SCENARIO 1: Automatic Update (Default)
┌─────────────────────────────┐
│ Publish shared-packages     │
├─────────────────────────────┤
│ ✅ Compass notified         │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Update PR created auto      │
├─────────────────────────────┤
│ • Updated packages          │
│ • Lint ✅ Build ✅ Tests ✅  │
└─────────────────────────────┘
         │
    (review & merge)
         │
         ▼
┌─────────────────────────────┐
│ Compass has latest          │
└─────────────────────────────┘


SCENARIO 2: Manual Update (Compass side)
┌─────────────────────────────┐
│ Developer runs:             │
│ gh workflow run \           │
│   update-shared-packages.yml│
├─────────────────────────────┤
│ (same as scenario 1 result) │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Update PR created           │
├─────────────────────────────┤
│ • Updated packages          │
│ • Lint ✅ Build ✅ Tests ✅  │
└─────────────────────────────┘
         │
    (review & merge)
         │
         ▼
┌─────────────────────────────┐
│ Compass has latest          │
└─────────────────────────────┘


SCENARIO 3: Direct Dependency Update (Compass side)
┌─────────────────────────────┐
│ Developer runs:             │
│ yarn upgrade \              │
│   @caffeinebounce/ui@latest │
├─────────────────────────────┤
│ Updates package.json        │
│ Updates yarn.lock           │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Validate:                   │
│ • yarn lint                 │
│ • yarn build                │
│ • yarn test                 │
└─────────────────────────────┘
         │
    (works? commit & push)
         │
         ▼
┌─────────────────────────────┐
│ Compass has latest + tested │
└─────────────────────────────┘
```

## Timeline Example: Complete Release Cycle

```
Day 1 - Tuesday
├─ 10:00 - Developer creates feat/button-variants PR
├─ 10:15 - Commits code with pre-commit validation
├─ 10:20 - Runs: yarn changeset (creates .changeset/tall-kings-57.md)
├─ 10:25 - Commits changeset
├─ 10:30 - Pushes to PR
├─ 11:00 - Code review completed
└─ 11:15 - PR merged to main

     ▼ AUTOMATICALLY

├─ 11:20 - Changesets action detects .changeset/tall-kings-57.md
├─ 11:25 - Creates version bump PR:
│          "chore: release packages"
│          - @caffeinebounce/ui: 0.1.3 → 0.2.0
├─ 11:30 - Maintainer reviews version PR
└─ 11:35 - Version PR merged to main

     ▼ AUTOMATICALLY

├─ 11:40 - publish.yml workflow triggered
├─ 11:45 - yarn build (compile packages)
├─ 11:50 - yarn lint (validate quality)
├─ 11:55 - yarn release (publish to GitHub Packages)
│          ✅ @caffeinebounce/ui@0.2.0 published
├─ 12:00 - Repository dispatch sent to Compass
└─ 12:05 - Publish workflow complete ✅

     ▼ AUTOMATICALLY

├─ 12:10 - Compass update-shared-packages.yml triggered
├─ 12:15 - Updates package.json (@caffeinebounce/ui@0.2.0)
├─ 12:20 - Validates (lint/build/test)
├─ 12:25 - Creates PR in Compass:
│          "chore: update @caffeinebounce shared packages"
│          - @caffeinebounce/ui: 0.1.3 → 0.2.0
│          - Validation: ✅ Lint ✅ Build ✅
└─ 12:30 - Compass update PR ready

     ▼ MANUAL

Day 2 - Wednesday
├─ 09:00 - Compass developer reviews update PR
├─ 09:15 - Checks what changed in @caffeinebounce/ui
├─ 09:30 - Verifies no breaking changes
├─ 09:45 - Approves and merges update PR
└─ 10:00 - Compass main has latest @caffeinebounce/ui@0.2.0 ✅

Total time: ~24 hours
Automated: 21/24 hours
Manual: 3/24 hours (review time)
```

## Adding a New Consumer App

```
To add "new-project" to auto-update system:
│
├─→ In shared-packages/.github/workflows/publish.yml:
│   │
│   └─→ Update matrix:
│       FROM: repo: [compass]
│       TO:   repo: [compass, new-project]
│
├─→ In new-project create:
│   │
│   ├─→ .npmrc with:
│   │   @caffeinebounce:registry=https://npm.pkg.github.com
│   │   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
│   │
│   └─→ .github/workflows/update-shared-packages.yml
│       (copy from Compass, adjust if needed)
│
├─→ Verify GitHub Actions enabled in new-project
│
└─→ Test:
    ├─ Publish packages in shared-packages
    └─ Watch new-project get update PR ✅
```

---

All diagrams show the complete flow from local commit through production deployment.
