#!/bin/bash
# =============================================================================
# toggle-portals.sh - Switch between local portal and published package resolutions
# =============================================================================
#
# Usage:
#   ./scripts/toggle-portals.sh          # Toggle current state
#   ./scripts/toggle-portals.sh on       # Enable portals (local dev)
#   ./scripts/toggle-portals.sh off      # Disable portals (use published)
#   ./scripts/toggle-portals.sh status   # Show current state
#
# This script modifies package.json resolutions to switch between:
#   - Portal mode: Uses local ../shared-packages via symlinks
#   - Published mode: Uses packages from GitHub Packages registry
#
# Configuration:
#   Reads from devops.config.json in the app root for:
#   - portalPackages: Array of package names to toggle
#   - sharedPackagesPath: Path to shared-packages relative to app root
#
# =============================================================================

set -e

# Determine script location and root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# If called from app's package.json script, ROOT_DIR is current directory
# If called directly, find the nearest package.json
if [[ -f "./package.json" ]]; then
  ROOT_DIR="$(pwd)"
elif [[ -f "$(dirname "$SCRIPT_DIR")/../../package.json" ]]; then
  # Called from shared-packages/scripts/portal/, look for app root
  ROOT_DIR="$(cd "$(dirname "$SCRIPT_DIR")/../.." && pwd)"
else
  ROOT_DIR="$(pwd)"
fi

PACKAGE_JSON="$ROOT_DIR/package.json"
CONFIG_FILE="$ROOT_DIR/devops.config.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Default configuration (can be overridden by devops.config.json)
SHARED_PACKAGES_PATH="../shared-packages/packages"
declare -a PORTAL_PACKAGES

