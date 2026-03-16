#!/bin/bash
# =============================================================================
# update-shared-packages.sh - Ensure app uses latest shared-packages versions
# =============================================================================
#
# Usage:
#   ./scripts/update-shared-packages.sh          # Check and update if needed
#   ./scripts/update-shared-packages.sh --check  # Check only, don't update
#   ./scripts/update-shared-packages.sh --force  # Update even if current
#   ./scripts/update-shared-packages.sh --verify # Verify current versions are published
#
# This script fetches the latest versions of @caffeinebounce/* packages from
# GitHub Packages and updates package.json if newer versions are available.
#
# Configuration:
#   Reads from devops.config.json in the app root for:
#   - portalPackages: Array of package names to check/update
#
# =============================================================================

set -e

# Determine script location and root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# If called from app's package.json script, ROOT_DIR is current directory
if [[ -f "./package.json" ]]; then
  ROOT_DIR="$(pwd)"
else
  ROOT_DIR="$(pwd)"
fi

PACKAGE_JSON="$ROOT_DIR/package.json"
CONFIG_FILE="$ROOT_DIR/devops.config.json"

# Parse arguments
CHECK_ONLY=false
FORCE_UPDATE=false
QUIET=false
VERIFY_ONLY=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --check|-c)
      CHECK_ONLY=true
      shift
      ;;
    --force|-f)
      FORCE_UPDATE=true
      shift
      ;;
    --quiet|-q)
      QUIET=true
      shift
      ;;
    --verify|-v)
      VERIFY_ONLY=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Default packages (can be overridden by devops.config.json)
declare -a PACKAGES

