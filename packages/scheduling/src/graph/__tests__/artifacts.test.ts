import { describe, expect, it } from "vitest";
import { type BookingRoutingRecord, routeArtifact } from "../artifacts";

const lookup = new Map<string, BookingRoutingRecord>([
  [
    "MM1",
    { bookingId: "b1", companyId: "cala-coffee", cohortSlug: "birmingham-ii" },
  ],
]);

describe("routeArtifact", () => {
  it("files a matched transcript under the right cohort/company", () => {
    const r = routeArtifact("MM1", "transcript", "T1", lookup);
    expect(r.routingStatus).toBe("auto_routed");
    expect(r.companyId).toBe("cala-coffee");
    expect(r.storagePath).toBe(
      "cohort/birmingham-ii/company/cala-coffee/meetings/b1/transcript/T1.vtt",
    );
  });

  it("files an unmatched recording under _unassigned and flags it ambiguous", () => {
    const r = routeArtifact("UNKNOWN", "recording", "R9", lookup);
    expect(r.routingStatus).toBe("ambiguous");
    expect(r.bookingId).toBeNull();
    expect(r.companyId).toBeNull();
    expect(r.storagePath).toBe(
      "cohort/_unassigned/company/_unassigned/meetings/unmatched-UNKNOWN/recording/R9.mp4",
    );
  });
});
