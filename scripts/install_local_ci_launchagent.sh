#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLIST_SRC="$ROOT_DIR/scripts/com.shared-packages.local-ci.plist.template"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
PLIST_DEST="$LAUNCH_AGENTS_DIR/com.caffeinebounce.shared-packages.local-ci.plist"
STATE_DIR_DEFAULT="$ROOT_DIR/.local-ci"
LOG_DIR_DEFAULT="$STATE_DIR_DEFAULT/launchd"
ENV_FILE_DEFAULT="$ROOT_DIR/.local-ci/local-ci.env"

usage() {
  cat <<EOF
Usage: scripts/install_local_ci_launchagent.sh [--env-file PATH] [--state-dir PATH] [--log-dir PATH]

Installs/updates a LaunchAgent that runs scripts/local_ci_runner.py.
EOF
}

ENV_FILE="$ENV_FILE_DEFAULT"
STATE_DIR="$STATE_DIR_DEFAULT"
LOG_DIR="$LOG_DIR_DEFAULT"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    --state-dir)
      STATE_DIR="$2"
      shift 2
      ;;
    --log-dir)
      LOG_DIR="$2"
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

mkdir -p "$LAUNCH_AGENTS_DIR" "$STATE_DIR" "$LOG_DIR"
if [[ ! -f "$ENV_FILE" ]]; then
  cat >&2 <<EOF
Missing env file: $ENV_FILE
Create it first; see docs/LOCAL-CI.md for required variables.
EOF
  exit 1
fi

PLIST_SRC="$PLIST_SRC" \
ROOT_DIR="$ROOT_DIR" \
ENV_FILE="$ENV_FILE" \
STATE_DIR="$STATE_DIR" \
LOG_DIR="$LOG_DIR" \
PLIST_DEST="$PLIST_DEST" \
python3 - <<'PY'
import os
from pathlib import Path

src = Path(os.environ["PLIST_SRC"]).read_text()
replacements = {
    '__REPO_DIR__': os.environ["ROOT_DIR"],
    '__ENV_FILE__': os.environ["ENV_FILE"],
    '__STATE_DIR__': os.environ["STATE_DIR"],
    '__LOG_DIR__': os.environ["LOG_DIR"],
}
for old, new in replacements.items():
    src = src.replace(old, new)
Path(os.environ["PLIST_DEST"]).write_text(src)
PY

launchctl unload "$PLIST_DEST" >/dev/null 2>&1 || true
launchctl load "$PLIST_DEST"
launchctl kickstart -k gui/"$(id -u)"/com.caffeinebounce.shared-packages.local-ci

echo "Installed LaunchAgent at $PLIST_DEST"
echo "Logs: $LOG_DIR"
