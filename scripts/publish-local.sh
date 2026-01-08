#!/bin/bash
# =============================================================================
# publish-local.sh - Build and publish all shared packages locally
# =============================================================================
#
# Usage:
#   ./scripts/publish-local.sh              # Interactive - prompts for version bump
#   ./scripts/publish-local.sh patch        # Auto bump patch version
#   ./scripts/publish-local.sh minor        # Auto bump minor version
#   ./scripts/publish-local.sh major        # Auto bump major version
#   ./scripts/publish-local.sh --check      # Check if publish is needed (dry run)
#   ./scripts/publish-local.sh --force      # Force publish even if no changes
#
# This script:
# 1. Checks if there are changes to publish
# 2. Bumps versions across all packages
# 3. Builds all packages
# 4. Publishes to GitHub Packages
#
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running in interactive terminal
is_interactive() {
  [[ -t 0 && -t 1 ]]
}

# Packages to manage
PACKAGES=(
  "ui"
  "identity"
  "email"
  "ai-assistant"
  "logger"
  "shared-utils"
)

# Parse arguments
BUMP_TYPE=""
CHECK_ONLY=false
FORCE=false
QUIET=false

while [[ $# -gt 0 ]]; do
  case $1 in
    patch|minor|major)
      BUMP_TYPE="$1"
      shift
      ;;
    --check|-c)
      CHECK_ONLY=true
      shift
      ;;
    --force|-f)
      FORCE=true
      shift
      ;;
    --quiet|-q)
      QUIET=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

log() {
  if [[ "$QUIET" != "true" ]]; then
    echo -e "$1"
  fi
}

log_success() { log "${GREEN}✓${NC} $1"; }
log_info() { log "${BLUE}→${NC} $1"; }
log_warn() { log "${YELLOW}⚠${NC} $1"; }
log_error() { log "${RED}✗${NC} $1"; }

cd "$ROOT_DIR"

# Check for GitHub token
if [[ -z "$GITHUB_TOKEN" ]]; then
  # Try to get from .envrc or environment
  if [[ -f ".envrc" ]]; then
    source .envrc 2>/dev/null || true
  fi
fi

if [[ -z "$GITHUB_TOKEN" ]]; then
  log_error "GITHUB_TOKEN not set. Required for publishing to GitHub Packages."
  log_info "Set it with: export GITHUB_TOKEN=ghp_..."
  exit 1
fi

# Check if npm auth is configured
check_npm_auth() {
  if ! npm whoami --registry https://npm.pkg.github.com 2>/dev/null; then
    log_error "Not authenticated to GitHub Packages"
    log_info "Configure with: npm login --registry https://npm.pkg.github.com"
    return 1
  fi
  return 0
}

# Get current version of a package
get_version() {
  local pkg=$1
  node -e "console.log(require('./packages/$pkg/package.json').version)"
}

