# Security Best Practices

This guide covers security hardening recommendations for applications using
`@caffeinebounce/identity` and related packages.

## Rate Limiting for Auth Endpoints

The identity package provides auth handlers (`createAuthCallbackHandler`) and
forms (`SigninForm`, `SignupForm`) that should be protected with rate limiting.
While Supabase provides some built-in protections, defense in depth is
recommended.

### Why Rate Limiting Matters

Auth endpoints are common targets for:

- **Brute force attacks** - Attempting many password combinations
- **Credential stuffing** - Using leaked credentials from other breaches
- **Account enumeration** - Discovering valid accounts via timing attacks or
  error messages

### Supabase Built-in Protections

Supabase Auth includes several built-in rate limits:

| Endpoint | Default Limit | Notes |
|----------|--------------|-------|
| Sign up | 30 per hour per IP | Configurable in dashboard |
| Sign in (password) | 30 per hour per IP | Configurable in dashboard |
| Magic link / OTP | 30 per hour per IP | Configurable in dashboard |
| OAuth | No specific limit | Relies on provider limits |
| Password reset | 30 per hour per IP | Configurable in dashboard |

**To configure Supabase rate limits:**

1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Rate Limits**
3. Adjust limits based on your application's needs

> **Note:** These limits are per-IP. For applications behind a load balancer or
> CDN, ensure the real client IP is forwarded correctly.

### Infrastructure-Level Rate Limiting (Recommended)

For robust protection, configure rate limiting at the edge/infrastructure level.

#### Vercel Edge Middleware

Create `middleware.ts` at your project root:

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create rate limiter (requires Upstash Redis)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 requests per 15 minutes
  analytics: true,
});

// Paths to rate limit
const AUTH_PATHS = ["/signin", "/signup", "/forgot-password", "/callback"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate limit auth paths
  if (!AUTH_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get client IP (handles proxies/CDN)
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "unknown";

  const { success, limit, remaining, reset } = await ratelimit.limit(
    `auth:${ip}`
  );

  if (!success) {
    return new NextResponse("Too many requests. Please try again later.", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
        "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/signup", "/forgot-password", "/callback/:path*"],
};
```

#### Cloudflare Rate Limiting Rules

If using Cloudflare:

1. Go to **Security > WAF > Rate limiting rules**
2. Create a rule:
   - **Name:** Auth endpoint protection
   - **Expression:** `(http.request.uri.path contains "/signin") or
     (http.request.uri.path contains "/signup") or
     (http.request.uri.path contains "/callback")`
   - **Characteristics:** IP
   - **Rate:** 10 requests per 10 minutes
   - **Action:** Block for 15 minutes

#### AWS WAF / CloudFront

For AWS-hosted applications, use AWS WAF rate-based rules:

```json
{
  "Name": "AuthEndpointRateLimit",
  "Priority": 1,
  "Statement": {
    "RateBasedStatement": {
      "Limit": 100,
      "AggregateKeyType": "IP",
      "ScopeDownStatement": {
        "ByteMatchStatement": {
          "FieldToMatch": { "UriPath": {} },
          "PositionalConstraint": "STARTS_WITH",
          "SearchString": "/signin"
        }
      }
    }
  },
  "Action": { "Block": {} },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "AuthRateLimit"
  }
}
```

### Client-Side Hardening (Optional)

For additional UX-friendly protection, implement client-side attempt tracking:

```typescript
// utils/auth-attempts.ts
const STORAGE_KEY = "auth_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptData {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

export function recordFailedAttempt(): { locked: boolean; remaining: number } {
  const data = getAttemptData();
  const now = Date.now();

  // Reset if lockout expired
  if (data.lockedUntil && now > data.lockedUntil) {
    clearAttempts();
    return { locked: false, remaining: MAX_ATTEMPTS };
  }

  // Check if already locked
  if (data.lockedUntil && now < data.lockedUntil) {
    return { locked: true, remaining: 0 };
  }

  // Reset count if window expired (1 hour)
  if (now - data.firstAttempt > 60 * 60 * 1000) {
    data.count = 0;
    data.firstAttempt = now;
  }

  data.count++;

  // Lock if max attempts reached
  if (data.count >= MAX_ATTEMPTS) {
    data.lockedUntil = now + LOCKOUT_MS;
    saveAttemptData(data);
    return { locked: true, remaining: 0 };
  }

  saveAttemptData(data);
  return { locked: false, remaining: MAX_ATTEMPTS - data.count };
}

export function clearAttempts(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

function getAttemptData(): AttemptData {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { count: 0, firstAttempt: Date.now() };
  }
  return JSON.parse(stored);
}

function saveAttemptData(data: AttemptData): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
```

Usage in your sign-in form:

```typescript
import { recordFailedAttempt, clearAttempts } from "@/utils/auth-attempts";

// On failed login
const { locked, remaining } = recordFailedAttempt();
if (locked) {
  setError("Too many failed attempts. Please try again in 15 minutes.");
  return;
}
if (remaining < 3) {
  setWarning(`${remaining} attempts remaining before temporary lockout.`);
}

// On successful login
clearAttempts();
```

> **Note:** Client-side rate limiting is easily bypassed and should only be used
> as a UX enhancement, not a security control. Always implement server-side
> rate limiting.

### Additional Security Recommendations

1. **Use HTTPS everywhere** - Never transmit credentials over HTTP

2. **Implement CAPTCHA** - Consider adding reCAPTCHA or hCaptcha after 2-3
   failed attempts

3. **Monitor auth logs** - Set up alerts for unusual patterns:
   - Multiple failed logins from same IP
   - Logins from new geographic locations
   - Unusual time-of-day activity

4. **Use MFA** - The identity package supports MFA via Supabase. Encourage or
   require users to enable it.

5. **Secure session configuration** - Ensure cookies use:
   - `HttpOnly` flag
   - `Secure` flag (HTTPS only)
   - `SameSite=Lax` or `Strict`

## Related Resources

- [Supabase Auth Rate Limits](https://supabase.com/docs/guides/auth/rate-limits)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Vercel Edge Middleware](https://vercel.com/docs/functions/edge-middleware)
- [Upstash Rate Limiting](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview)
