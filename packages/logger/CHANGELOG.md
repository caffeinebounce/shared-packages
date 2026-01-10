# @caffeinebounce/logger

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
