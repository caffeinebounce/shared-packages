#!/usr/bin/env bash
# Run a command after loading variables from a .env.local file.
# Usage:
#   ./scripts/with-env.sh [path-to-env] -- <command> [args]
# Examples:
#   ./scripts/with-env.sh -- yarn dev
#   ./scripts/with-env.sh apps/web/.env.local -- yarn build

set -euo pipefail

ENV_FILE="$(pwd)/.env.local"
CMD_START=1

# If first arg is a file, use that as ENV_FILE
if [ $# -ge 1 ] && [ -f "$1" ]; then
  ENV_FILE="$1"
  CMD_START=2
fi

# Load env file if present
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

# Shift to command after '--' or after env file
# Allow both styles: with '--' or without
if [ $# -ge $CMD_START ] && [ "$1" = "--" ]; then
  shift 1
fi

exec "$@"
