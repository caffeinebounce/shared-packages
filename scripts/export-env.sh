#!/usr/bin/env bash
# Export variables from a .env.local file into the current shell when sourced.
# Usage:
#   source ./scripts/export-env.sh [path-to-env]
# Defaults to ./.env.local if no path provided.

set -euo pipefail

ENV_FILE="${1:-$(pwd)/.env.local}"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
  echo "Exported environment variables from $ENV_FILE"
else
  echo "No env file found at $ENV_FILE"
  echo "Tip: pass a path (e.g., apps/web/.env.local) or create .env.local at repo root."
fi
