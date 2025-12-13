#!/usr/bin/env bash
# Update .yarnrc.local.yml with token from an env file (default ./.env.local).
# Usage:
#   ./scripts/update-yarnrc-local.sh [env_path]

set -euo pipefail

ROOT_DIR="$(pwd)"
ENV_FILE="${1:-$ROOT_DIR/.env.local}"
YARNRC_LOCAL="$ROOT_DIR/.yarnrc.local.yml"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found"
  exit 1
fi

TOKEN=$(grep "^GITHUB_TOKEN=" "$ENV_FILE" | cut -d= -f2-)

if [ -z "$TOKEN" ]; then
  echo "Error: GITHUB_TOKEN not found in $ENV_FILE"
  exit 1
fi

cat > "$YARNRC_LOCAL" << EOF
# Local Yarn config - loaded before .yarnrc.yml
# Auto-generated from $ENV_FILE on $(date)
# This file is gitignored - do not commit.

npmScopes:
  caffeinebounce:
    npmAuthToken: "$TOKEN"
EOF

echo "✓ Updated $YARNRC_LOCAL with token from $ENV_FILE"