# Load configuration from devops.config.json if it exists
load_config() {
  if [[ -f "$CONFIG_FILE" ]]; then
    # Read portalPackages array
    PORTAL_PACKAGES=($(node -e "
      const config = require('$CONFIG_FILE');
      if (config.portalPackages) {
        config.portalPackages.forEach(p => console.log(p));
      }
    " 2>/dev/null))

    # Read sharedPackagesPath
    local path=$(node -e "
      const config = require('$CONFIG_FILE');
      if (config.sharedPackagesPath) console.log(config.sharedPackagesPath);
    " 2>/dev/null)
    if [[ -n "$path" ]]; then
      SHARED_PACKAGES_PATH="$path"
    fi
  else
    # Fallback to common packages if no config
    PORTAL_PACKAGES=(
      "@caffeinebounce/ui"
      "@caffeinebounce/identity"
      "@caffeinebounce/email"
      "@caffeinebounce/ai-assistant"
      "@caffeinebounce/logger"
      "@caffeinebounce/shared-utils"
    )
  fi
}

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
  local app_name=$(basename "$ROOT_DIR")
  echo ""
  echo -e "${BOLD}${CYAN}========================================${NC}"
  echo -e "${BOLD}${CYAN}  Portal Resolution Manager - ${app_name}${NC}"
  echo -e "${BOLD}${CYAN}========================================${NC}"
  echo ""
}

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

# Check if portals are currently enabled by looking for portal: in resolutions
portals_enabled() {
  if grep -q '"portal:' "$PACKAGE_JSON" 2>/dev/null; then
    return 0  # true
  else
    return 1  # false
  fi
}

# Get the package name without scope for path
get_package_dir() {
  local package=$1
  echo "${package#@caffeinebounce/}"
}

# Check if shared-packages directory exists
check_shared_packages() {
  local shared_dir="$ROOT_DIR/$SHARED_PACKAGES_PATH"
  if [[ ! -d "$shared_dir" ]]; then
    print_status "error" "shared-packages not found at: $shared_dir"
    print_status "info" "Make sure shared-packages exists at the configured path"
    exit 1
  fi

  # Check each package exists
  for pkg in "${PORTAL_PACKAGES[@]}"; do
    local pkg_dir=$(get_package_dir "$pkg")
    local full_path="$shared_dir/$pkg_dir"
    if [[ ! -d "$full_path" ]]; then
      print_status "warning" "Package directory not found: $full_path"
    fi
  done
}

# =============================================================================
# Core Functions
# =============================================================================

show_status() {
  print_header

  if portals_enabled; then
    echo -e "  ${GREEN}*${NC} Portal mode: ${BOLD}${GREEN}ENABLED${NC}"
    echo -e "    Using local shared-packages via symlinks"
    echo ""
    echo -e "  ${CYAN}Linked packages:${NC}"
    for pkg in "${PORTAL_PACKAGES[@]}"; do
      local pkg_dir=$(get_package_dir "$pkg")
      local link_path="$ROOT_DIR/node_modules/@caffeinebounce/$pkg_dir"
      if [[ -L "$link_path" ]]; then
        local target=$(readlink "$link_path")
        echo -e "    ${GREEN}>${NC} $pkg ${BLUE}>${NC} $target"
      else
        echo -e "    ${YELLOW}?${NC} $pkg (not linked)"
      fi
    done
  else
    echo -e "  ${YELLOW}o${NC} Portal mode: ${BOLD}${YELLOW}DISABLED${NC}"
    echo -e "    Using published packages from GitHub Packages"
    echo ""
    echo -e "  ${CYAN}Installed versions:${NC}"
    for pkg in "${PORTAL_PACKAGES[@]}"; do
      local pkg_dir=$(get_package_dir "$pkg")
      local pkg_json="$ROOT_DIR/node_modules/@caffeinebounce/$pkg_dir/package.json"
      if [[ -f "$pkg_json" ]]; then
        local version=$(grep '"version"' "$pkg_json" | head -1 | sed 's/.*"version": *"\([^"]*\)".*/\1/')
        echo -e "    ${GREEN}+${NC} $pkg@${CYAN}$version${NC}"
      else
        echo -e "    ${YELLOW}?${NC} $pkg (not installed)"
      fi
    done
  fi

  echo ""
}

enable_portals() {
  print_header

  if portals_enabled; then
    print_status "info" "Portals are already enabled"
    show_status
    return 0
  fi

  print_status "step" "Checking shared-packages directory..."
  check_shared_packages

  print_status "step" "Enabling portal resolutions in package.json..."

  # Build portal resolutions object
  local portals_json="{"
  local first=true
  for pkg in "${PORTAL_PACKAGES[@]}"; do
    local pkg_dir=$(get_package_dir "$pkg")
    if [[ "$first" != "true" ]]; then
      portals_json="$portals_json,"
    fi
    portals_json="$portals_json\"$pkg\":\"portal:$SHARED_PACKAGES_PATH/$pkg_dir\""
    first=false
  done
  portals_json="$portals_json}"

  # Use node to safely modify package.json
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('$PACKAGE_JSON', 'utf8'));
    const portals = $portals_json;
    pkg.resolutions = { ...pkg.resolutions, ...portals };
    fs.writeFileSync('$PACKAGE_JSON', JSON.stringify(pkg, null, 2) + '\n');
    console.log('Updated package.json with portal resolutions');
  "

  print_status "success" "Portal resolutions added to package.json"

  print_status "step" "Building shared-packages..."
  (cd "$ROOT_DIR/../shared-packages" && yarn build) || {
    print_status "warning" "shared-packages build had issues, continuing anyway..."
  }

  print_status "step" "Running yarn install..."
  (cd "$ROOT_DIR" && yarn install)

  print_status "success" "Portals enabled!"
  echo ""
  print_status "info" "Changes in shared-packages will now be reflected in this app"
  print_status "info" "Remember to rebuild shared-packages after making changes:"
  echo -e "       ${CYAN}cd ../shared-packages && yarn build${NC}"
  echo ""
}

disable_portals() {
  print_header

  if ! portals_enabled; then
    print_status "info" "Portals are already disabled"
    show_status
    return 0
  fi

  print_status "step" "Removing portal resolutions from package.json..."

  # Use node to safely modify package.json
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('$PACKAGE_JSON', 'utf8'));
    const portalPackages = $(node -e "console.log(JSON.stringify($(printf '%s\n' "${PORTAL_PACKAGES[@]}" | jq -R . | jq -s .)))");

    for (const p of portalPackages) {
      if (pkg.resolutions && pkg.resolutions[p]?.startsWith('portal:')) {
        delete pkg.resolutions[p];
      }
    }

    fs.writeFileSync('$PACKAGE_JSON', JSON.stringify(pkg, null, 2) + '\n');
    console.log('Removed portal resolutions from package.json');
  "

  print_status "success" "Portal resolutions removed from package.json"

  print_status "step" "Running yarn install to fetch published packages..."
  (cd "$ROOT_DIR" && yarn install)

  print_status "success" "Portals disabled!"
  echo ""
  print_status "info" "Now using published packages from GitHub Packages"
  echo ""
}

toggle_portals() {
  if portals_enabled; then
    disable_portals
  else
    enable_portals
  fi
}

# =============================================================================
# Main
# =============================================================================

load_config
cd "$ROOT_DIR"

case "${1:-toggle}" in
  on|enable)
    enable_portals
    ;;
  off|disable)
    disable_portals
    ;;
  status|s)
    show_status
    ;;
  toggle|t|"")
    toggle_portals
    ;;
  help|h|-h|--help)
    print_header
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  on, enable     Enable portal resolutions (use local shared-packages)"
    echo "  off, disable   Disable portal resolutions (use published packages)"
    echo "  status, s      Show current portal state"
    echo "  toggle, t      Toggle between portal and published (default)"
    echo "  help, h        Show this help message"
    echo ""
    echo "Configuration:"
    echo "  Create devops.config.json in your app root with:"
    echo "  {"
    echo "    \"portalPackages\": [\"@caffeinebounce/ui\", ...],"
    echo "    \"sharedPackagesPath\": \"../shared-packages/packages\""
    echo "  }"
    echo ""
    ;;
  *)
    print_status "error" "Unknown command: $1"
    echo "Run '$0 help' for usage information"
    exit 1
    ;;
esac
