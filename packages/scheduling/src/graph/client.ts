/**
 * Low-level Microsoft Graph HTTP client.
 *
 * Improvements over the factory-careers original that this kernel needs:
 *   - app-only (client-credentials) token is **cached** until ~60s before expiry
 *     instead of being re-fetched on every call,
 *   - automatic retry with backoff on 429/503 honouring `Retry-After`,
 *   - selectable `v1.0` / `beta` base URL (the auto-record fields are beta-only).
 *
 * All side-effecting dependencies (fetch, clock, sleep, logger) are injected so
 * the client is fully testable with in-memory fakes.
 */
import type { Clock, FetchLike, Logger, SchedulingConfig } from "../ports";
import { noopLogger, systemClock } from "../ports";

export type GraphVersion = "v1.0" | "beta";

export interface GraphClientDeps {
  fetch?: FetchLike;
  clock?: Clock;
  logger?: Logger;
  /** Delay helper (injected so tests don't actually wait). */
  sleep?: (ms: number) => Promise<void>;
  /** Max retries on throttling/5xx (default 3). */
  maxRetries?: number;
}

export interface GraphRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  version?: GraphVersion;
  /** Override the bearer token (e.g. a delegated user token); defaults to the app token. */
  token?: string;
  /** Return the raw text body instead of parsed JSON (e.g. transcript VTT). */
  raw?: boolean;
  /** Extra headers (e.g. `Accept` for VTT). */
  headers?: Record<string, string>;
}

export class GraphError extends Error {
  constructor(
    public status: number,
    public graphCode: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = "GraphError";
  }
}

const GRAPH_BASE = "https://graph.microsoft.com";

export class GraphClient {
  private appToken: { value: string; expiresAt: number } | null = null;
  private readonly fetchImpl: FetchLike;
  private readonly clock: Clock;
  private readonly logger: Logger;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly maxRetries: number;

  constructor(
    private readonly config: SchedulingConfig,
    deps: GraphClientDeps = {},
  ) {
    this.fetchImpl = deps.fetch ?? ((input, init) => fetch(input, init));
    this.clock = deps.clock ?? systemClock;
    this.logger = deps.logger ?? noopLogger;
    this.sleep = deps.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
    this.maxRetries = deps.maxRetries ?? 3;
  }

  /** Acquire (and cache) an app-only access token via the client-credentials grant. */
  async getAppToken(): Promise<string> {
    const now = this.clock.now();
    if (this.appToken && this.appToken.expiresAt > now)
      return this.appToken.value;

    const { tenantId, clientId, clientSecret } = this.config.microsoft;
    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: `${GRAPH_BASE}/.default`,
    });

    const res = await this.fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new GraphError(
        res.status,
        undefined,
        `Token request failed: ${text}`,
      );
    }
    const json = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    // Refresh 60s early to avoid races at the boundary.
    this.appToken = {
      value: json.access_token,
      expiresAt: now + (json.expires_in - 60) * 1000,
    };
    return this.appToken.value;
  }

  /** Perform a Graph request with auth, throttling backoff, and JSON/text handling. */
  async request<T>(path: string, opts: GraphRequestOptions = {}): Promise<T> {
    const version = opts.version ?? "v1.0";
    const url = `${GRAPH_BASE}/${version}${path}`;
    const token = opts.token ?? (await this.getAppToken());

    for (let attempt = 0; ; attempt++) {
      const res = await this.fetchImpl(url, {
        method: opts.method ?? "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          ...(opts.body !== undefined
            ? { "Content-Type": "application/json" }
            : {}),
          ...opts.headers,
        },
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      });

      if (
        (res.status === 429 || res.status === 503) &&
        attempt < this.maxRetries
      ) {
        const retryAfter =
          Number(res.headers.get("Retry-After")) || 2 ** attempt;
        this.logger.warn("graph.throttled", {
          path,
          status: res.status,
          attempt,
          retryAfter,
        });
        await this.sleep(retryAfter * 1000);
        continue;
      }

      if (res.status === 204) return undefined as T;

      if (!res.ok) {
        const text = await res.text();
        const code = safeGraphCode(text);
        this.logger.error("graph.request_failed", {
          path,
          status: res.status,
          code,
        });
        throw new GraphError(
          res.status,
          code,
          `Graph ${opts.method ?? "GET"} ${path} → ${res.status}: ${text}`,
        );
      }

      return opts.raw ? ((await res.text()) as T) : ((await res.json()) as T);
    }
  }
}

function safeGraphCode(text: string): string | undefined {
  try {
    return (JSON.parse(text) as { error?: { code?: string } }).error?.code;
  } catch {
    return undefined;
  }
}
