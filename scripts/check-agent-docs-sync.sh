#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! cmp -s AGENTS.md CLAUDE.md; then
  cat >&2 <<'EOF'
AGENTS.md and CLAUDE.md must stay in sync.

Update both files with identical content before committing.
EOF
  exit 1
fi

echo "Agent docs are in sync."
