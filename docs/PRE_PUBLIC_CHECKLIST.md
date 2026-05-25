# Pre-Public Readiness Checklist

This checklist tracks the work required before changing
`caffeinebounce/shared-packages` from private to public. It assumes the
repository may become publicly readable while packages remain restricted on
GitHub Packages unless a separate package-publishing decision is made.

## Decision Record

- [x] Decide repository visibility target: public GitHub repository.
- [x] Decide package visibility target: keep `@caffeinebounce/*` packages
  restricted on GitHub Packages for now.
- [x] Decide licensing posture: source-available, all rights reserved, with
  package manifests marked `UNLICENSED` until an open-source license is chosen.
- [x] Decide whether to keep consumer-specific business context public in docs:
  sanitize public docs and keep product-specific operational runbooks in
  consuming repositories.
- [x] Decide whether product-specific package APIs should be renamed before
  public launch. Current decision: retain existing `compass`/`zenbid` package
  surface to avoid a breaking change; treat broader generic renaming as a
  separate major-version project if needed.

## Secrets And History

- [x] Confirm current `HEAD` does not track `.env`.
- [x] Ignore local auth/tooling files: `.env`, `.yarnrc.local.yml`, `.codex/`,
  build outputs, and local caches.
- [x] Replace token-shaped placeholders in public examples and helper output
  with neutral placeholder text.
- [x] Remove tracked local auth config (`.yarnrc.local.yml`).
- [x] Add a gitleaks config for known placeholder false positives.
- [x] Remove any real local tokens found in ignored files. Current audit found
  a GitHub PAT in the ignored root `.env`; the file has been deleted from this
  worktree. Rotate the token if reuse outside this worktree is uncertain.
- [x] Run a fresh full-history secret scan:
  `gitleaks detect --source . --redact`.
- [x] Review stale remote branches and tags before making them public. The
  review is recorded in [PRE_PUBLIC_REMOTE_REVIEW.md](PRE_PUBLIC_REMOTE_REVIEW.md):
  all 781 fetched tags match the `@caffeinebounce/*` package-release naming
  convention, and an all-ref gitleaks scan found no leaks.
- [x] Delete or explicitly keep each non-main remote branch listed in
  [PRE_PUBLIC_REMOTE_REVIEW.md](PRE_PUBLIC_REMOTE_REVIEW.md) before changing
  repository visibility. Current stale branch set is empty; while the readiness
  PR is open, `codex/public-readiness` is the only expected non-main remote
  branch.
- [x] If a real historical secret is found, revoke it first, then decide whether
  to rewrite history. Current full-history gitleaks scan found no leaks.

## GitHub Security Settings

- [x] Confirm Dependabot has no open alerts through the GitHub API.
- [x] Enable Dependabot security updates.
- [x] Enable GitHub secret scanning for the repository.
- [x] Resolve post-public secret scanning alerts. Alert #1 was an old PR body
  token exposure in PR #216; the PR body was sanitized and the alert was
  resolved as revoked after `GH_PAT` rotation.
- [x] Add a public-only CodeQL workflow so code scanning starts after the
  visibility flip without breaking private CI.
- [x] Confirm CodeQL/code scanning is enabled after the visibility flip.
- [x] Keep CodeQL default setup disabled while the checked-in CodeQL workflow
  is active, so GitHub does not reject workflow SARIF as mixed default/advanced
  configuration.
- [x] Enable private vulnerability reporting after the visibility flip.
- [x] Confirm default-branch rulesets prevent deletion and force pushes.
- [x] Require `build` and `swift` status checks through the default-branch
  ruleset.
- [x] Audit workflow definitions for public fork pull requests. The
  `pull_request` workflows use only the restricted `GITHUB_TOKEN`, and the
  `pull_request_target` automerge workflow is limited to the same-repository
  `github-actions[bot]` Changesets release branch.
- [x] Confirm public fork pull request settings after the visibility flip.
- [x] Confirm Actions default workflow permissions are read-only.
- [x] Add CODEOWNERS for default ownership plus release, workflow, package
  manifest, script, security, and public-readiness files.
- [x] Update GitHub repository metadata and public support surface: generic
  source-available description, Issues enabled, Wiki/Projects/Discussions
  disabled, forking allowed, and update-branch enabled.
- [x] Review repository secrets. Current Actions secrets list contains only
  `GH_PAT`, last updated 2026-05-25.
- [x] Rotate `GH_PAT` before public launch if cross-repository dispatch should
  remain enabled. Prefer keeping it as a 90-day fine-grained token with access only to
  `caffeinebounce/shared-packages` and `caffeinebounce/compass`, and grant only
  repository `Contents: Read and write` plus `Pull requests: Read and write`.

## Workflows And Automation

- [x] Reduce CI permissions to read-only and remove lockfile auto-commit from
  normal CI.
- [x] Keep publish permissions scoped to the publish workflow only.
- [x] Narrow the Changesets automerge workflow to release PRs from the same
  repository bot branch.
