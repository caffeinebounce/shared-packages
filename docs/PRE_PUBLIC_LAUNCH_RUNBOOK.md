# Pre-Public Launch Runbook

Use this runbook after the public-readiness PR lands and before announcing the
repository as public.

## 1. Branch And Token Decisions

Review [PRE_PUBLIC_REMOTE_REVIEW.md](PRE_PUBLIC_REMOTE_REVIEW.md), then confirm
only `main` remains as a remote branch after this readiness PR merges and its
branch is deleted:

```bash
git fetch --prune origin
gh api repos/caffeinebounce/shared-packages/git/matching-refs/heads \
  --paginate --jq '.[].ref' | sed 's#refs/heads/##' | sort
```

Delete any newly-created stale branch before the visibility flip:

```bash
git push origin --delete <branch-name>
```

Rotate `GH_PAT` if cross-repository dispatch should continue after the
visibility change. The publish workflow skips consumer dispatch when either
`GH_PAT` or `SHARED_PACKAGES_CONSUMER_REPOSITORY` is missing.

Best practice for a temporary token:

- Token type: fine-grained personal access token.
- Resource owner: `caffeinebounce`.
- Repository access: only `caffeinebounce/shared-packages` and the configured
  consumer repository, currently `caffeinebounce/compass`.
- Expiration: 90 days or less.
- Repository permissions: `Contents: Read and write` and `Pull requests: Read
  and write`; leave everything else unset unless GitHub requires it.
- Store the token only as the repository secret `GH_PAT`.

GitHub currently creates fine-grained personal access tokens through the web UI:
https://github.com/settings/personal-access-tokens/new

## 2. Fresh Checkout Verification

Run the final proof set from a clean checkout of the readiness branch or merged
`main`:

```bash
yarn verify:pre-public
```

The script runs install, lint, typecheck, tests, build, package contract
validation, npm audit, gitleaks, actionlint, Swift tests, and package dry-runs.

Manual package dry-run spot check:

```bash
for pkg in packages/*; do
  [ -f "$pkg/package.json" ] || continue
  (cd "$pkg" && npm pack --dry-run)
done
```

Expected result: package tarballs contain built `dist` assets, package metadata,
expected CSS where applicable, and no `.map` files.

## 3. GitHub Visibility Flip

After branch/token decisions and verification pass, change repository visibility
to public in GitHub settings.

Before flipping, refresh the current GitHub settings check:

```bash
yarn verify:github-public-readiness
```

Immediately confirm:

```bash
gh repo view caffeinebounce/shared-packages --json visibility,isPrivate
gh repo view caffeinebounce/shared-packages \
  --json description,hasIssuesEnabled,hasWikiEnabled,hasProjectsEnabled,hasDiscussionsEnabled,isBlankIssuesEnabled
gh api repos/caffeinebounce/shared-packages/actions/permissions/workflow \
  --jq '{default_workflow_permissions,can_approve_pull_request_reviews}'
gh api 'repos/caffeinebounce/shared-packages/dependabot/alerts?state=open&per_page=100' \
  --jq 'length'
```

Expected result: repository is public, description is generic/source-available,
Issues are enabled, Wiki/Projects/Discussions are disabled, blank issues are
disabled after the issue-template config lands on `main`, workflow permissions
are read-only, and there are no open Dependabot alerts.

## 4. Post-Public Security Features

Enable or confirm GitHub security features that are unavailable while the
repository is private:

```bash
gh api -X PATCH repos/caffeinebounce/shared-packages \
  -F 'security_and_analysis[secret_scanning][status]=enabled' \
  -F 'security_and_analysis[secret_scanning_push_protection][status]=enabled'
gh api -X PUT repos/caffeinebounce/shared-packages/private-vulnerability-reporting
gh api -X PATCH repos/caffeinebounce/shared-packages/code-scanning/default-setup \
  -f state=configured \
  -f query_suite=default
gh api -X PUT repos/caffeinebounce/shared-packages/actions/permissions/fork-pr-contributor-approval \
  -f approval_policy=first_time_contributors

gh api repos/caffeinebounce/shared-packages/secret-scanning/alerts --jq 'length'
gh api repos/caffeinebounce/shared-packages/code-scanning/alerts --jq 'length'
gh api repos/caffeinebounce/shared-packages/private-vulnerability-reporting --jq .enabled
gh api repos/caffeinebounce/shared-packages/actions/permissions/fork-pr-contributor-approval --jq .approval_policy
```

If these still report disabled, enable them in repository settings and rerun the
checks after the first CodeQL workflow completes.

GitHub references:

- Fork pull request workflows run without repository secrets other than the
  restricted `GITHUB_TOKEN`: https://docs.github.com/actions/reference/events-that-trigger-workflows
- Public fork workflow settings: https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository
- `pull_request_target` security guidance: https://docs.github.com/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions

## 5. First Public Runs

Watch the first public CI, CodeQL, Dependabot, and release workflows before
announcing the repository:

```bash
gh run list --repo caffeinebounce/shared-packages --limit 20
gh run watch --repo caffeinebounce/shared-packages <run-id>
```

For the next Changesets release PR, confirm the automerge workflow still:

1. runs only for `github-actions[bot]`
2. requires `changeset-release/main`
3. validates the release PR
4. merges only after validation passes
