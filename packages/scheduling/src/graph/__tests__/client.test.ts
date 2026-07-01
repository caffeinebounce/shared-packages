import { describe, expect, it, vi } from "vitest";
import type { SchedulingConfig } from "../../ports";
import { GraphClient, GraphError } from "../client";

const cfg: SchedulingConfig = {
  microsoft: {
    clientId: "c",
    clientSecret: "s",
    tenantId: "t",
    organizerId: "o",
  },
  encryptionSecret: "e",
  publicBaseUrl: "https://scheduler.example",
};

/** Minimal Response-like stub so tests don't depend on a global fetch/Response. */
function resp(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (k: string) => headers[k] ?? null },
    json: async () => (typeof body === "string" ? JSON.parse(body) : body),
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  } as unknown as Response;
}

const isTokenUrl = (url: string) => url.includes("/oauth2/v2.0/token");

describe("GraphClient.getAppToken", () => {
  it("caches the app token until shortly before expiry", async () => {
    let tokenCalls = 0;
    let nowMs = 1_000_000;
    const fetchImpl = vi.fn(async (url: string) => {
      if (isTokenUrl(url)) {
        tokenCalls++;
        return resp(200, {
          access_token: `tok${tokenCalls}`,
          expires_in: 3600,
        });
      }
      return resp(200, {});
    });
    const client = new GraphClient(cfg, {
      fetch: fetchImpl,
      clock: { now: () => nowMs },
      sleep: async () => {},
    });

    expect(await client.getAppToken()).toBe("tok1");
    expect(await client.getAppToken()).toBe("tok1"); // cached
    expect(tokenCalls).toBe(1);

    nowMs += 3_600_000; // advance past the (expires_in - 60s) cache window
    expect(await client.getAppToken()).toBe("tok2");
    expect(tokenCalls).toBe(2);
  });
});

describe("GraphClient.request", () => {
  const tokenOk = (url: string) =>
    isTokenUrl(url)
      ? resp(200, { access_token: "tok", expires_in: 3600 })
      : null;

  it("retries on 429 honouring Retry-After, then succeeds", async () => {
    let dataCalls = 0;
    const sleep = vi.fn(async () => {});
    const fetchImpl = vi.fn(async (url: string) => {
      return (
        tokenOk(url) ??
        (() => {
          dataCalls++;
          return dataCalls === 1
            ? resp(429, "throttled", { "Retry-After": "1" })
            : resp(200, { id: "123" });
        })()
      );
    });
    const client = new GraphClient(cfg, { fetch: fetchImpl, sleep });

    expect(await client.request<{ id: string }>("/me")).toEqual({ id: "123" });
    expect(dataCalls).toBe(2);
    expect(sleep).toHaveBeenCalledOnce();
  });

  it("returns undefined for 204 No Content", async () => {
    const fetchImpl = vi.fn(
      async (url: string) => tokenOk(url) ?? resp(204, ""),
    );
    const client = new GraphClient(cfg, {
      fetch: fetchImpl,
      sleep: async () => {},
    });
    expect(await client.request("/x", { method: "DELETE" })).toBeUndefined();
  });

  it("returns raw text when requested", async () => {
    const fetchImpl = vi.fn(
      async (url: string) => tokenOk(url) ?? resp(200, "WEBVTT\n\n00:00"),
    );
    const client = new GraphClient(cfg, {
      fetch: fetchImpl,
      sleep: async () => {},
    });
    expect(await client.request<string>("/t", { raw: true })).toContain(
      "WEBVTT",
    );
  });

  it("throws GraphError with the Graph error code on failure", async () => {
    const fetchImpl = vi.fn(
      async (url: string) =>
        tokenOk(url) ?? resp(403, { error: { code: "Forbidden" } }),
    );
    const client = new GraphClient(cfg, {
      fetch: fetchImpl,
      sleep: async () => {},
    });
    await expect(client.request("/denied")).rejects.toMatchObject({
      name: "GraphError",
      status: 403,
      graphCode: "Forbidden",
    });
    expect(GraphError).toBeDefined();
  });
});
