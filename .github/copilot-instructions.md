# Copilot Instructions for Shared Packages

## Overview

**Shared Packages** is a Turborepo monorepo containing reusable, cross-project packages published to GitHub Packages for Capital Collective projects (primarily Compass).

**Tech Stack**: React 19, TypeScript 5.9 (strict), Tailwind CSS v4, Biome (lint/format), Vitest, Tsup (bundler), Changesets (versioning).

**Runtime Requirements**: Node.js 20.9+, Yarn 4.11.0 (Berry).

**Publishing**: All packages published to GitHub Packages registry (`@npm.pkg.github.com`) as `@caffeinebounce/*` scoped packages.

**Documentation**: The README now contains the quick start, workflow, and hook/publish overview. Deep dives remain in [docs/auto-publish-system.md](../docs/auto-publish-system.md) and [docs/setup-hooks-and-publish.md](../docs/setup-hooks-and-publish.md); visuals are in [docs/ARCHITECTURE_DIAGRAMS.md](../docs/ARCHITECTURE_DIAGRAMS.md). Consumer guidance lives in [../compass/docs/updating-shared-packages.md](../../compass/docs/updating-shared-packages.md).

## Repository Structure

```
shared-packages/
├── packages/
│   ├── ui/                      # @caffeinebounce/ui - Primitive & composed UI components
│   │   └── src/
│   │       ├── index.tsx        # Main export (re-exports all components & hooks)
│   │       ├── blocks/          # Composed components (layouts, forms, wizards, navigation)
│   │       ├── components/      # Primitive UI (Button, Input, Dialog, Card, etc.)
│   │       ├── config/          # Theme config, constants, color utilities
│   │       ├── hooks/           # Reusable React hooks (useMediaQuery, useClickOutside, etc.)
│   │       └── utils/           # Utility functions (cn, classname merging, style helpers)
│   ├── identity/                # @caffeinebounce/identity - Authentication & security
│   │   └── src/
│   │       ├── index.ts         # Client-side exports
│   │       ├── server.ts        # Server-side auth utilities & handlers
│   │       ├── components/      # Auth UI (SigninForm, MFAChallenge, TwoFactor, etc.)
│   │       ├── handlers/        # Auth handlers (signUp, signIn, passwordReset, etc.)
│   │       ├── utils/           # Auth utilities (validation, token parsing, etc.)
│   │       └── types.ts         # Auth-related types & interfaces
│   ├── email/                   # @caffeinebounce/email - Email templates & client
│   │   └── src/
│   │       ├── index.ts         # Main export (re-exports client & templates)
│   │       ├── client.ts        # Resend email client wrapper
│   │       ├── components/      # Email template components (EmailHeader, Footer, etc.)
│   │       ├── templates/       # Full email templates (WelcomeEmail, ResetEmail, etc.)
│   │       └── types.ts         # Email configuration types
│   ├── ai-assistant/            # @caffeinebounce/ai-assistant - AI chat components
│   │   └── src/
│   │       ├── index.ts         # Main export
│   │       ├── panel.tsx        # AI chat panel component
│   │       ├── context.tsx      # AI conversation context & state management
│   │       ├── use-ai-capability.ts # Hook for AI capabilities
│   │       └── types.ts         # AI types & interfaces
│   └── logger/                  # @caffeinebounce/logger - Structured logging
│       └── src/
│           ├── index.ts         # Main export
│           ├── logger.ts        # Standard logger with Logtail integration
│           ├── admin-logger.ts  # Admin-specific logging
│           ├── auth-logger.ts   # Auth event logging
│           └── types.ts         # Logger types & configuration
├── .changeset/                  # Changeset entries for version management
├── biome.json                   # Linting and formatting config (shared)
├── turbo.json                   # Turborepo task configuration
├── tsconfig.base.json           # Shared TypeScript configuration
└── README.md                    # Repository overview
```

## Build & Validation Commands

**Always run commands from the repo root.** The order matters.

