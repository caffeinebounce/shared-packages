# Shared Packages

Shared UI components and utilities for Capital Collective projects.

## Packages

| Package | Description |
|---------|-------------|
| `@caffeinebounce/ui` | Shared UI components (Button, Card, Dialog, etc.) |
| `@caffeinebounce/email` | Email templates and Resend client |
| `@caffeinebounce/logger` | Logging utilities with Logtail |
| `@caffeinebounce/ai-assistant` | AI chat panel components |

## Installation

These packages are published to GitHub Packages. Configure your `.npmrc`:

```ini
@caffeinebounce:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then install:

```bash
yarn add @caffeinebounce/ui@latest
```

## Development

### Prerequisites

- Node.js 20.9+
- Yarn 4.11.0 (Berry)
- `GITHUB_TOKEN` environment variable with `read:packages` and `write:packages` scopes

### Setup

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Development mode (watch)
yarn dev

# Lint
yarn lint
```

### Auth token (GitHub Packages)

- Copy `.env.example` to `.env` and fill in your token:

```bash
cp .env.example .env
# edit .env and set GITHUB_TOKEN=ghp_... (do NOT commit `.env`)
```

- The repository reads the token from the `GITHUB_TOKEN` environment variable. `.env` is ignored by git by default.

- If you use `.npmrc` locally, make sure it references `${GITHUB_TOKEN}` (and not the raw value) as shown above. We also replaced the old token in `.yarnrc.yml` to read from the environment as well.

#### Avoid re-exporting the token every time (recommended: direnv)

If you want Yarn to work without manually exporting `GITHUB_TOKEN` each session, use [direnv](https://direnv.net) to auto-load `.env`:

```bash
brew install direnv
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
```

In the repo root, create an untracked `.envrc` (gitignored) with:

```bash
dotenv
```

Then allow it once:

```bash
direnv allow
```

From then on, entering the repo directory will load `GITHUB_TOKEN` from your `.env` automatically for Yarn/npm without re-exporting.

**Security note:** This project previously included a committed personal access token in `.yarnrc.yml`. Please revoke that token immediately and create a new one with the `read:packages` and `write:packages` scopes. If you need to remove the secret from your git history, follow GitHub's guidance for removing sensitive data from a repository (for example, using `git filter-repo` or the BFG Repo Cleaner), but rotate the token first.

### Publishing

We use [Changesets](https://github.com/changesets/changesets) for version management.

```bash
# Create a changeset (after making changes)
yarn changeset

# Version packages (CI does this automatically)
yarn version-packages

# Publish (CI does this on main branch)
yarn release
```

## Usage in Projects

```typescript
import { Button, Card, Spinner } from "@caffeinebounce/ui";
import { sendEmail } from "@caffeinebounce/email";
import { logger } from "@caffeinebounce/logger";
```

## Contributing

1. Create a feature branch
2. Make changes
3. Run `yarn changeset` to describe your changes
4. Submit a PR
5. After merge, CI will publish new versions
