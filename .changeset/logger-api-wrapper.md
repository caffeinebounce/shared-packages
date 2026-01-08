---
"@caffeinebounce/logger": minor
---

feat(logger): Add `withErrorLogging` API route wrapper

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