- [x] Move consumer repository dispatch destination into the
  `SHARED_PACKAGES_CONSUMER_REPOSITORY` repository variable instead of
  hard-coding it in the public workflow.
- [x] Confirm `SHARED_PACKAGES_CONSUMER_REPOSITORY` is configured in GitHub
  repository variables after this PR lands.
- [x] Re-run local workflow-sensitive validation. A PR should still be opened
  so GitHub Actions can validate the changed workflow files on-platform.
- [x] Run `actionlint` against all workflow files.
- [ ] Confirm release PR automerge still works after permission changes.
- [x] Confirm package publish still writes only to GitHub Packages. Every
  package manifest uses `publishConfig.registry=https://npm.pkg.github.com`
  with `access=restricted`.
- [x] Move consumer-specific dispatch docs out of public-facing repository docs;
  keep the workflow generic here and consumer details in consumer repositories.

## Package Publishing Surface

- [x] Verify package manifests use explicit `files` allowlists.
- [x] Verify package manifests publish to GitHub Packages with
  `access: restricted`.
- [x] Add explicit `UNLICENSED` metadata to each publishable package.
- [x] Run `npm pack --dry-run` after build and confirm packages contain only
  built `dist` assets, package metadata, and expected CSS.
- [x] Disable package source maps so tarballs do not include embedded source
  copies through `sourcesContent`.
- [x] Add a changeset for the package tarball/metadata change so CI changelog
  discipline passes without relying on a PR-body exception.
- [x] Add package-level docs before inviting external consumers. Current
  `packages/*/README.md` files document package purpose, entrypoints,
  boundaries, focused commands, and gotchas.

## Documentation And Public Messaging

- [x] Add an explicit source-available rights notice.
- [x] Add this pre-public checklist.
- [x] Add [PRE_PUBLIC_LAUNCH_RUNBOOK.md](PRE_PUBLIC_LAUNCH_RUNBOOK.md) for the
  exact branch, token, visibility, and post-public verification steps.
- [x] Add `yarn verify:pre-public` as a repeatable launch verification command.
- [x] Add `yarn verify:github-public-readiness` as a repeatable GitHub settings
  verification command.
- [x] Update README language if the repo should read as public-facing rather
  than internal-portfolio-facing.
- [x] Fix or remove private-relative documentation links such as
  `../compass/docs/updating-shared-packages.md` before public launch.
- [x] Replace `.github/copilot-instructions.md` with generic contributor
  guidance and remove tracked `.claude/audit/*` local audit notes.
- [x] Add a concise public support/contact section if outside contributors are
  expected to open issues.
- [x] Add [CONTRIBUTING.md](../CONTRIBUTING.md) with source-available
  contribution boundaries, changeset expectations, and security-report routing.
- [x] Add public issue templates that route normal bugs into reproducible
  reports and direct suspected vulnerabilities to private security reporting.
- [x] Add a pull request template covering changesets, verification, secrets,
  and source-available public messaging.
- [x] Generalize local CI documentation so it no longer references a specific
  maintainer machine.

## Final Verification Gates

- [x] `corepack yarn install --immutable`
- [x] `corepack yarn lint`
- [x] `corepack yarn typecheck`
- [x] `corepack yarn test`
- [x] `corepack yarn build`
- [x] `corepack yarn validate:packages`
- [x] `corepack yarn test:consumer-smoke`
- [x] `corepack yarn size:ui`
- [x] `corepack yarn npm audit --recursive --json`
- [x] `gitleaks detect --source . --redact --no-git`
- [x] `gitleaks detect --source . --redact`
- [x] `gitleaks detect --source . --redact --log-opts='--all'`
- [x] `swift test`
- [x] `actionlint .github/workflows/*.yml`
- [x] Simulated `yarn check:changelog` against the full readiness diff and
  confirmed the changeset covers package-impacting files.
- [x] `yarn verify:pre-public`
- [x] `yarn verify:github-public-readiness`
- [x] GitHub API check: visibility is still private, Actions default workflow
  permissions are read-only, default branch ruleset is active, no open
  Dependabot alerts, repository metadata/support settings are public-ready,
  and `SHARED_PACKAGES_CONSUMER_REPOSITORY` is configured.
- [x] Post-public GitHub API check: code scanning and secret scanning are
  available/enabled after the visibility flip.

## Flip Procedure

1. Land the public-readiness PR.
2. Confirm the rotated repository `GH_PAT` remains short-lived and scoped only
   to the repository pair needed for release dispatch.
3. Confirm stale public-unwanted branches/tags remain pruned.
4. Configure `SHARED_PACKAGES_CONSUMER_REPOSITORY` if consumer dispatch should
   continue after the workflow change.
5. Run the final verification gates above from a fresh checkout.
6. Enable GitHub security settings that are available while private.
7. Change repository visibility to public.
8. Re-enable or confirm CodeQL and secret scanning after the visibility change.
9. Watch the first public CI, Dependabot, code scanning, and secret scanning
   results before announcing the repository.
