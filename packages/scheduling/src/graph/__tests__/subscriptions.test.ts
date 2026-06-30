import { describe, expect, it } from "vitest";
import {
  buildSubscriptionBody,
  clampExpiry,
  parseArtifactNotificationResource,
} from "../subscriptions";

const DAY = 86_400_000;

describe("clampExpiry", () => {
  it("clamps to the Graph maximum (~3 days)", () => {
    const now = 1_000_000_000;
    const clamped = clampExpiry(now, now + 10 * DAY);
    expect(clamped).toBeLessThan(now + 3 * DAY);
    expect(clamped).toBeGreaterThan(now + 3 * DAY - 2 * 60_000);
  });

  it("leaves a sub-maximum expiry untouched", () => {
    const now = 1_000_000_000;
    expect(clampExpiry(now, now + DAY)).toBe(now + DAY);
  });
});

describe("buildSubscriptionBody", () => {
  it("targets the tenant-wide getAllTranscripts resource", () => {
    const now = 1_000_000_000;
    const body = buildSubscriptionBody(
      {
        kind: "transcripts",
        notificationUrl:
          "https://scheduler.example/api/transcripts/teams-webhook",
        clientState: "secret",
        expiresAt: now + DAY,
      },
      now,
    );
    expect(body.resource).toBe(
      "communications/onlineMeetings/getAllTranscripts",
    );
    expect(body.changeType).toBe("created");
    expect(body.clientState).toBe("secret");
    expect(body.expirationDateTime).toBe(new Date(now + DAY).toISOString());
  });
});

describe("parseArtifactNotificationResource", () => {
  it("extracts meeting + artifact ids for a transcript", () => {
    expect(
      parseArtifactNotificationResource(
        "communications/onlineMeetings('MSo123')/transcripts('abc==')",
      ),
    ).toEqual({
      onlineMeetingId: "MSo123",
      kind: "transcript",
      artifactId: "abc==",
    });
  });

  it("extracts a recording", () => {
    expect(
      parseArtifactNotificationResource(
        "communications/onlineMeetings('MM9')/recordings('rec1')",
      ),
    ).toEqual({
      onlineMeetingId: "MM9",
      kind: "recording",
      artifactId: "rec1",
    });
  });

  it("returns null for an unrecognised resource", () => {
    expect(
      parseArtifactNotificationResource("users('x')/events('y')"),
    ).toBeNull();
  });
});
