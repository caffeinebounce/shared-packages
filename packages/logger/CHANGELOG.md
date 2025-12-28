# @caffeinebounce/logger

## 0.2.0

### Minor Changes

- 9bd8a6b: Add error logging utilities and hooks for standardized error handling

  - Add `error-logger.ts` with correlation ID generation and error extraction utilities
  - Add `use-error-logger.ts` client hook for component error logging with Better Stack
  - Add `form-error-logger.ts` with form-specific error logging utilities
  - Export new types and utilities for error handling in all services
