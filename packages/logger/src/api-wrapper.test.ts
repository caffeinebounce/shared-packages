import { type NextRequest, NextResponse } from "next/server.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type ApiErrorCode,
  type ApiHandler,
  type ErrorLoggingContext,
  sanitizeErrorMessageForClient,
  withErrorLogging,
} from "./api-wrapper";

// Mock the logger module
vi.mock("./logger", () => ({
  getServerLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

// Mock the error-logger module for test isolation
// getOrGenerateCorrelationId needs to actually check headers for some tests
vi.mock("./error-logger", () => ({
  createApiErrorResponse: vi.fn(
    (message: string, correlationId: string, _details?: unknown) => ({
      error: message,
      correlationId,
      timestamp: new Date().toISOString(),
    }),
  ),
  extractSupabaseErrorContext: vi.fn(() => ({})),
  extractValidationErrorContext: vi.fn(() => ({})),
  // Mock receives the request object (with headers.get method), just like the real function
  getOrGenerateCorrelationId: vi.fn(
    (req: { headers: { get: (name: string) => string | null } }) => {
      // Check for existing correlation headers like the real implementation
      const existing =
        req.headers.get("x-correlation-id") || req.headers.get("x-request-id");
      if (existing) return existing;
      return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    },
  ),
}));

// Helper to create mock NextRequest
function createMockRequest(
  options: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
  } = {},
): NextRequest {
  const url = options.url || "http://localhost:3000/api/test";
  const headers = new Headers(options.headers || {});

  return {
    url,
    method: options.method || "GET",
    headers: {
      get: (name: string) => headers.get(name),
      has: (name: string) => headers.has(name),
      entries: () => headers.entries(),
      keys: () => headers.keys(),
      values: () => headers.values(),
      forEach: headers.forEach.bind(headers),
    },
    nextUrl: new URL(url),
    json: vi.fn(),
    text: vi.fn(),
    formData: vi.fn(),
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
  } as unknown as NextRequest;
}

describe("withErrorLogging", () => {
  const defaultContext: ErrorLoggingContext = {
    endpoint: "/api/test",
    method: "GET",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("successful requests", () => {
    it("should execute handler and return response", async () => {
      const mockHandler: ApiHandler<undefined> = async (_req) => {
        return NextResponse.json({ success: true });
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ success: true });
    });

    it("should add correlation ID header to successful response", async () => {
      const mockHandler: ApiHandler<undefined> = async (_req) => {
        return NextResponse.json({ success: true });
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      expect(response.headers.get("x-correlation-id")).toBeTruthy();
    });

    it("should preserve existing correlation ID from request", async () => {
      const existingCorrelationId = "existing-correlation-123";
      const mockHandler: ApiHandler<undefined> = async (_req) => {
        return NextResponse.json({ success: true });
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest({
        headers: { "x-correlation-id": existingCorrelationId },
      });
      const response = await wrappedHandler(request);

      expect(response.headers.get("x-correlation-id")).toBe(
        existingCorrelationId,
      );
    });

    it("should accept x-request-id header as correlation ID", async () => {
      const requestId = "request-id-456";
      const mockHandler: ApiHandler<undefined> = async (_req) => {
        return NextResponse.json({ success: true });
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest({
        headers: { "x-request-id": requestId },
      });
      const response = await wrappedHandler(request);

      expect(response.headers.get("x-correlation-id")).toBe(requestId);
    });
  });

  describe("error handling", () => {
    it("should catch errors and return standardized error response", async () => {
      const errorMessage = "Something went wrong";
      const mockHandler: ApiHandler<undefined> = async (_req) => {
        throw new Error(errorMessage);
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe(errorMessage);
      expect(body.correlationId).toBeTruthy();
      expect(body.timestamp).toBeTruthy();
      expect(body.code).toBe("internal_error");
    });

    it("should return 400 for validation errors", async () => {
      const mockHandler: ApiHandler<undefined> = async (_req) => {
        throw new Error("Validation failed: email is required");
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.code).toBe("validation_error");
    });

    it("should return 401 for unauthorized errors", async () => {
      const mockHandler: ApiHandler<undefined> = async (_req) => {
        throw new Error("User is not authenticated");
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.code).toBe("unauthorized");
    });

    it("should return 403 for forbidden errors", async () => {
      const mockHandler: ApiHandler<undefined> = async (_req) => {
        throw new Error("Access forbidden for this resource");
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.code).toBe("forbidden");
    });

    it("should return 404 for not found errors", async () => {
      const mockHandler: ApiHandler<undefined> = async (_req) => {
        throw new Error("Resource not found");
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.code).toBe("not_found");
    });

    it("should use status code from error object if present", async () => {
      const mockHandler: ApiHandler<undefined> = async (_req) => {
        const error = new Error("Custom error") as Error & { status: number };
        error.status = 422;
        throw error;
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      expect(response.status).toBe(422);
    });

    it("should handle Supabase-style errors with code property", async () => {
      const mockHandler: ApiHandler<undefined> = async (_req) => {
        throw {
          message: "Database constraint violation",
          code: "23505",
          details: "Duplicate key value",
        };
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      const body = await response.json();
      expect(body.code).toBe("supabase_error");
      expect(body.error).toContain("Database");
    });

    it("should add correlation ID to error response", async () => {
      const mockHandler: ApiHandler<undefined> = async (_req) => {
        throw new Error("Test error");
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      expect(response.headers.get("x-correlation-id")).toBeTruthy();
    });
  });

  describe("context handling", () => {
    it("should pass route context to handler for dynamic routes", async () => {
      interface RouteContext {
        params: { id: string };
      }

      const receivedContext: RouteContext[] = [];
      const mockHandler: ApiHandler<RouteContext> = async (_req, context) => {
        receivedContext.push(context);
        return NextResponse.json({ id: context.params.id });
      };

      const wrappedHandler = withErrorLogging(mockHandler, {
        endpoint: "/api/items/[id]",
        method: "GET",
      });

      const request = createMockRequest();
      const routeContext: RouteContext = { params: { id: "123" } };
      await wrappedHandler(request, routeContext);

      expect(receivedContext).toHaveLength(1);
      expect(receivedContext[0].params.id).toBe("123");
    });
  });

  describe("correlation ID generation", () => {
    it("should generate correlation ID with expected format when not provided", async () => {
      const mockHandler: ApiHandler<undefined> = async (_req) => {
        return NextResponse.json({ success: true });
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      const correlationId = response.headers.get("x-correlation-id");
      expect(correlationId).toBeTruthy();
      // Generated correlation ID should match expected format
      expect(correlationId).toMatch(/^req-\d+-[a-z0-9]+$/);
    });
  });

  describe("nested error cause extraction", () => {
    it("should extract nested cause from Error with cause chain", async () => {
      const rootCause = new Error("Database connection failed");
      const wrappedError = new Error("Query failed", { cause: rootCause });

      const mockHandler: ApiHandler<undefined> = async () => {
        throw wrappedError;
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      expect(response.status).toBe(500);
    });

    it("should handle postgres.js style errors with query and parameters", async () => {
      const postgresError = Object.assign(new Error("duplicate key value"), {
        code: "23505",
        severity: "ERROR",
        detail: "Key (email)=(test@example.com) already exists.",
        hint: "Use UPDATE instead of INSERT",
        constraint: "users_email_unique",
        query: "INSERT INTO users (email) VALUES ($1)",
        parameters: ["test@example.com"],
      });

      const mockHandler: ApiHandler<undefined> = async () => {
        throw postgresError;
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      expect(response.status).toBe(500);
    });

    it("should handle deeply nested cause chains with max depth", async () => {
      // Create a chain of errors exceeding MAX_CAUSE_DEPTH (10)
      let error: Error = new Error("Root cause");
      for (let i = 0; i < 15; i++) {
        error = new Error(`Level ${i}`, { cause: error });
      }

      const mockHandler: ApiHandler<undefined> = async () => {
        throw error;
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      // Should complete without infinite loop
      expect(response.status).toBe(500);
    });

    it("should handle errors with various postgres properties", async () => {
      const detailedPostgresError = Object.assign(
        new Error("syntax error at or near"),
        {
          code: "42601",
          severity: "ERROR",
          position: "15",
          query: "SELECT * FORM users", // intentional typo
        },
      );

      const mockHandler: ApiHandler<undefined> = async () => {
        throw detailedPostgresError;
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      expect(response.status).toBe(500);
    });

    it("should handle non-Error object causes", async () => {
      const errorWithObjectCause = Object.assign(new Error("Wrapped error"), {
        cause: { type: "network", message: "Connection timeout" },
      });

      const mockHandler: ApiHandler<undefined> = async () => {
        throw errorWithObjectCause;
      };

      const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
      const request = createMockRequest();
      const response = await wrappedHandler(request);

      expect(response.status).toBe(500);
    });
  });
});

describe("ApiErrorCode type", () => {
  it("should include all expected error codes", () => {
    const validCodes: ApiErrorCode[] = [
      "validation_error",
      "unauthorized",
      "forbidden",
      "not_found",
      "conflict",
      "rate_limited",
      "supabase_error",
      "internal_error",
    ];

    // TypeScript will error if any code is not valid
    expect(validCodes).toHaveLength(8);
  });
});

describe("sanitizeErrorMessageForClient", () => {
  describe("SQL query detection and sanitization", () => {
    it("should sanitize SELECT queries", () => {
      const sqlMessage =
        'Failed query: select "services"."id", "services"."business_id" from "services" where "services"."id" = $1 limit $2 params: 1,1';
      const result = sanitizeErrorMessageForClient(sqlMessage);
      expect(result).not.toContain("select");
      expect(result).not.toContain("services");
      expect(result).not.toContain("$1");
      expect(result).toBe("A database error occurred");
    });

    it("should sanitize INSERT queries", () => {
      const sqlMessage =
        'INSERT INTO "users" ("email", "name") VALUES ($1, $2)';
      const result = sanitizeErrorMessageForClient(sqlMessage);
      expect(result).not.toContain("INSERT");
      expect(result).not.toContain("users");
      expect(result).toBe("A database error occurred");
    });

    it("should sanitize UPDATE queries", () => {
      const sqlMessage = 'UPDATE "profiles" SET "name" = $1 WHERE "id" = $2';
      const result = sanitizeErrorMessageForClient(sqlMessage);
      expect(result).not.toContain("UPDATE");
      expect(result).not.toContain("profiles");
      expect(result).toBe("A database error occurred");
    });

    it("should sanitize DELETE queries", () => {
      const sqlMessage = 'DELETE FROM "sessions" WHERE "expired" = true';
      const result = sanitizeErrorMessageForClient(sqlMessage);
      expect(result).not.toContain("DELETE");
      expect(result).not.toContain("sessions");
      expect(result).toBe("A database error occurred");
    });

    it("should sanitize complex JOIN queries", () => {
      const sqlMessage =
        'select "services"."id", "business_profiles"."name" from "services" inner join "business_profiles" on "services"."business_id" = "business_profiles"."id" where "services"."id" = $1';
      const result = sanitizeErrorMessageForClient(sqlMessage);
      expect(result).not.toContain("join");
      expect(result).not.toContain("services");
      expect(result).not.toContain("business_profiles");
      expect(result).toBe("A database error occurred");
    });

    it("should detect Failed query: prefix", () => {
      const sqlMessage = "Failed query: some query text";
      const result = sanitizeErrorMessageForClient(sqlMessage);
      expect(result).toBe("A database error occurred");
    });

    it("should detect params: suffix", () => {
      const sqlMessage = "Some error message params: 1, 2, 3";
      const result = sanitizeErrorMessageForClient(sqlMessage);
      expect(result).toBe("A database error occurred");
    });
  });

  describe("friendly messages based on error codes", () => {
    it("should use friendly message for unique violation (23505)", () => {
      const sqlMessage =
        'duplicate key value violates unique constraint "users_email_key"';
      const result = sanitizeErrorMessageForClient(sqlMessage, "23505");
      expect(result).toBe("A record with this value already exists");
    });

    it("should use friendly message for foreign key violation (23503)", () => {
      const sqlMessage =
        'insert or update on table "orders" violates foreign key constraint';
      const result = sanitizeErrorMessageForClient(sqlMessage, "23503");
      expect(result).toBe("This operation references data that doesn't exist");
    });

    it("should use friendly message for not null violation (23502)", () => {
      const sqlMessage =
        'null value in column "email" violates not-null constraint';
      const result = sanitizeErrorMessageForClient(sqlMessage, "23502");
      expect(result).toBe("Required information is missing");
    });

    it("should use friendly message for invalid input (22P02)", () => {
      const sqlMessage = 'invalid input syntax for type uuid: "not-a-uuid"';
      const result = sanitizeErrorMessageForClient(sqlMessage, "22P02");
      expect(result).toBe("Invalid input format");
    });
  });

  describe("message inference without error code", () => {
    it("should infer not found message", () => {
      const result = sanitizeErrorMessageForClient(
        'SELECT * FROM "users" WHERE "id" = $1 -- no rows returned, resource not found',
      );
      expect(result).toBe("The requested resource was not found");
    });

    it("should infer duplicate message", () => {
      const result = sanitizeErrorMessageForClient(
        'INSERT INTO "users" failed: duplicate key value',
      );
      expect(result).toBe("A record with this value already exists");
    });

    it("should infer required field message", () => {
      const result = sanitizeErrorMessageForClient(
        'INSERT INTO "users" failed: null value not allowed',
      );
      expect(result).toBe("Required information is missing");
    });

    it("should infer invalid format message", () => {
      const result = sanitizeErrorMessageForClient(
        'SELECT * FROM "users" WHERE "id" = $1 -- invalid uuid format',
      );
      expect(result).toBe("Invalid input format");
    });
  });

  describe("non-SQL messages", () => {
    it("should pass through safe error messages unchanged", () => {
      const message = "Invalid email format";
      const result = sanitizeErrorMessageForClient(message);
      expect(result).toBe("Invalid email format");
    });

    it("should pass through generic validation errors", () => {
      const message = "Password must be at least 8 characters";
      const result = sanitizeErrorMessageForClient(message);
      expect(result).toBe("Password must be at least 8 characters");
    });

    it("should sanitize quoted identifiers even in non-SQL messages", () => {
      const message = 'The field "user_password" is required';
      const result = sanitizeErrorMessageForClient(message);
      expect(result).toBe("The field [field] is required");
      expect(result).not.toContain("user_password");
    });

    it("should pass through simple error messages", () => {
      const message = "An unexpected error occurred";
      const result = sanitizeErrorMessageForClient(message);
      expect(result).toBe("An unexpected error occurred");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const result = sanitizeErrorMessageForClient("");
      expect(result).toBe("");
    });

    it("should handle message with only SQL keywords", () => {
      const result = sanitizeErrorMessageForClient("SELECT");
      expect(result).toBe("A database error occurred");
    });

    it("should handle case variations", () => {
      const result = sanitizeErrorMessageForClient(
        "select * FROM users WHERE id = 1",
      );
      expect(result).toBe("A database error occurred");
    });
  });
});

describe("withErrorLogging SQL sanitization", () => {
  const defaultContext: ErrorLoggingContext = {
    endpoint: "/api/test",
    method: "GET",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should sanitize SQL query in error response", async () => {
    const sqlError = new Error(
      'Failed query: select "services"."id", "services"."business_id" from "services" where "services"."id" = $1 limit $2 params: 1,1',
    );

    const mockHandler: ApiHandler<undefined> = async () => {
      throw sqlError;
    };

    const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
    const request = createMockRequest();
    const response = await wrappedHandler(request);

    const body = await response.json();
    expect(body.error).not.toContain("select");
    expect(body.error).not.toContain("services");
    expect(body.error).not.toContain("$1");
    expect(body.error).toBe("A database error occurred");
  });

  it("should sanitize postgres.js style errors with query property", async () => {
    const postgresError = Object.assign(new Error("syntax error"), {
      code: "42601",
      query: 'SELECT * FROM "users" WHERE "id" = $1',
      parameters: ["123"],
    });

    const mockHandler: ApiHandler<undefined> = async () => {
      throw postgresError;
    };

    const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
    const request = createMockRequest();
    const response = await wrappedHandler(request);

    const body = await response.json();
    expect(body.error).not.toContain("SELECT");
    expect(body.error).not.toContain("users");
  });

  it("should use friendly message for postgres error codes", async () => {
    const uniqueViolation = Object.assign(
      new Error(
        'duplicate key value violates unique constraint "users_email_key"',
      ),
      { code: "23505" },
    );

    const mockHandler: ApiHandler<undefined> = async () => {
      throw uniqueViolation;
    };

    const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
    const request = createMockRequest();
    const response = await wrappedHandler(request);

    const body = await response.json();
    expect(body.error).toBe("A record with this value already exists");
  });

  it("should preserve non-SQL error messages", async () => {
    const validationError = new Error("Email format is invalid");

    const mockHandler: ApiHandler<undefined> = async () => {
      throw validationError;
    };

    const wrappedHandler = withErrorLogging(mockHandler, defaultContext);
    const request = createMockRequest();
    const response = await wrappedHandler(request);

    const body = await response.json();
    expect(body.error).toBe("Email format is invalid");
  });
});
