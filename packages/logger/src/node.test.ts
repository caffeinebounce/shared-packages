// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The Node entry must never load Next.js, React, or the @logtail/next index
// (which requires next/navigation). Any such import fails these tests.
vi.mock("next", () => {
  throw new Error("node entry imported next");
});
vi.mock("next/server.js", () => {
  throw new Error("node entry imported next/server.js");
});
vi.mock("next/navigation", () => {
  throw new Error("node entry imported next/navigation");
});
vi.mock("@logtail/next", () => {
  throw new Error("node entry imported the @logtail/next index");
});
vi.mock("react", () => {
  throw new Error("node entry imported react");
});

const sink = vi.hoisted(() => ({
  instances: [] as Array<{
    debug: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    flush: ReturnType<typeof vi.fn>;
  }>,
  config: {} as Record<string, unknown>,
}));

vi.mock("@logtail/next/dist/config.js", () => ({ config: sink.config }));
vi.mock("@logtail/next/dist/logger.js", () => ({
  Logger: vi.fn(function BetterStackLogger(this: Record<string, unknown>) {
    const instance = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    };
    Object.assign(this, instance);
    sink.instances.push(this as unknown as (typeof sink.instances)[number]);
  }),
}));

async function loadNodeEntry() {
  vi.resetModules();
  return import("./node");
}

describe("@caffeinebounce/logger/node", () => {
  beforeEach(() => {
    sink.instances.length = 0;
    for (const key of Object.keys(sink.config)) {
      delete sink.config[key];
    }
    vi.stubEnv("BETTER_STACK_SOURCE_TOKEN", "");
    vi.stubEnv("LOGTAIL_SOURCE_TOKEN", "");
    vi.stubEnv("BETTER_STACK_INGESTING_URL", "");
    vi.stubEnv("LOGTAIL_URL", "");
    vi.stubEnv("CI", "true");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("falls back to console output when no token is configured", async () => {
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});
    const { getServerLogger, logger } = await loadNodeEntry();

    logger.info("Job finished", { event: "job.finished" });

    expect(getServerLogger()).toBeNull();
    expect(sink.instances).toHaveLength(0);
    expect(consoleInfo).toHaveBeenCalledWith("Job finished", {
      event: "job.finished",
    });
  });

  it("forwards to Better Stack with the configured token and ingesting URL", async () => {
    vi.stubEnv("BETTER_STACK_SOURCE_TOKEN", "test-source-token");
    vi.stubEnv("BETTER_STACK_INGESTING_URL", "https://ingest.example.test");
    const { logger } = await loadNodeEntry();

    logger.warn("Retrying", { event: "job.retry", attempt: 2 });

    expect(sink.config).toEqual({
      token: "test-source-token",
      ingestingUrl: "https://ingest.example.test",
    });
    expect(sink.instances).toHaveLength(1);
    expect(sink.instances[0].warn).toHaveBeenCalledWith(
      "Retrying",
      expect.objectContaining({
        message: "Retrying",
        event: "job.retry",
        attempt: 2,
        deploymentEnvironment: expect.any(String),
        timestamp: expect.any(String),
      }),
    );
  });

  it("reuses one Better Stack logger and flushes it on demand", async () => {
    vi.stubEnv("BETTER_STACK_SOURCE_TOKEN", "test-source-token");
    const { getServerLogger, logger } = await loadNodeEntry();

    await logger.flush();
    expect(sink.instances).toHaveLength(0);

    logger.info("first");
    logger.info("second");
    await logger.flush();

    expect(getServerLogger()).toBe(sink.instances[0]);
    expect(sink.instances).toHaveLength(1);
    expect(sink.config.ingestingUrl).toBe("https://in.logs.betterstack.com");
    expect(sink.instances[0].flush).toHaveBeenCalledTimes(1);
  });

  it("strips sensitive keys from auth events", async () => {
    vi.stubEnv("BETTER_STACK_SOURCE_TOKEN", "test-source-token");
    const { authLogger, logger } = await loadNodeEntry();

    logger.auth("info", "Token issued", {
      event: "auth.token.issued",
      userId: "user-1",
      token: "should-not-appear",
    });
    authLogger.signInAttempt("User@Example.com", "google");

    const [, issued] = sink.instances[0].info.mock.calls[0];
    expect(issued).toMatchObject({ event: "auth.token.issued" });
    expect(issued).not.toHaveProperty("token");

    const [, attempt] = sink.instances[0].info.mock.calls[1];
    expect(attempt).toMatchObject({
      event: "auth.signin.attempt",
      accountDomain: "example.com",
      provider: "google",
    });
    expect(JSON.stringify(attempt)).not.toContain("User@Example.com");
  });

  it("exposes the framework-neutral helpers", async () => {
    const entry = await loadNodeEntry();

    expect(entry.sanitizeErrorMessageForClient("duplicate key", "23505")).toBe(
      "A record with this value already exists",
    );
    expect(
      entry.getOrGenerateCorrelationId({
        headers: { get: () => "req-from-header" },
      }),
    ).toBe("req-from-header");
    expect(typeof entry.adminLogger.userView).toBe("function");
    expect(typeof entry.detectDeploymentEnvironment).toBe("function");
  });
});
