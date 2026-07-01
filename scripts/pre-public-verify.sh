#!/usr/bin/env bash
# Run the pre-public readiness proof set from the repository root.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

run() {
  echo
  echo "==> $*"
  "$@"
}

run corepack yarn install --immutable
run corepack yarn lint
run corepack yarn typecheck
run corepack yarn test
run corepack yarn build
run corepack yarn validate:packages
run corepack yarn test:consumer-smoke
run corepack yarn size:ui

echo
echo "==> corepack yarn npm audit --recursive --json"
audit_output="$(mktemp)"
corepack yarn npm audit --recursive --json >"$audit_output"
if [ -s "$audit_output" ]; then
  cat "$audit_output"
  rm -f "$audit_output"
  echo "npm audit produced output; review before public launch." >&2
  exit 1
fi
rm -f "$audit_output"

if command -v gitleaks >/dev/null 2>&1; then
  run gitleaks detect --source . --redact --no-git
  run gitleaks detect --source . --redact --log-opts=--all
else
  echo
  echo "==> gitleaks not found; install it and run the secret scans before launch." >&2
  exit 1
fi

if command -v actionlint >/dev/null 2>&1; then
  run actionlint .github/workflows/*.yml
elif command -v go >/dev/null 2>&1; then
  run go run github.com/rhysd/actionlint/cmd/actionlint@latest .github/workflows/*.yml
else
  echo
  echo "==> actionlint and go not found; install one and lint workflows before launch." >&2
  exit 1
fi

run swift test

echo
echo "==> npm pack dry-run"
for pkg in packages/*; do
  [ -f "$pkg/package.json" ] || continue
  (
    cd "$pkg"
    npm pack --dry-run --json | node -e '
      let input = "";
      process.stdin.on("data", (chunk) => {
        input += chunk;
      });
      process.stdin.on("end", () => {
        const pack = JSON.parse(input)[0];
        const maps = pack.files
          .filter((file) => file.path.endsWith(".map"))
          .map((file) => file.path);
        if (maps.length > 0) {
          console.error(`${pack.filename}: unexpected source maps: ${maps.join(", ")}`);
          process.exit(1);
        }
        console.log(`${pack.filename}: ${pack.files.length} files, no maps`);
      });
    '
  )
done

echo
echo "Pre-public verification passed."
