#!/bin/bash
# =============================================================================
# Setup git hooks for shared-packages or consuming apps
# =============================================================================
#
# Usage:
#   ./scripts/setup-hooks.sh               # Basic setup for shared-packages
#   ./scripts/setup-hooks.sh --portal      # Setup with portal support (for apps)
#   ./scripts/setup-hooks.sh --help        # Show help
#
# =============================================================================

set -e

# Parse arguments
PORTAL_MODE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --portal|-p)
      PORTAL_MODE=true
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --portal, -p  Install portal-aware hooks (for consuming apps)"
      echo "  --help, -h    Show this help"
      echo ""
      exit 0
      ;;
    *)
      shift
      ;;
  esac
done

REPO_ROOT="$(git rev-parse --show-toplevel)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"

echo "Setting up git hooks..."

if [ ! -d "$HOOKS_DIR" ]; then
  echo "Git hooks directory not found: $HOOKS_DIR"
  exit 1
fi

# Make hook scripts executable
chmod +x "$SCRIPT_DIR/git-hooks/pre-commit"
if [[ -f "$SCRIPT_DIR/git-hooks/pre-commit.portal" ]]; then
  chmod +x "$SCRIPT_DIR/git-hooks/pre-commit.portal"
fi
if [[ -f "$SCRIPT_DIR/git-hooks/post-commit.portal" ]]; then
  chmod +x "$SCRIPT_DIR/git-hooks/post-commit.portal"
fi
if [[ -f "$SCRIPT_DIR/git-hooks/pre-push" ]]; then
  chmod +x "$SCRIPT_DIR/git-hooks/pre-push"
fi
if [[ -f "$SCRIPT_DIR/publish-local.sh" ]]; then
  chmod +x "$SCRIPT_DIR/publish-local.sh"
fi

# Copy appropriate hooks
if [[ "$PORTAL_MODE" == "true" ]]; then
  # Portal mode - for consuming apps
  cp "$SCRIPT_DIR/git-hooks/pre-commit.portal" "$HOOKS_DIR/pre-commit"
  chmod +x "$HOOKS_DIR/pre-commit"
  echo "+ Pre-commit hook installed (with portal support)"

  cp "$SCRIPT_DIR/git-hooks/post-commit.portal" "$HOOKS_DIR/post-commit"
  chmod +x "$HOOKS_DIR/post-commit"
  echo "+ Post-commit hook installed (portal restoration)"
else
  # Standard mode - for shared-packages itself
  cp "$SCRIPT_DIR/git-hooks/pre-commit" "$HOOKS_DIR/pre-commit"
  chmod +x "$HOOKS_DIR/pre-commit"
  echo "+ Pre-commit hook installed"
fi

# Copy pre-push if it exists
if [[ -f "$SCRIPT_DIR/git-hooks/pre-push" ]]; then
  cp "$SCRIPT_DIR/git-hooks/pre-push" "$HOOKS_DIR/pre-push"
  chmod +x "$HOOKS_DIR/pre-push"
  echo "+ Pre-push hook installed"
fi

# Install pre-commit framework if not already installed
if ! command -v pre-commit &> /dev/null; then
  echo "Installing pre-commit framework..."
  pip install pre-commit || pip3 install pre-commit
fi

# Install pre-commit hooks
echo "Installing pre-commit hooks..."
pre-commit install
pre-commit install --hook-type commit-msg

echo ""
echo "Git hooks setup complete!"
echo ""
echo "Hooks installed:"
if [[ "$PORTAL_MODE" == "true" ]]; then
  echo "  - pre-commit: Portal handling, lockfile check, linting, formatting, secrets detection"
  echo "  - post-commit: Portal resolution restoration"
else
  echo "  - pre-commit: Linting, formatting, type-checking, secrets detection, conventional commits"
  echo "  - pre-push: Prompts to publish packages before pushing to main"
fi
echo ""
echo "Next steps:"
echo "  - Make commits with conventional format: feat(ui): add component"
echo "  - Pre-commit hooks will auto-fix lint/format issues"
