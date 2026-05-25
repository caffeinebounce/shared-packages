#!/usr/bin/env bash
set -euo pipefail

# purge-gh-token.sh — Template script to purge a GitHub PAT from git history
# IMPORTANT: Edit TOKEN_TO_REMOVE below and replace it with the actual leaked token value BEFORE running this script.

TOKEN_TO_REMOVE="${LEAKED_TOKEN:-}"  # Provide the leaked token via LEAKED_TOKEN env var
TARGET_REPO_URL="$(git remote get-url origin)"

if [[ -z "$TOKEN_TO_REMOVE" ]]; then
  echo "ERROR: LEAKED_TOKEN is not set. Export LEAKED_TOKEN or run with: LEAKED_TOKEN=replace_with_leaked_token ./scripts/purge-gh-token.sh"
  exit 1
fi

# Confirm
read -r -p "You are about to rewrite git history to remove occurrences of the token in all refs for $TARGET_REPO_URL. Proceed? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborting."
  exit 0
fi

# Ensure git-filter-repo is installed
if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "git-filter-repo isn't installed. Install it with 'brew install git-filter-repo' or follow install docs." >&2
  exit 1
fi

# Make a backup mirror clone (local)
BACKUP_DIR="repo-backup-$(date +%Y%m%d%H%M%S).git"

echo "Creating a mirrored backup in ${BACKUP_DIR}..."
git clone --mirror "$TARGET_REPO_URL" "$BACKUP_DIR"

# Replace token file contents (replacements.txt used by git-filter-repo)
REPLACEMENTS="replacements.txt"
cat > "$REPLACEMENTS" <<EOF
$TOKEN_TO_REMOVE==>GITHUB_TOKEN_REDACTED
EOF

# Run the rewrite in the mirror clone
pushd "$BACKUP_DIR" >/dev/null

# Run filter-repo
git filter-repo --replace-text ../$REPLACEMENTS

# Cleanup temporary replacements file
popd >/dev/null
rm -f "$REPLACEMENTS"

cat <<MSG
DONE. You have a cleaned mirrored repo at ${BACKUP_DIR}.
To finish, verify the history locally and then force-push the rewritten refs to origin (coordinated with the team):

cd ${BACKUP_DIR}
# (+ confirm remote is the right one)
# Push everything (force):
# git push --force --all origin
# git push --force --tags origin

After the push, notify your teammates. They must re-clone or reset their local branches.
MSG

exit 0