# Bump version of a package
bump_version() {
  local pkg=$1
  local bump_type=$2
  local pkg_json="./packages/$pkg/package.json"

  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('$pkg_json', 'utf8'));
    const [major, minor, patch] = pkg.version.split('.').map(Number);

    let newVersion;
    switch ('$bump_type') {
      case 'major':
        newVersion = \`\${major + 1}.0.0\`;
        break;
      case 'minor':
        newVersion = \`\${major}.\${minor + 1}.0\`;
        break;
      case 'patch':
      default:
        newVersion = \`\${major}.\${minor}.\${patch + 1}\`;
    }

    pkg.version = newVersion;
    fs.writeFileSync('$pkg_json', JSON.stringify(pkg, null, 2) + '\n');
    console.log(newVersion);
  "
}

# Check if package has changes since last publish
has_changes() {
  local pkg=$1
  local pkg_dir="./packages/$pkg"

  # Check if there are uncommitted changes in the package
  if [[ -n $(git status --porcelain "$pkg_dir" 2>/dev/null) ]]; then
    return 0
  fi

  # Check if there are commits since last tag
  local current_version=$(get_version "$pkg")
  local tag="@caffeinebounce/$pkg@$current_version"

  if ! git rev-parse "$tag" >/dev/null 2>&1; then
    # Tag doesn't exist, assume changes
    return 0
  fi

  # Check for commits since tag
  if [[ -n $(git log "$tag"..HEAD --oneline -- "$pkg_dir" 2>/dev/null) ]]; then
    return 0
  fi

  return 1
}

# Check if published version exists on registry
is_published() {
  local pkg=$1
  local version=$2
  npm view "@caffeinebounce/$pkg@$version" version 2>/dev/null | grep -q "$version"
}

# Main logic
log ""
log "${BLUE}📦 Shared Packages Publisher${NC}"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""

# Check we're on main branch (unless --force)
current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"
if [[ "$FORCE" != "true" && "$current_branch" != "main" ]]; then
  log_error "Publishing is only allowed from the 'main' branch."
  log_info "Current branch: '${current_branch:-unknown}'"
  log_info "Use --force to override this safety check."
  exit 1
fi

# Check npm auth
if ! check_npm_auth; then
  exit 1
fi
log_success "Authenticated to GitHub Packages"

# Determine which packages need publishing
packages_to_publish=()
for pkg in "${PACKAGES[@]}"; do
  current_version=$(get_version "$pkg")

  if [[ "$FORCE" == "true" ]]; then
    packages_to_publish+=("$pkg")
    log_info "$pkg: $current_version (force publish)"
  elif has_changes "$pkg"; then
    packages_to_publish+=("$pkg")
    log_info "$pkg: $current_version (has changes)"
  elif ! is_published "$pkg" "$current_version"; then
    packages_to_publish+=("$pkg")
    log_info "$pkg: $current_version (not published)"
  else
    log_success "$pkg: $current_version (up to date)"
  fi
done

if [[ ${#packages_to_publish[@]} -eq 0 ]]; then
  log ""
  log_success "All packages are up to date!"
  exit 0
fi

if [[ "$CHECK_ONLY" == "true" ]]; then
  log ""
  log_warn "Packages need publishing: ${packages_to_publish[*]}"
  log_info "Run without --check to publish"
  exit 1
fi

# Prompt for version bump if not specified
if [[ -z "$BUMP_TYPE" ]]; then
  # Require interactive terminal for prompts
  if ! is_interactive; then
    log_error "No version bump type specified and not running in interactive terminal."
    log_info "Use: ./scripts/publish-local.sh patch|minor|major"
    exit 1
  fi

  log ""
  log "Select version bump type:"
  log "  1) patch (bug fixes)"
  log "  2) minor (new features)"
  log "  3) major (breaking changes)"
  log ""
  read -p "Choice [1/2/3]: " choice

  case $choice in
    1) BUMP_TYPE="patch" ;;
    2) BUMP_TYPE="minor" ;;
    3) BUMP_TYPE="major" ;;
    *)
      log_error "Invalid choice"
      exit 1
      ;;
  esac
fi

log ""
log_info "Bumping versions ($BUMP_TYPE)..."

# Bump versions for packages that need publishing
for pkg in "${packages_to_publish[@]}"; do
  old_version=$(get_version "$pkg")
  new_version=$(bump_version "$pkg" "$BUMP_TYPE")
  if [[ -z "$new_version" ]]; then
    log_error "Failed to bump version for $pkg"
    exit 1
  fi
  log_success "$pkg: $old_version → $new_version"
done

# Lint all packages
log ""
log_info "Linting packages..."
if ! yarn lint; then
  log_error "Lint failed! Fix errors before publishing."
  exit 1
fi
log_success "Lint passed"

# Build all packages
log ""
log_info "Building packages..."
if ! yarn build; then
  log_error "Build failed!"
  exit 1
fi
log_success "Build complete"

# Publish each package
log ""
log_info "Publishing packages..."

for pkg in "${packages_to_publish[@]}"; do
  pkg_dir="./packages/$pkg"
  version=$(get_version "$pkg")

  # Validate version is not empty
  if [[ -z "$version" ]]; then
    log_error "Failed to get version for $pkg"
    exit 1
  fi

  log_info "Publishing @caffeinebounce/$pkg@$version..."

  cd "$pkg_dir"

  # Publish to GitHub Packages
  if npm publish --registry https://npm.pkg.github.com --access restricted 2>&1; then
    log_success "@caffeinebounce/$pkg@$version published"
  else
    log_error "Failed to publish @caffeinebounce/$pkg"
    cd "$ROOT_DIR"
    exit 1
  fi

  cd "$ROOT_DIR"
done

# Create git tag for the release
log ""
log_info "Creating git tags..."

for pkg in "${packages_to_publish[@]}"; do
  version=$(get_version "$pkg")
  tag="@caffeinebounce/$pkg@$version"

  # Check if tag already exists
  if git rev-parse -q --verify "refs/tags/$tag" >/dev/null 2>&1; then
    log_warn "Tag $tag already exists, skipping"
    continue
  fi

  # Create tag
  if git tag "$tag"; then
    log_success "Created tag: $tag"
  else
    log_error "Failed to create git tag: $tag"
    exit 1
  fi
done

# Stage package.json changes
log ""
log_info "Staging version changes..."
git add packages/*/package.json

log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "Publishing complete!"
log ""
log "Next steps:"
log "  1. Commit the version bump: git commit -m 'chore: release packages'"
log "  2. Push with tags: git push && git push --tags"
log ""
