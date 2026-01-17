#!/bin/bash
# =============================================================================
# setup-devops.sh - One-command DevOps setup for apps consuming shared-packages
# =============================================================================
#
# Usage:
#   ../shared-packages/scripts/setup-devops.sh              # Basic setup
#   ../shared-packages/scripts/setup-devops.sh --with-portals  # Setup with portal support
#   ../shared-packages/scripts/setup-devops.sh --help          # Show help
#
# This script sets up:
# 1. Git hooks (pre-commit, post-commit for portal mode)
# 2. Pre-commit framework configuration
# 3. Optional devops.config.json if not present
#
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# Parse arguments
WITH_PORTALS=false
FORCE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --with-portals|-p)
      WITH_PORTALS=true
      shift
      ;;
    --force|-f)
      FORCE=true
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --with-portals, -p  Enable portal mode (local shared-packages development)"
      echo "  --force, -f         Overwrite existing files"
      echo "  --help, -h          Show this help message"
      echo ""
      echo "This script sets up DevOps infrastructure for apps that consume"
      echo "packages from shared-packages."
      echo ""
      exit 0
      ;;
    *)
      shift
      ;;
  esac
done

# Determine directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHARED_PACKAGES_ROOT="$(dirname "$SCRIPT_DIR")"
APP_ROOT="$(pwd)"

# Validate we're in an app directory
if [[ ! -f "$APP_ROOT/package.json" ]]; then
  echo -e "${RED}Error: No package.json found in current directory${NC}"
  echo "Please run this script from your app's root directory"
  exit 1
fi

echo ""
echo -e "${BOLD}${CYAN}========================================${NC}"
echo -e "${BOLD}${CYAN}  DevOps Setup - $(basename "$APP_ROOT")${NC}"
echo -e "${BOLD}${CYAN}========================================${NC}"
echo ""

# =============================================================================
# Helper Functions
# =============================================================================

print_status() {
  local status=$1
  local message=$2
  case $status in
    "info")    echo -e "${BLUE}i${NC}  $message" ;;
    "success") echo -e "${GREEN}+${NC}  $message" ;;
    "warning") echo -e "${YELLOW}!${NC}  $message" ;;
    "error")   echo -e "${RED}x${NC}  $message" ;;
    "step")    echo -e "${CYAN}>${NC}  $message" ;;
  esac
}

# =============================================================================
# Step 1: Create devops.config.json if needed
# =============================================================================

print_status "step" "Checking devops.config.json..."

if [[ ! -f "$APP_ROOT/devops.config.json" ]] || [[ "$FORCE" == "true" ]]; then
  cat > "$APP_ROOT/devops.config.json" << 'EOF'
{
  "portalPackages": [
    "@caffeinebounce/ui",
    "@caffeinebounce/identity",
    "@caffeinebounce/email",
    "@caffeinebounce/ai-assistant",
    "@caffeinebounce/logger",
    "@caffeinebounce/shared-utils"
  ],
  "sharedPackagesPath": "../shared-packages/packages",
  "hasPortals": true
}
EOF
  print_status "success" "Created devops.config.json"
else
  print_status "info" "devops.config.json already exists (use --force to overwrite)"
fi

# =============================================================================
# Step 2: Set up git hooks
# =============================================================================

print_status "step" "Setting up git hooks..."

HOOKS_DIR="$APP_ROOT/.git/hooks"

if [[ ! -d "$HOOKS_DIR" ]]; then
  print_status "error" "Git hooks directory not found. Is this a git repository?"
  exit 1
fi

# Make hook scripts executable
chmod +x "$SHARED_PACKAGES_ROOT/scripts/git-hooks/pre-commit"
chmod +x "$SHARED_PACKAGES_ROOT/scripts/git-hooks/pre-commit.portal"
chmod +x "$SHARED_PACKAGES_ROOT/scripts/git-hooks/post-commit.portal"
if [[ -f "$SHARED_PACKAGES_ROOT/scripts/git-hooks/pre-push" ]]; then
  chmod +x "$SHARED_PACKAGES_ROOT/scripts/git-hooks/pre-push"
fi

# Copy appropriate pre-commit hook
if [[ "$WITH_PORTALS" == "true" ]]; then
  cp "$SHARED_PACKAGES_ROOT/scripts/git-hooks/pre-commit.portal" "$HOOKS_DIR/pre-commit"
  chmod +x "$HOOKS_DIR/pre-commit"
  print_status "success" "Installed pre-commit hook (with portal support)"

  cp "$SHARED_PACKAGES_ROOT/scripts/git-hooks/post-commit.portal" "$HOOKS_DIR/post-commit"
  chmod +x "$HOOKS_DIR/post-commit"
  print_status "success" "Installed post-commit hook (portal restoration)"
