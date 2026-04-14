#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT_DIR/ci/lib.sh"

local_ci_init "${1:?lane required}" "${2:?artifacts dir required}"

set +e
local_ci_run_publish_check_step
set -e

local_ci_finalize
