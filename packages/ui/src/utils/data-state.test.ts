import { describe, expect, it } from "vitest";
import { resolveDataState } from "./data-state";

describe("resolveDataState", () => {
  it("returns loading when metadata indicates loading", () => {
    const result = resolveDataState({ metadata: { isLoading: true } });
    expect(result.state).toBe("loading");
    expect(result.retryable).toBe(false);
  });

  it("returns unauthorized for 401 errors", () => {
    const result = resolveDataState({ error: { status: 401 } });
    expect(result.state).toBe("unauthorized");
    expect(result.retryable).toBe(false);
  });

  it("returns misconfigured for tagged misconfiguration", () => {
    const result = resolveDataState({ metadata: { isMisconfigured: true } });
    expect(result.state).toBe("misconfigured");
  });

  it("returns error for generic errors", () => {
    const result = resolveDataState({ error: new Error("boom") });
    expect(result.state).toBe("error");
    expect(result.retryable).toBe(true);
  });

  it("returns partial and stale before empty", () => {
    expect(resolveDataState({ metadata: { isPartial: true } }).state).toBe(
      "partial",
    );
    expect(resolveDataState({ metadata: { isStale: true } }).state).toBe(
      "stale",
    );
  });

  it("returns empty when no data", () => {
    const result = resolveDataState({ data: [] });
    expect(result.state).toBe("empty");
  });

  it("supports custom hasData function", () => {
    const result = resolveDataState({
      data: { rows: [1] },
      hasData: (d) => Boolean(d?.rows?.length),
    });
    expect(result.state).toBeNull();
  });
});