else
  cp "$SHARED_PACKAGES_ROOT/scripts/git-hooks/pre-commit" "$HOOKS_DIR/pre-commit"
  chmod +x "$HOOKS_DIR/pre-commit"
  print_status "success" "Installed pre-commit hook"
fi

# Copy pre-push if it exists
if [[ -f "$SHARED_PACKAGES_ROOT/scripts/git-hooks/pre-push" ]]; then
  cp "$SHARED_PACKAGES_ROOT/scripts/git-hooks/pre-push" "$HOOKS_DIR/pre-push"
  chmod +x "$HOOKS_DIR/pre-push"
  print_status "success" "Installed pre-push hook"
fi

# =============================================================================
# Step 3: Copy pre-commit config template if needed
# =============================================================================

print_status "step" "Setting up pre-commit configuration..."

TEMPLATE_PATH="$SHARED_PACKAGES_ROOT/scripts/templates/pre-commit-config.yaml"

if [[ -f "$TEMPLATE_PATH" ]]; then
  if [[ ! -f "$APP_ROOT/.pre-commit-config.yaml" ]] || [[ "$FORCE" == "true" ]]; then
    cp "$TEMPLATE_PATH" "$APP_ROOT/.pre-commit-config.yaml"
    print_status "success" "Copied pre-commit config template"
    print_status "info" "Customize .pre-commit-config.yaml for your app's needs"
  else
    print_status "info" ".pre-commit-config.yaml already exists (use --force to overwrite)"
  fi
else
  print_status "warning" "Pre-commit config template not found at $TEMPLATE_PATH"
fi

# =============================================================================
# Step 4: Install pre-commit framework
# =============================================================================

print_status "step" "Installing pre-commit framework..."

if ! command -v pre-commit &> /dev/null; then
  print_status "info" "Installing pre-commit via pip..."
  pip install pre-commit || pip3 install pre-commit
fi

if [[ -f "$APP_ROOT/.pre-commit-config.yaml" ]]; then
  pre-commit install
  pre-commit install --hook-type commit-msg
  print_status "success" "Pre-commit hooks installed"
else
  print_status "warning" "No .pre-commit-config.yaml found, skipping pre-commit install"
fi

# =============================================================================
# Step 5: Make portal scripts executable
# =============================================================================

if [[ "$WITH_PORTALS" == "true" ]]; then
  print_status "step" "Setting up portal scripts..."

  chmod +x "$SHARED_PACKAGES_ROOT/scripts/portal/toggle-portals.sh"
  chmod +x "$SHARED_PACKAGES_ROOT/scripts/portal/update-shared-packages.sh"
  print_status "success" "Portal scripts are ready"

  # Add package.json scripts suggestion
  echo ""
  print_status "info" "Add these scripts to your package.json:"
  echo ""
  echo -e "  ${CYAN}\"scripts\": {${NC}"
  echo -e "  ${CYAN}  \"portals\": \"../shared-packages/scripts/portal/toggle-portals.sh\",${NC}"
  echo -e "  ${CYAN}  \"portals:on\": \"../shared-packages/scripts/portal/toggle-portals.sh on\",${NC}"
  echo -e "  ${CYAN}  \"portals:off\": \"../shared-packages/scripts/portal/toggle-portals.sh off\",${NC}"
  echo -e "  ${CYAN}  \"update:shared\": \"../shared-packages/scripts/portal/update-shared-packages.sh\"${NC}"
  echo -e "  ${CYAN}}${NC}"
fi

# =============================================================================
# Summary
# =============================================================================

echo ""
echo -e "${BOLD}${GREEN}Setup complete!${NC}"
echo ""
echo "What was set up:"
echo "  - devops.config.json (portal package configuration)"
if [[ "$WITH_PORTALS" == "true" ]]; then
  echo "  - Pre-commit hook with portal handling"
  echo "  - Post-commit hook for portal restoration"
else
  echo "  - Pre-commit hook with lockfile check and auto-restage"
fi
echo "  - Pre-commit framework configuration"
echo ""

if [[ "$WITH_PORTALS" == "true" ]]; then
  echo "Portal commands:"
  echo "  yarn portals          # Toggle portal mode"
  echo "  yarn portals:on       # Enable portals (local dev)"
  echo "  yarn portals:off      # Disable portals (use published)"
  echo "  yarn update:shared    # Update to latest published versions"
  echo ""
fi

echo "Next steps:"
echo "  1. Review and customize devops.config.json for your packages"
echo "  2. Review .pre-commit-config.yaml for your hooks"
echo "  3. Commit your changes"
echo ""
