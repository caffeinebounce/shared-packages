#!/usr/bin/env bash
# Verify GitHub repository settings that matter before and after public launch.

set -euo pipefail

REPO="${1:-caffeinebounce/shared-packages}"
EXPECTED_DESCRIPTION="MIT-licensed shared packages for @caffeinebounce applications"
CURRENT_BRANCH="$(git branch --show-current 2>/dev/null || true)"
ALLOWED_EXTRA_REMOTE_BRANCHES="${ALLOWED_EXTRA_REMOTE_BRANCHES:-}"

if [[ -z "$ALLOWED_EXTRA_REMOTE_BRANCHES" && -n "$CURRENT_BRANCH" && "$CURRENT_BRANCH" != "main" ]]; then
  ALLOWED_EXTRA_REMOTE_BRANCHES="$CURRENT_BRANCH"
fi

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

assert_eq() {
  local label="$1"
  local actual="$2"
  local expected="$3"

  if [[ "$actual" != "$expected" ]]; then
    echo "FAIL $label: expected '$expected', got '$actual'" >&2
    exit 1
  fi

  echo "PASS $label: $actual"
}

require gh
require jq

repo_json="$(gh repo view "$REPO" --json \
  description,visibility,isPrivate,hasIssuesEnabled,hasWikiEnabled,hasProjectsEnabled,hasDiscussionsEnabled,defaultBranchRef)"
rest_json="$(gh api "repos/$REPO" --jq '{allow_forking,allow_update_branch,has_issues,has_projects,has_wiki,delete_branch_on_merge,allow_auto_merge}')"
workflow_json="$(gh api "repos/$REPO/actions/permissions/workflow" --jq '{default_workflow_permissions,can_approve_pull_request_reviews}')"
dependabot_open="$(gh api "repos/$REPO/dependabot/alerts?state=open&per_page=100" --jq 'length')"
security_json="$(gh api "repos/$REPO" --jq '.security_and_analysis // {}')"
automated_security_fixes="$(gh api "repos/$REPO/automated-security-fixes" --jq '.enabled')"
remote_branches="$(gh api "repos/$REPO/git/matching-refs/heads" --paginate --jq '.[].ref' | sed 's#refs/heads/##' | sort | paste -sd ',' -)"
consumer_repo="$(gh variable list --repo "$REPO" | awk '$1 == "SHARED_PACKAGES_CONSUMER_REPOSITORY" { print $2 }')"
is_private="$(jq -r '.isPrivate' <<<"$repo_json")"
visibility="$(jq -r '.visibility' <<<"$repo_json")"

case "$visibility:$is_private" in
  PRIVATE:true)
    echo "PASS visibility phase: private pre-public"
    ;;
  PUBLIC:false)
    echo "PASS visibility phase: public"
    ;;
  *)
    echo "FAIL visibility phase: unexpected visibility=$visibility isPrivate=$is_private" >&2
    exit 1
    ;;
esac

assert_eq "default branch" "$(jq -r '.defaultBranchRef.name' <<<"$repo_json")" "main"
assert_eq "description" "$(jq -r '.description' <<<"$repo_json")" "$EXPECTED_DESCRIPTION"
assert_eq "issues enabled" "$(jq -r '.hasIssuesEnabled' <<<"$repo_json")" "true"
assert_eq "wiki disabled" "$(jq -r '.hasWikiEnabled' <<<"$repo_json")" "false"
assert_eq "projects disabled" "$(jq -r '.hasProjectsEnabled' <<<"$repo_json")" "false"
assert_eq "discussions disabled" "$(jq -r '.hasDiscussionsEnabled' <<<"$repo_json")" "false"

assert_eq "forking allowed" "$(jq -r '.allow_forking' <<<"$rest_json")" "true"
assert_eq "update branch allowed" "$(jq -r '.allow_update_branch' <<<"$rest_json")" "true"
assert_eq "delete branch on merge" "$(jq -r '.delete_branch_on_merge' <<<"$rest_json")" "true"
assert_eq "auto-merge enabled" "$(jq -r '.allow_auto_merge' <<<"$rest_json")" "true"

assert_eq "Actions default workflow permissions" "$(jq -r '.default_workflow_permissions' <<<"$workflow_json")" "read"
assert_eq "Actions cannot approve PRs" "$(jq -r '.can_approve_pull_request_reviews' <<<"$workflow_json")" "false"
assert_eq "open Dependabot alerts" "$dependabot_open" "0"
assert_eq "Dependabot security updates" "$automated_security_fixes" "true"

unexpected_remote_branches="$(
  printf '%s\n' "$remote_branches" | tr ',' '\n' | while IFS= read -r branch; do
    [[ -z "$branch" || "$branch" == "main" ]] && continue
    if printf '%s\n' "$ALLOWED_EXTRA_REMOTE_BRANCHES" | tr ',' '\n' | grep -Fxq "$branch"; then
      continue
    fi
    printf '%s\n' "$branch"
  done | paste -sd ',' -
)"

assert_eq "unexpected remote branches" "$unexpected_remote_branches" ""
echo "PASS remote branches: $remote_branches"
assert_eq "consumer repository variable" "$consumer_repo" "caffeinebounce/compass"

if [[ "$is_private" == "false" ]]; then
  secret_scanning_status="$(jq -r '.secret_scanning.status // "unknown"' <<<"$security_json")"
  secret_push_status="$(jq -r '.secret_scanning_push_protection.status // "unknown"' <<<"$security_json")"
  secret_scanning_open="$(gh api "repos/$REPO/secret-scanning/alerts?state=open&per_page=100" --jq 'length')"
  code_scanning_open="$(gh api "repos/$REPO/code-scanning/alerts?state=open&per_page=100" --jq 'length')"
  private_vulnerability_reporting="$(gh api "repos/$REPO/private-vulnerability-reporting" --jq '.enabled')"
  fork_approval="$(gh api "repos/$REPO/actions/permissions/fork-pr-contributor-approval" --jq '.approval_policy')"

  assert_eq "secret scanning" "$secret_scanning_status" "enabled"
  assert_eq "secret scanning push protection" "$secret_push_status" "enabled"
  assert_eq "open secret scanning alerts" "$secret_scanning_open" "0"
  assert_eq "open code scanning alerts" "$code_scanning_open" "0"
  assert_eq "private vulnerability reporting" "$private_vulnerability_reporting" "true"
  assert_eq "fork PR approval policy" "$fork_approval" "first_time_contributors"

  if gh api "repos/$REPO/code-scanning/default-setup" --jq '.state' >/tmp/shared-packages-codeql-state 2>/dev/null; then
    assert_eq "CodeQL default setup" "$(cat /tmp/shared-packages-codeql-state)" "not-configured"
  else
    gh api "repos/$REPO/code-scanning/alerts" --jq 'length' >/dev/null
    echo "PASS CodeQL/code scanning: custom workflow is enabled"
  fi
else
  echo "SKIP post-public security checks: repository is still private"
fi

echo
echo "GitHub public-readiness settings check passed for $REPO."