# Load configuration from devops.config.json if it exists
load_config() {
  if [[ -f "$CONFIG_FILE" ]]; then
    PACKAGES=($(node -e "
      const fs = require('fs');
      const configPath = process.argv[1];
      let config = {};
      try {
        const raw = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(raw);
      } catch {
        // If config file is unreadable or invalid JSON, emit no packages
        process.exit(0);
      }
      if (Array.isArray(config.portalPackages)) {
        config.portalPackages.forEach(p => {
          if (typeof p === 'string') {
            console.log(p);
          }
        });
      }
    " "$CONFIG_FILE" 2>/dev/null))
  fi

  # Fallback to the common portal-consumed package subset if no config or empty
  if [[ ${#PACKAGES[@]} -eq 0 ]]; then
    PACKAGES=(
      "@caffeinebounce/ui"
      "@caffeinebounce/identity"
      "@caffeinebounce/email"
      "@caffeinebounce/ai-assistant"
      "@caffeinebounce/logger"
      "@caffeinebounce/shared-utils"
    )
  fi
}

# Get current version from package.json
get_current_version() {
  local pkg=$1
  node -e "
    const pkg = require('$PACKAGE_JSON');
    const version = pkg.dependencies['$pkg'] || '';
    // Strip ^ or ~ prefix for comparison
    console.log(version.replace(/^[\^~]/, ''));
  "
}

# Get latest version from npm registry (GitHub Packages)
get_latest_version() {
  local pkg=$1
  # Use npm view to get latest version, suppress errors
  npm view "$pkg" version 2>/dev/null || echo ""
}

# Update package.json with new version
update_version() {
  local pkg=$1
  local new_version=$2

  node -e "
    const fs = require('fs');
    const pkgJson = JSON.parse(fs.readFileSync('$PACKAGE_JSON', 'utf8'));

    if (pkgJson.dependencies && pkgJson.dependencies['$pkg']) {
      // Preserve ^ prefix for semver compatibility
      pkgJson.dependencies['$pkg'] = '^$new_version';
      fs.writeFileSync('$PACKAGE_JSON', JSON.stringify(pkgJson, null, 2) + '\n');
    }
  "
}

# Compare semver versions (returns 0 if v1 < v2)
# Note: This is a simple major.minor.patch comparison.
# Pre-release versions (e.g., 1.0.0-alpha.1) and build metadata are not fully supported.
version_lt() {
  local v1=$1
  local v2=$2

  if [[ -z "$v1" ]] || [[ -z "$v2" ]]; then
    return 1
  fi

  # Use node for reliable semver comparison
  node -e "
    const v1 = '$v1'.split('-')[0]; // Strip pre-release suffix
    const v2 = '$v2'.split('-')[0];

    // Simple semver comparison (major.minor.patch)
    const parseVersion = (v) => v.split('.').map(n => parseInt(n, 10) || 0);
    const [maj1, min1, patch1] = parseVersion(v1);
    const [maj2, min2, patch2] = parseVersion(v2);

    if (maj1 < maj2) process.exit(0);
    if (maj1 > maj2) process.exit(1);
    if (min1 < min2) process.exit(0);
    if (min1 > min2) process.exit(1);
    if (patch1 < patch2) process.exit(0);
    process.exit(1);
  "
}

# Check if a specific version is published
is_version_published() {
  local pkg=$1
  local version=$2
  npm view "$pkg@$version" version 2>/dev/null | grep -q "$version"
}

# Verify all packages in package.json are published
verify_packages_published() {
  local all_published=true

  if [[ "$QUIET" != "true" ]]; then
    echo "Verifying shared-packages are published..."
  fi

  for pkg in "${PACKAGES[@]}"; do
    current=$(get_current_version "$pkg")

    if [[ -z "$current" ]]; then
      continue
    fi

    if is_version_published "$pkg" "$current"; then
      if [[ "$QUIET" != "true" ]]; then
        echo "   +  $pkg@$current (published)"
      fi
    else
      all_published=false
      if [[ "$QUIET" != "true" ]]; then
        echo "   x  $pkg@$current (NOT PUBLISHED)"
      fi
    fi
  done

  if [[ "$all_published" == "true" ]]; then
    if [[ "$QUIET" != "true" ]]; then
      echo ""
      echo "All packages are published and available"
    fi
    return 0
  else
    if [[ "$QUIET" != "true" ]]; then
      echo ""
      echo "Some packages are not published!"
      echo "   Run ./scripts/publish-local.sh in shared-packages to publish"
    fi
    return 1
  fi
}

# =============================================================================
# Main
# =============================================================================

load_config

# Handle verify mode
if [[ "$VERIFY_ONLY" == "true" ]]; then
  verify_packages_published
  exit $?
fi

updates_needed=false
updates_available=""

if [[ "$QUIET" != "true" ]]; then
  echo "Checking shared-packages versions..."
fi

for pkg in "${PACKAGES[@]}"; do
  current=$(get_current_version "$pkg")
  latest=$(get_latest_version "$pkg")

  if [[ -z "$latest" ]]; then
    if [[ "$QUIET" != "true" ]]; then
      echo "   !  $pkg: Could not fetch latest version"
    fi
    continue
  fi

  if [[ -z "$current" ]]; then
    if [[ "$QUIET" != "true" ]]; then
      echo "   !  $pkg: Not in dependencies"
    fi
    continue
  fi

  if version_lt "$current" "$latest" || [[ "$FORCE_UPDATE" == "true" ]]; then
    updates_needed=true
    updates_available="$updates_available\n   $pkg: $current > $latest"

    if [[ "$CHECK_ONLY" != "true" ]]; then
      update_version "$pkg" "$latest"
      if [[ "$QUIET" != "true" ]]; then
        echo "   +  $pkg: $current > $latest"
      fi
    fi
  else
    if [[ "$QUIET" != "true" ]]; then
      echo "   +  $pkg: $current (current)"
    fi
  fi
done

if [[ "$CHECK_ONLY" == "true" ]]; then
  if [[ "$updates_needed" == "true" ]]; then
    echo ""
    echo "Updates available:"
    echo -e "$updates_available"
    echo ""
    echo "Run without --check to apply updates"
    exit 1  # Non-zero exit to indicate updates are available
  else
    if [[ "$QUIET" != "true" ]]; then
      echo ""
      echo "All shared-packages are up to date"
    fi
    exit 0
  fi
fi

if [[ "$updates_needed" == "true" ]]; then
  echo ""
  echo "Updated package.json with latest shared-packages versions"
  echo "   Run 'yarn install' to apply changes"
fi
