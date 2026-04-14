#!/usr/bin/env bash
set -euo pipefail

LOCAL_CI_LANE=""
LOCAL_CI_ARTIFACTS_DIR=""
LOCAL_CI_ROOT_DIR=""
LOCAL_CI_LOG_DIR=""
LOCAL_CI_RESULT_JSON=""
LOCAL_CI_SUMMARY_TXT=""
LOCAL_CI_STATUS="success"
LOCAL_CI_FAILED_STEP=""
LOCAL_CI_START_TS=""
LOCAL_CI_GIT_SHA=""
LOCAL_CI_COVERAGE_DIR=""
LOCAL_CI_NODE_AUTH_TOKEN=""
LOCAL_CI_YARN_VERSION="4.12.0"

local_ci_load_env() {
  local env_file="$LOCAL_CI_ROOT_DIR/.local-ci/local-ci.env"
  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi

  LOCAL_CI_NODE_AUTH_TOKEN="${NODE_AUTH_TOKEN:-${GITHUB_TOKEN:-${LOCAL_CI_GITHUB_TOKEN:-local-ci-placeholder}}}"
}

local_ci_init() {
  LOCAL_CI_LANE="${1:?lane required}"
  LOCAL_CI_ARTIFACTS_DIR="${2:?artifacts dir required}"
  LOCAL_CI_ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  LOCAL_CI_LOG_DIR="$LOCAL_CI_ARTIFACTS_DIR/logs"
  LOCAL_CI_RESULT_JSON="$LOCAL_CI_ARTIFACTS_DIR/result.json"
  LOCAL_CI_SUMMARY_TXT="$LOCAL_CI_ARTIFACTS_DIR/summary.txt"
  LOCAL_CI_COVERAGE_DIR="$LOCAL_CI_ARTIFACTS_DIR/coverage"
  mkdir -p "$LOCAL_CI_LOG_DIR" "$LOCAL_CI_COVERAGE_DIR"
  rm -f "$LOCAL_CI_SUMMARY_TXT"
  LOCAL_CI_START_TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  LOCAL_CI_GIT_SHA="$(git -C "$LOCAL_CI_ROOT_DIR" rev-parse HEAD)"
  local_ci_load_env
  local_ci_prepare_node
}

local_ci_prepare_node() {
  corepack enable >/dev/null 2>&1 || true
  corepack prepare "yarn@${LOCAL_CI_YARN_VERSION}" --activate >/dev/null 2>&1 || true

  export GITHUB_TOKEN="${LOCAL_CI_NODE_AUTH_TOKEN:-}"
  export NODE_AUTH_TOKEN="${LOCAL_CI_NODE_AUTH_TOKEN:-}"

  if [[ -n "$LOCAL_CI_NODE_AUTH_TOKEN" ]]; then
    cat > "$LOCAL_CI_ROOT_DIR/.yarnrc.local.yml" <<EOF
npmScopes:
  caffeinebounce:
    npmAlwaysAuth: true
    npmRegistryServer: "https://npm.pkg.github.com"
    npmAuthToken: "$LOCAL_CI_NODE_AUTH_TOKEN"
EOF
  fi

  if [[ -n "$LOCAL_CI_NODE_AUTH_TOKEN" || ! -d "$LOCAL_CI_ROOT_DIR/node_modules" || ! -f "$LOCAL_CI_ROOT_DIR/.yarn/install-state.gz" ]]; then
    (cd "$LOCAL_CI_ROOT_DIR" && yarn install --immutable)
  fi
}

local_ci_run_step() {
  local step_name="$1"
  shift
  local log_file="$LOCAL_CI_LOG_DIR/${step_name}.log"
  echo "==> $step_name" | tee "$log_file"
  if "$@" >>"$log_file" 2>&1; then
    echo "PASS $step_name" | tee -a "$LOCAL_CI_SUMMARY_TXT"
  else
    echo "FAIL $step_name (see $log_file)" | tee -a "$LOCAL_CI_SUMMARY_TXT"
    LOCAL_CI_STATUS="failure"
    LOCAL_CI_FAILED_STEP="$step_name"
    return 1
  fi
}

local_ci_run_format_check_step() {
  local_ci_run_step format-check yarn --cwd "$LOCAL_CI_ROOT_DIR" format:check
}

local_ci_run_lint_step() {
  local_ci_run_step lint yarn --cwd "$LOCAL_CI_ROOT_DIR" lint
}

local_ci_run_validate_packages_step() {
  local_ci_run_step validate-packages yarn --cwd "$LOCAL_CI_ROOT_DIR" validate:packages
}

local_ci_run_typecheck_step() {
  local_ci_run_step typecheck yarn --cwd "$LOCAL_CI_ROOT_DIR" typecheck
}

local_ci_run_tests_step() {
  local_ci_run_step tests yarn --cwd "$LOCAL_CI_ROOT_DIR" test
}

local_ci_run_build_step() {
  local_ci_run_step build yarn --cwd "$LOCAL_CI_ROOT_DIR" build
}

local_ci_run_coverage_step() {
  local step_name="coverage"
  local log_file="$LOCAL_CI_LOG_DIR/${step_name}.log"

  echo "==> $step_name" | tee "$log_file"
  if (
    cd "$LOCAL_CI_ROOT_DIR"
    yarn workspaces foreach -A -t --if-present run test:coverage
  ) >>"$log_file" 2>&1; then
    echo "PASS $step_name" | tee -a "$LOCAL_CI_SUMMARY_TXT"
  else
    echo "FAIL $step_name (see $log_file)" | tee -a "$LOCAL_CI_SUMMARY_TXT"
    LOCAL_CI_STATUS="failure"
    LOCAL_CI_FAILED_STEP="$step_name"
    return 1
  fi
}

local_ci_run_publish_check_step() {
  local_ci_run_step publish-check yarn --cwd "$LOCAL_CI_ROOT_DIR" publish:check
}

local_ci_finalize() {
  local end_ts
  end_ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  cat >"$LOCAL_CI_RESULT_JSON" <<EOF
{
  "lane": "$LOCAL_CI_LANE",
  "status": "$LOCAL_CI_STATUS",
  "git_sha": "$LOCAL_CI_GIT_SHA",
  "started_at": "$LOCAL_CI_START_TS",
  "finished_at": "$end_ts",
  "failed_step": "$LOCAL_CI_FAILED_STEP",
  "summary_path": "$LOCAL_CI_SUMMARY_TXT",
  "logs_dir": "$LOCAL_CI_LOG_DIR",
  "coverage_dir": "$LOCAL_CI_COVERAGE_DIR"
}
EOF

  if [[ "$LOCAL_CI_STATUS" == "success" ]]; then
    echo "local-ci $LOCAL_CI_LANE passed" | tee -a "$LOCAL_CI_SUMMARY_TXT"
    return 0
  fi

  echo "local-ci $LOCAL_CI_LANE failed" | tee -a "$LOCAL_CI_SUMMARY_TXT"
  return 1
}
