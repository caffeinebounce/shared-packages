#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT_DIR/ci/lib.sh"

local_ci_init "${1:?lane required}" "${2:?artifacts dir required}"

set +e
local_ci_run_format_check_step
rc=$?
if [[ $rc -eq 0 ]]; then local_ci_run_lint_step; rc=$?; fi
if [[ $rc -eq 0 ]]; then local_ci_run_validate_packages_step; rc=$?; fi
if [[ $rc -eq 0 ]]; then local_ci_run_typecheck_step; rc=$?; fi
if [[ $rc -eq 0 ]]; then local_ci_run_tests_step; rc=$?; fi
if [[ $rc -eq 0 ]]; then local_ci_run_build_step; rc=$?; fi
if [[ $rc -eq 0 ]]; then local_ci_run_coverage_step; rc=$?; fi
set -e

local_ci_finalize
