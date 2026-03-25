# Changesets

This folder is used by [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## Adding a changeset

When you make a package change that affects published behavior, runtime code, exports, types, dependencies consumed by users, or build output, run:

```bash
yarn changeset
```

This will prompt you to:
1. Select which packages have changed
2. Choose the semver bump type (patch, minor, major)
3. Write a summary of the changes

The changeset file will be committed with your PR.

You can skip a changeset for docs-only, test-only, or internal tooling changes that do not affect the published package contents or consumer-facing behavior. When you do, call out the exception explicitly in the PR body.

## How it works

1. PRs add changeset files describing changes
2. On merge to main, the publish workflow runs
3. Changesets creates a "Release" PR that bumps versions
4. When the Release PR is merged, packages are published