| Task | Command | Notes |
|------|---------|-------|
| Install dependencies | `yarn install` | Required before any build/test |
| Setup git hooks | `./scripts/setup-hooks.sh` | One-time setup, runs automatically on `yarn install` |
| Build (all packages) | `yarn build` | Runs Turbo, builds all packages in order |
| Lint | `yarn lint` | Uses Biome via Turbo |
| Format | `yarn format` | Auto-fix with Biome |
| Format check | `yarn format:check` | Check without fixing |
| Run tests | `vitest run` | Vitest - run from individual package or root |
| Watch tests | `vitest` | Continuous test mode |
| Dev (watch) | `yarn dev` | Runs all packages in watch mode with Tsup |
| Clean | `yarn clean` | Remove dist folders and node_modules |
| Create changeset | `yarn changeset` | Track version changes for release |
| Version packages | `yarn version-packages` | Update versions based on changesets |
| Release/Publish | `yarn release` | Build + publish to GitHub Packages |

### Validation Before PR

**Always run in this order:**
```bash
yarn build && yarn lint && yarn test
```

All three must pass. Each package is independently tested and built.

### Pre-Commit Hooks

Hooks run automatically when committing. They validate:
- ✅ File hygiene (trailing whitespace, line endings, JSON/YAML validity)
- ✅ Biome linting and formatting (auto-fixes)
- ✅ TypeScript type checking
- ✅ Secrets detection
- ✅ Conventional commit format (commit message validation)

If hooks auto-fix issues, files are automatically re-staged and commit is retried.

**Setup hooks** (automatic via `prepare` script, or manual):
```bash
yarn install  # Automatically runs setup via package.json "prepare" script
# Or manually:
./scripts/setup-hooks.sh
```

## Commit Standards

