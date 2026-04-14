#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: ci/run_lane.sh --lane NAME [--artifacts-dir DIR]

Available lanes:
  pr-fast
  branch-full
  heavy-full
  live-smoke
EOF
}

ARTIFACTS_DIR=""
LANE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --artifacts-dir)
      ARTIFACTS_DIR="$2"
      shift 2
      ;;
    --lane)
      LANE="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARTIFACTS_DIR="${ARTIFACTS_DIR:-$ROOT_DIR/.local-ci/latest}"

case "$LANE" in
  pr-fast)
    exec bash "$ROOT_DIR/ci/run_fast.sh" "$LANE" "$ARTIFACTS_DIR"
    ;;
  branch-full)
    exec bash "$ROOT_DIR/ci/run_full.sh" "$LANE" "$ARTIFACTS_DIR"
    ;;
  heavy-full)
    exec bash "$ROOT_DIR/ci/run_heavy.sh" "$LANE" "$ARTIFACTS_DIR"
    ;;
  live-smoke)
    exec bash "$ROOT_DIR/ci/run_live_smoke.sh" "$LANE" "$ARTIFACTS_DIR"
    ;;
  "")
    echo "Missing required --lane" >&2
    usage >&2
    exit 2
    ;;
  *)
    echo "Unknown lane: $LANE" >&2
    usage >&2
    exit 2
    ;;
esac
