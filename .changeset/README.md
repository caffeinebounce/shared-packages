# Changesets

This folder is used by [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## Adding a changeset

When you make a change to a package, run:

```bash
yarn changeset
```

This will prompt you to:
1. Select which packages have changed
2. Choose the semver bump type (patch, minor, major)
3. Write a summary of the changes

The changeset file will be committed with your PR.

## How it works

1. PRs add changeset files describing changes
2. On merge to main, the publish workflow runs
3. Changesets creates a "Release" PR that bumps versions
4. When the Release PR is merged, packages are published
