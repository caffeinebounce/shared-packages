#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Checking agent docs sync"
bash scripts/check-agent-docs-sync.sh

echo "==> Checking changelog discipline"
corepack yarn check:changelog

echo "==> Building packages for contract, smoke, and size checks"
corepack yarn build

if [[ -n "${TURBO_SCM_BASE:-}" ]]; then
  echo "==> Validating affected package contracts"
  corepack yarn validate:packages:affected

  echo "==> Running affected consumer import smoke"
  CONSUMER_SMOKE_SCOPE=affected corepack yarn test:consumer-smoke
else
  echo "==> Validating package contracts"
  corepack yarn validate:packages

  echo "==> Running consumer import smoke"
  corepack yarn test:consumer-smoke
fi

echo "==> Checking UI entrypoint sizes"
corepack yarn size:ui

echo "==> Convention checks passed"
