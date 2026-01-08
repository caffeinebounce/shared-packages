#!/bin/bash
# Setup git hooks for shared-packages development
# Run with: ./scripts/setup-hooks.sh

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"

echo "🔧 Setting up git hooks for shared-packages..."

# Make hook scripts executable
chmod +x "$REPO_ROOT/scripts/git-hooks/pre-commit"
chmod +x "$REPO_ROOT/scripts/git-hooks/pre-push"
chmod +x "$REPO_ROOT/scripts/publish-local.sh"

# Copy pre-commit hook
if [ -d "$HOOKS_DIR" ]; then
    cp "$REPO_ROOT/scripts/git-hooks/pre-commit" "$HOOKS_DIR/pre-commit"
    chmod +x "$HOOKS_DIR/pre-commit"
    echo "✅ Pre-commit hook installed"

    cp "$REPO_ROOT/scripts/git-hooks/pre-push" "$HOOKS_DIR/pre-push"
    chmod +x "$HOOKS_DIR/pre-push"
    echo "✅ Pre-push hook installed"
else
    echo "❌ Git hooks directory not found: $HOOKS_DIR"
    exit 1
fi

# Install pre-commit framework if not already installed
if ! command -v pre-commit &> /dev/null; then
    echo "📦 Installing pre-commit framework..."
    pip install pre-commit
fi

# Install pre-commit hooks
echo "📦 Installing pre-commit hooks..."
pre-commit install
pre-commit install --hook-type commit-msg

echo ""
echo "✅ Git hooks setup complete!"
echo ""
echo "Hooks installed:"
echo "  • pre-commit: Linting, formatting, type-checking, secrets detection, conventional commits"
echo "  • pre-push: Prompts to publish packages before pushing to main"
echo ""
echo "Publishing workflow:"
echo "  1. Make changes and commit locally"
echo "  2. When pushing to main, you'll be prompted to publish"
echo "  3. Or run manually: ./scripts/publish-local.sh"
echo ""
echo "Next steps:"
echo "  • Make commits with conventional format: feat(ui): add component"
echo "  • Pre-commit hooks will auto-fix lint/format issues"