This repo uses **Conventional Commits** with **Changesets** for version management:

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
```

**Examples:**
- `feat(ui): add new Button variant prop`
- `fix(email): correct template spacing`
- `docs(identity): update MFA flow documentation`

**Pre-commit validation** enforces conventional format automatically on `commit-msg` hook.

### Changelog Management with Changesets

Changesets track which packages changed and what version bump is needed:

**Workflow:**
1. Make code changes
2. Create changeset: `yarn changeset`
3. Commit changeset file along with code
4. On merge to main, changesets action creates version bump PR
5. Merge version bump PR
6. Publish workflow releases to GitHub Packages
7. Consumer apps (Compass) automatically get update PRs

**Changeset file format** (`.changeset/*.md`):
```markdown
---
"@caffeinebounce/ui": minor
"@caffeinebounce/email": patch
---

Brief summary of what changed affecting these packages.
Can span multiple lines with details.
```

**Version bump options:**
- `patch` - Bug fixes, non-breaking (0.0.X)
- `minor` - New features, backward compatible (0.X.0)
- `major` - Breaking changes (X.0.0)

### Before Creating a PR

**Always include a changeset:**
```bash
# Make your changes
echo "new code" >> packages/ui/src/components/Button.tsx

# Stage changes
git add packages/ui/src/components/Button.tsx

# Commit (hooks validate conventional format)
git commit -m "feat(ui): add color variants to Button"

# Create changeset
yarn changeset
# Interactive: select affected packages, semver bump, description

# Commit changeset
git add .changeset/*.md
git commit -m "chore: add changeset"

# Push and create PR
git push origin feat/my-feature
```

## Branch Protection & Workflow

**The `main` branch is protected.** Direct commits are blocked.

**Standard workflow:**
1. Create feature branch: `git checkout -b feat/new-feature`
2. Make changes and commit (conventional format)
3. Create changeset: `yarn changeset`
4. Push branch and create PR
5. CI must pass before merge
6. Squash merge to `main`

**Release Process** (maintainers only):
```bash
git checkout main && git pull
yarn version-packages    # Updates versions in package.json files
yarn release             # Publishes to GitHub Packages
```

## Package Publishing

All packages are published to **GitHub Packages** as `@caffeinebounce/*`:

```bash
# Check package.json publishConfig
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
}
```

**Publishing Requirements**:
1. `.npmrc` must be configured in consuming projects:
   ```ini
   @caffeinebounce:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```
2. Changesets are created for all changes
3. Version bump is applied and committed
4. `yarn release` publishes all updated packages

**Current Versions** (check package.json for latest):
- `@caffeinebounce/ui`: 0.1.3
- `@caffeinebounce/identity`: 0.1.1
- `@caffeinebounce/email`: 0.1.0
- `@caffeinebounce/ai-assistant`: 0.1.2
- `@caffeinebounce/logger`: 0.1.0

Consumers should use `@latest` tag: `yarn add @caffeinebounce/ui@latest`

## Development Patterns

### Package Exports (Critical)

Each package must explicitly export all public APIs in its entry point(s):

**UI Package** (`packages/ui/src/index.tsx`):
```typescript
// Export all components
export * from "./components/Button";
export * from "./components/Input";
export * from "./blocks/FormLayout";

// Export hooks
export { useMediaQuery, useClickOutside } from "./hooks";

// Export utilities
export { cn } from "./utils/classnames";

// Export types
export type { ButtonProps, InputProps } from "./components";
```

**Identity Package** (`packages/identity/src/index.ts` & `server.ts`):
```typescript
// Client exports (index.ts)
export * from "./components/SigninForm";
export * from "./handlers";
export type { AuthState, UserProfile } from "./types";

// Server exports (server.ts) - separate entry point
export { createAuthClient, validateToken } from "./server";
```

**Pattern**: Every new component/utility/hook must be explicitly exported. Use `export *` for barrel exports from subdirectories, or explicit `export { Component }` for clarity.

### Component Structure

**UI Components**:
```typescript
// packages/ui/src/components/Button.tsx
import { cn } from "../utils/classnames";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "font-medium transition-colors",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "secondary" && "bg-gray-200 text-gray-900 hover:bg-gray-300",
        size === "md" && "px-4 py-2",
        className
      )}
      {...props}
    />
  );
}
```

**Auth Components**:
```typescript
// packages/identity/src/components/SigninForm.tsx
"use client"; // Client component for form interaction

import { FormEvent, useState } from "react";

export function SigninForm({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      // Auth logic
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    }
  }

  return (
    // Form JSX
  );
}
```

**Email Templates**:
```typescript
// packages/email/src/templates/WelcomeEmail.tsx
import { EmailHeader, EmailFooter } from "../components";

export interface WelcomeEmailProps {
  userName: string;
  activationUrl: string;
}

export function WelcomeEmail({ userName, activationUrl }: WelcomeEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <EmailHeader />
      <p>Welcome, {userName}!</p>
      <a href={activationUrl}>Activate your account</a>
      <EmailFooter />
    </div>
  );
}
```

### Testing

**Each package should include tests** using Vitest:

```typescript
// packages/ui/src/components/Button.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders with correct variant", () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-blue-600");
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Text</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });
});
```

**Test requirements**:
- Unit tests for components, utilities, and functions
- Integration tests for auth flows
- Email templates should validate rendering without errors
- Run with `vitest run` or `vitest` (watch mode)

### Styling Guidelines

- **Tailwind CSS v4** with CSS-first configuration
- Utility classes preferred; use `cn()` for conditional classes
- No CSS modules or styled-components
- Consistent spacing: `px-4 py-3` for compact, `p-6` for generous
- Color tokens via Tailwind config (not hardcoded hex values)
- Document custom utilities and hooks in comments

### TypeScript & Type Safety

- **Strict mode required**: `"strict": true` in `tsconfig.json`
- All props must be typed (no `any`)
- Use `type` for type-only imports: `import type { ComponentProps } from "react"`
- Export types from components: `export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }`
- Use discriminated unions for complex state

### Server vs Client Components

**Client Components** (add `"use client"`):
- Form components (SigninForm, EmailForm)
- Interactive components with hooks
- Event handlers
- Browser APIs

**Export separately from `server.ts`** for auth utilities:
- JWT validation
- Token generation
- Password hashing/verification
- Database operations

Example:
```typescript
// index.ts - client exports
export { SigninForm } from "./components/SigninForm";

// server.ts - server exports
export { validateAuthToken } from "./utils/token";
```

## Package-Specific Details

### @caffeinebounce/ui

**Purpose**: Primitive UI components and composed blocks for form layouts, navigation, wizards, etc.

**Key exports**:
- Components: `Button`, `Input`, `Dialog`, `Card`, `Label`, `Select`, `Spinner`, `Toast`, `Badge`, `Tabs`
- Blocks: `FormLayout`, `WizardLayout`, `Navbar`, `EntitySwitcher`, `KeyboardShortcut`
- Hooks: `useMediaQuery`, `useClickOutside`, `useToast`, `useDarkMode`
- Utilities: `cn()` for classname merging, color utilities

**Testing**: Component snapshot tests, interaction tests with @testing-library/react.

**Styling**: Tailwind CSS v4 with custom theme config in `config/tailwind.config.ts`.

### @caffeinebounce/identity

**Purpose**: Authentication flows, MFA, security settings, and auth-related components.

**Key exports**:
- Components: `SigninForm`, `SignupForm`, `MFAChallenge`, `TwoFactorSection`, `PasswordResetForm`, `SecuritySettings`
- Handlers: `handleSignIn`, `handleSignUp`, `handlePasswordReset`, `handleMFAEnrollment`
- Server utilities: `createAuthClient`, `validateToken`, `generateJWT`
- Types: `AuthState`, `User`, `MFAConfig`

**Special Notes**:
- Mix of client components (forms) and server utilities
- Export server functions from `server.ts` entry point
- Tightly coupled with Supabase auth (via integration in consuming app)
- Handles password hashing, token validation, MFA logic

**Testing**: Auth flow tests, security utility tests, component rendering.

### @caffeinebounce/email

**Purpose**: Email templates and Resend client integration for transactional emails.

**Key exports**:
- Resend client: `createEmailClient`, `sendEmail`
- Templates: `WelcomeEmail`, `PasswordResetEmail`, `MFARecoveryEmail`, `AlertEmail`
- Components: `EmailHeader`, `EmailFooter`, `EmailSection`, `EmailButton`
- Types: `SendEmailResult`, `EmailConfig`

**Special Notes**:
- React components that render as HTML (not JSX in browser)
- Use inline styles for email clients
- Test by rendering and validating HTML output
- No styling libraries - use inline styles for email compatibility

**Testing**: Render tests, HTML validation, visual regression tests.

### @caffeinebounce/ai-assistant

**Purpose**: AI chat panel, conversation context, and AI-powered features.

**Key exports**:
- Components: `AIChatPanel`, `AIConversation`
- Context: `AIContext`, `useAI()` hook
- Utilities: `useAICapability()`, `parseAIResponse()`
- Types: `Message`, `ConversationState`, `AIConfig`

**Special Notes**:
- Client-side only (hooks, context, React components)
- Integrates with external AI API (vendor agnostic in design)
- Manages conversation state and history
- Streaming response handling

**Testing**: Hook tests with @testing-library/react, integration tests.

### @caffeinebounce/logger

**Purpose**: Structured logging with Logtail integration for server & admin logs.

**Key exports**:
- Standard logger: `logger` instance
- Admin logger: `adminLogger` instance
- Auth logger: `authLogger` instance (auth event tracking)
- Utilities: `createLogger`, `LogLevel` enum
- Types: `LogEntry`, `LoggerConfig`

**Special Notes**:
- Server-side only (no browser/client code)
- Integrates with Logtail for log aggregation
- Environment-aware (dev vs production behavior)
- Structured JSON logging

**Testing**: Logger output validation, integration tests with mock Logtail.

## Architecture Principles

### Component Reusability

- **Generic over specific**: Components should work across projects, not just Compass
- **Prop-driven**: Accept all options as props; avoid hardcoded values
- **Composable**: Small, focused components that combine well
- **Themeable**: Expose styling customization via props or CSS variables

### Dependency Management

- **Minimal dependencies**: Avoid unnecessary third-party packages
- **React & TypeScript only**: Don't force consumers to install extra libraries
- **Peer dependencies**: Use `peerDependencies` for React/ReactDOM
- **Lock versions carefully**: Only lock critical versions; allow reasonable ranges

### Export Strategy

Each package has a primary entry point and optional secondary entry points:

```json
{
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.mjs", "require": "./dist/index.js" },
    "./server": { ... },
    "./styles.css": "./dist/styles.css"
  }
}
```

This allows:
```typescript
// Main imports
import { Button, Dialog } from "@caffeinebounce/ui";
import { SigninForm } from "@caffeinebounce/identity";

// Server imports (identity only)
import { validateToken } from "@caffeinebounce/identity/server";

// Styles
import "@caffeinebounce/ui/styles.css";
```

## CI/CD & Auto-Publish System

### Workflows in shared-packages

**`ci.yml`** - Quality checks (on push to main or PR):
1. Install dependencies
2. Lint (Biome)
3. Build packages

**`publish.yml`** - Release & notify consumers (on push to main with changeset changes):
1. Install dependencies
2. Lint & build
3. Use Changesets to version packages
4. Publish to GitHub Packages
5. Trigger consumer repos (Compass, etc.) to auto-update

### How Packages Get to Consumers

```
Developer commits changeset to shared-packages
    ↓
PR merged to main
    ↓
Changesets action creates version bump PR
    ↓
Version bump PR merged
    ↓
publish.yml workflow runs:
  - Version packages
  - Publish to GitHub Packages
  - Notify Compass (via repository_dispatch)
    ↓
Compass receives update notification
    ↓
update-shared-packages.yml workflow runs:
  - Update package.json with latest versions
  - Validate (lint, build)
  - Create PR in Compass
    ↓
Manual review & merge in Compass
```

### GitHub Packages Authentication

Publishing and consuming packages requires `.npmrc` configuration:

**In this repo (.npmrc):**
```ini
@caffeinebounce:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

This uses GitHub's `GITHUB_TOKEN` which is automatically available in Actions.

### Manual Publishing (if needed)

```bash
# View what will be published
yarn changeset status

# Update versions in package.json files
yarn version-packages

# Publish to GitHub Packages
yarn release

# Or manually with npm/yarn
npm publish --registry https://npm.pkg.github.com
```

### Monitoring Releases

Check published versions:
```bash
npm view @caffeinebounce/ui versions

# Or on GitHub Packages page:
# https://github.com/caffeinebounce/shared-packages/packages/
```

## Common Patterns

### Creating a New Component

1. Create file: `packages/ui/src/components/MyComponent.tsx`
2. Add TypeScript interfaces
3. Implement component with Tailwind classes
4. Write tests: `MyComponent.test.tsx`
5. Export from package index: `export { MyComponent } from "./components/MyComponent";`
6. Create Changeset: `yarn changeset` (select patch/minor/major)
7. Commit with conventional message: `feat(ui): add MyComponent`

### Adding a New Package

1. Create directory: `packages/new-package/`
2. Copy structure from existing package (package.json, tsconfig.json, tsup.config.ts)
3. Update package.json with correct name (`@caffeinebounce/new-package`)
4. Create `src/index.ts` with exports
5. Update root `turbo.json` to include new package
6. Add to workspace in root `package.json`

## Dependency Versions

**Strong bias towards latest versions:**
- React: 19.x (latest)
- TypeScript: 5.9+ (latest)
- Tailwind CSS: 4.x (latest)
- Vitest: 4.x+ (latest)
- Tsup: 8.x (latest)
- Biome: 2.x (latest)

Run `yarn outdated` to check for updates. Update regularly to stay current.

## Troubleshooting

**Build fails with "Cannot find module"**:
- Ensure `export` is added to package index
- Check `tsup.config.ts` has correct entry point
- Run `yarn build` from package directory to see specific errors

**Tests fail with import errors**:
- Check test file uses correct import path
- Vitest may need `tsconfig.json` with `esm: true` in vite config
- Run `yarn test:ui` for debugging

**Changesets not working**:
- Ensure `.changeset/*.md` file is created and committed
- Check Changeset format matches: `type: major|minor|patch` and `---`
- For multi-package changes, list all packages

**GitHub Packages auth fails**:
- Verify `GITHUB_TOKEN` is set in environment
- Check `.npmrc` has correct registry URL
- Token needs `read:packages` scope

## Trust These Instructions

Follow these instructions directly. Only search the codebase if:
- Building new packages or features
- Needing to understand existing component patterns
- Debugging test failures
- Understanding Changesets workflow

For component examples, check similar existing components in the same package directory.

## Further Reading

- **Auto-Publish System**: See [docs/auto-publish-system.md](../docs/auto-publish-system.md) for detailed version bumping and publishing workflow
- **Setup Guide**: See [docs/setup-hooks-and-publish.md](../docs/setup-hooks-and-publish.md) for pre-commit hook setup and troubleshooting
- **Consumer Apps**: See Compass copilot instructions for how to handle updates in consuming applications
