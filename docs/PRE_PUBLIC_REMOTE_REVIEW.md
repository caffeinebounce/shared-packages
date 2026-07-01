# Pre-Public Remote Review

This note records the remote branch, tag, and repository secret review performed
before making `caffeinebounce/shared-packages` public.

## Branches

`main` is protected. The following non-main remote branches were present before
cleanup and were not merged into `origin/main`:

| Branch | Last Commit Date | Notes |
|--------|------------------|-------|
| `chore/release-0.41.5` | 2026-01-26 | Closed PR #170 |
| `codex/cleanup-unused-warnings-and-vitest-ignore` | 2026-03-12 | No matching PR found |
| `codex/no-widow-text` | 2026-05-14 | No matching PR found |
| `copilot/sub-pr-92` | 2026-01-14 | Closed PR #93 |
| `copilot/sub-pr-129` | 2026-01-20 | Closed PR #130 |
| `feat/media-clipping-card` | 2026-03-26 | No matching PR found |
| `feat/ui-association-picker` | 2026-03-09 | No matching PR found |
| `fix/auth-layout-gradient-scroll` | 2026-01-17 | Closed PR #110 |
| `fix/email-admin-stat-card-bugs-971` | 2026-02-09 | Closed PR #213 |
| `pr-236` | 2026-02-24 | No matching PR found |

All listed stale non-main remote branches were deleted on 2026-05-25. A
follow-up `git fetch --prune origin` plus GitHub refs check confirmed only
`main` remained before the readiness PR branch was pushed. While the readiness
PR is open, `codex/public-readiness` is expected to exist as the active review
branch; after merge and branch deletion, `main` should again be the only remote
branch.

## Tags

The repository currently has 781 tags, and all fetched tags match the
`@caffeinebounce/*` package-release naming convention. No anomalous non-package
tags were found.

## Secret Scan Coverage

`gitleaks detect --source . --redact --log-opts='--all'` scanned all fetched
refs and found no leaks.

## Repository Secrets

The repository currently has one Actions secret:

| Secret | Updated |
|--------|---------|
| `GH_PAT` | 2026-05-25 |

`GH_PAT` was rotated on 2026-05-25 for cross-repository dispatch after the
visibility change. Prefer keeping this as a short-lived, fine-grained token
scoped only to `caffeinebounce/shared-packages` and the configured consumer
repository.
