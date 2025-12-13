#!/usr/bin/env bash
# Sync an example env file to a local env file by adding any missing keys.
# Usage:
#   ./scripts/sync-env.sh [example_path] [local_path]
# Defaults:
#   example_path = ./.env.example
#   local_path   = ./.env.local

set -euo pipefail

EXAMPLE_PATH="${1:-$(pwd)/.env.example}"
LOCAL_PATH="${2:-$(pwd)/.env.local}"

if [ ! -f "$EXAMPLE_PATH" ]; then
  echo "⚠️  No .env.example found at $EXAMPLE_PATH"
  exit 0
fi

# Create .env.local if it doesn't exist
if [ ! -f "$LOCAL_PATH" ]; then
  echo "📝 Creating $LOCAL_PATH from $EXAMPLE_PATH"
  cp "$EXAMPLE_PATH" "$LOCAL_PATH"
  echo "✅ Created $LOCAL_PATH - please update with your actual values"
  exit 0
fi

# Read keys from env file (ignore comments and empty lines)
get_keys() {
  grep -v '^#' "$1" 2>/dev/null | grep -v '^$' | cut -d'=' -f1 | sort -u
}

EXAMPLE_KEYS=$(get_keys "$EXAMPLE_PATH")
LOCAL_KEYS=$(get_keys "$LOCAL_PATH")

MISSING_KEYS=""
ADDED_COUNT=0

for key in $EXAMPLE_KEYS; do
  if ! echo "$LOCAL_KEYS" | grep -q "^${key}$"; then
    MISSING_KEYS="$MISSING_KEYS $key"
  fi
done

if [ -z "$MISSING_KEYS" ]; then
  echo "✅ $LOCAL_PATH already contains all keys from $EXAMPLE_PATH"
  exit 0
fi

echo "🔄 Syncing missing environment variables to $LOCAL_PATH..."

# Append missing keys with placeholder values
for key in $MISSING_KEYS; do
  echo "${key}=" >> "$LOCAL_PATH"
  ADDED_COUNT=$((ADDED_COUNT + 1))
  echo "  + Added $key"
done

echo "\n✅ Added $ADDED_COUNT missing keys to $LOCAL_PATH"
