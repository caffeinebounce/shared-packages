#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ "${1:-}" == "--cached" ]]; then
  if ! git show :AGENTS.md >/dev/null 2>&1 || ! git show :CLAUDE.md >/dev/null 2>&1; then
    cat >&2 <<'EOF'
AGENTS.md and CLAUDE.md must both be staged.

Stage both files before committing agent instruction changes.
EOF
    exit 1
  fi

  if ! diff -q <(git show :AGENTS.md) <(git show :CLAUDE.md) >/dev/null; then
    cat >&2 <<'EOF'
Staged AGENTS.md and CLAUDE.md must stay in sync.

Stage matching versions of both files before committing.
EOF
    exit 1
  fi

  echo "Staged agent docs are in sync."
  exit 0
fi

if ! cmp -s AGENTS.md CLAUDE.md; then
  cat >&2 <<'EOF'
AGENTS.md and CLAUDE.md must stay in sync.

Update both files with identical content before committing.
EOF
  exit 1
fi

echo "Agent docs are in sync."
