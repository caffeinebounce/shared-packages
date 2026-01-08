#!/usr/bin/env bash
#
# check-tailwind-v4-classes.sh
#
# Pre-commit hook to detect deprecated Tailwind v3 class names that have
# canonical replacements in Tailwind v4.
#
# See: https://tailwindcss.com/docs/upgrade-guide
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Deprecated patterns and their replacements
# These are the most common Tailwind v3 → v4 class name changes
PATTERNS=(
  "bg-gradient-to-"
  "flex-shrink-"
  "flex-shrink[^-]"
  "flex-grow-"
  "flex-grow[^-]"
  "overflow-ellipsis"
  "decoration-slice"
  "decoration-clone"
)

REPLACEMENTS=(
  "bg-linear-to-*"
  "shrink-*"
  "shrink"
  "grow-*"
  "grow"
  "text-ellipsis"
  "box-decoration-slice"
  "box-decoration-clone"
)

# Files to check (from args or staged files)
if [[ $# -gt 0 ]]; then
  FILES=("$@")
else
  # Get staged files
  FILES=()
  while IFS= read -r file; do
    FILES+=("$file")
  done < <(git diff --cached --name-only --diff-filter=ACM 2>/dev/null | grep -E '\.(tsx?|jsx?|css|html)$' || true)
fi

if [[ ${#FILES[@]} -eq 0 ]]; then
  exit 0
fi

FOUND_ISSUES=0
OUTPUT=""

for file in "${FILES[@]}"; do
  # Skip if file doesn't exist
  [[ -f "$file" ]] || continue

  FILE_OUTPUT=""

  for i in "${!PATTERNS[@]}"; do
    pattern="${PATTERNS[$i]}"
    replacement="${REPLACEMENTS[$i]}"

    # Search for the deprecated pattern
    matches=$(grep -nE "$pattern" "$file" 2>/dev/null || true)

    if [[ -n "$matches" ]]; then
      FOUND_ISSUES=1

      while IFS= read -r match; do
        line_num=$(echo "$match" | cut -d: -f1)
        line_content=$(echo "$match" | cut -d: -f2-)
        FILE_OUTPUT+="  Line $line_num: Use $replacement instead\n"
        FILE_OUTPUT+="    $line_content\n"
      done <<< "$matches"
    fi
  done

  if [[ -n "$FILE_OUTPUT" ]]; then
    OUTPUT+="${YELLOW}$file:${NC}\n$FILE_OUTPUT\n"
  fi
done

if [[ $FOUND_ISSUES -eq 1 ]]; then
  echo -e "${RED}╭──────────────────────────────────────────────────────────────────╮${NC}"
  echo -e "${RED}│  Deprecated Tailwind v3 classes detected!                        │${NC}"
  echo -e "${RED}│  Please use canonical Tailwind v4 class names.                   │${NC}"
  echo -e "${RED}╰──────────────────────────────────────────────────────────────────╯${NC}"
  echo ""
  echo -e "$OUTPUT"

  echo -e "${YELLOW}Common replacements:${NC}"
  echo "  bg-gradient-to-*  →  bg-linear-to-*"
  echo "  flex-shrink-*     →  shrink-*"
  echo "  flex-grow-*       →  grow-*"
  echo "  overflow-ellipsis →  text-ellipsis"
  echo ""
  echo -e "${YELLOW}Run this to auto-fix (use with caution):${NC}"
  echo "  sed -i '' 's/bg-gradient-to-/bg-linear-to-/g' <file>"
  echo ""

  exit 1
fi

echo -e "${GREEN}✓ No deprecated Tailwind v3 classes found${NC}"
exit 0
