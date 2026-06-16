# @caffeinebounce/logger

## 0.9.132

### Patch Changes

- f672ce8: Switch package license metadata from `UNLICENSED` to `MIT`.

## 0.9.131

### Patch Changes

- f389e8e: Replace several regex-based helpers with bounded string logic to clear
  post-public CodeQL alerts.
- e3d1867: Disable published source maps and update package metadata for
  the public-readiness sweep.

## 0.9.130

### Patch Changes

- Sync the changelog header with the current package version so CI can enforce current changelog coverage going forward.

## 0.9.7

### Patch Changes

- 49348f2: Suppress logger token warnings in CI environments to reduce noise in build logs

## 0.9.6

### Patch Changes

- c56d519: Add DEPLOYMENT_ENV environment variable override for explicit environment detection. Set DEPLOYMENT_ENV=preview on persistent preview environments to correctly identify them in logs.

## 0.9.3

### Patch Changes

- 3660ab4: Security fix: Sanitize SQL queries from error messages returned to clients

  - Added `sanitizeErrorMessageForClient` function to strip SQL queries and database schema details from API error responses
  - Error messages containing SQL patterns (SELECT, INSERT, UPDATE, DELETE, JOIN, etc.) are now replaced with user-friendly messages
  - Full error details are still logged server-side for debugging
  - Known PostgreSQL error codes (23505, 23503, 22P02, etc.) now return friendly messages
  - Quoted identifiers like "table_name" are sanitized to prevent schema leakage

  This prevents accidental exposure of database implementation details to end users while maintaining full debugging capability in logs.

## 0.6.0

### Minor Changes

- c009dc0: Fix @logtail/next dynamic require() issue with Turbopack

  - Added `@caffeinebounce/logger/client` export with `useErrorLoggerSafe` hook that doesn't import @logtail/next
  - Updated identity package components to use the client-safe logger hook
  - This fixes SSG/SSR build errors when using identity components with Next.js Turbopack

## 0.5.3

### Patch Changes

- e6340ae: Fix next/server import to use .js extension for ESM compatibility

## 0.5.2

### Patch Changes

- 3e58f9a: Enhance DataTable with column/row drag-drop, export button, and styling improvements

  **DataTable Enhancements:**

  - Add DataTableContext for shared state (density, font size, column wrapping)
  - Add column drag/drop reordering via ViewOptions panel
  - Add row drag/drop reordering with visual drag handles
  - Add DataTableAddButton component for standardized add actions
  - Add DataTableExportButton with loading state and tooltip
  - Add WrapText toggle to column header menu
  - Update comfy density padding for better visual balance
  - Add data-table-styles.ts for consistent topper button styling

  **UI Component Updates:**

  - Add 'success' variant to IconButton for green hover effect
  - Add 'icon-xs' size to Button component
  - Fix min-width overflow in AdminPageLayout and AppLayout

  **Logger Fix:**

  - Fix api-wrapper.ts Next.js cross-version type compatibility

## 0.5.1

### Patch Changes

- aeca27f: Fix ESM import path for next/server to use .js extension for Next.js 16 compatibility

## 0.5.0

### Minor Changes

- b295324: feat(logger): Add `withErrorLogging` API route wrapper

  Adds a higher-order function to wrap Next.js API route handlers with automatic:

  - Correlation ID generation/propagation (`x-correlation-id` header)
  - Structured error logging with full context
  - Standardized error responses (`ApiErrorCode`)
  - Supabase and validation error context extraction
  - Nested error cause chain extraction for postgres.js and similar libraries

  Usage:

  ```typescript
  import { withErrorLogging } from "@caffeinebounce/logger";

  export const GET = withErrorLogging(
    async (req) => NextResponse.json({ data }),
    { endpoint: "/api/example", method: "GET" }
  );
  ```

  New exports:

  - `withErrorLogging` - API route wrapper function
  - `ApiHandler` - Type for wrapped handlers
  - `ErrorLoggingContext` - Context type for the wrapper
  - `ApiErrorCode` - Standardized error code type

## 0.4.0

### Minor Changes

- Add deployment environment detection for PR preview environments

  - New `detectDeploymentEnvironment()` utility to identify development/preview/production
  - Detects Render PR previews via hostname pattern (compass-pr-\*.onrender.com)
  - Also detects Vercel and Netlify preview environments
  - Logger now includes `deploymentEnvironment` field in all log entries
  - Enables filtering PR preview logs from production in Better Stack

## 0.3.0

### Minor Changes

- a4251c0: UI fixes

## 0.2.0

### Minor Changes

- 9bd8a6b: Add error logging utilities and hooks for standardized error handling

  - Add `error-logger.ts` with correlation ID generation and error extraction utilities
  - Add `use-error-logger.ts` client hook for component error logging with Better Stack
  - Add `form-error-logger.ts` with form-specific error logging utilities
  - Export new types and utilities for error handling in all services
