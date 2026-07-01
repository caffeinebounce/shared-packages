import { describe, expect, it } from "vitest";
import {
  clamp,
  contains,
  intersect,
  intersectMany,
  normalize,
  subtract,
  totalMs,
  union,
} from "../intervals";

const r = (start: number, end: number) => ({ start, end });

describe("normalize", () => {
  it("drops empty/inverted ranges and sorts", () => {
    expect(normalize([r(10, 10), r(5, 8), r(20, 15)])).toEqual([r(5, 8)]);
  });

  it("merges overlapping ranges", () => {
    expect(normalize([r(0, 5), r(3, 8), r(8, 10)])).toEqual([r(0, 10)]);
  });

  it("merges exactly-touching ranges", () => {
    expect(normalize([r(0, 5), r(5, 9)])).toEqual([r(0, 9)]);
  });

  it("keeps disjoint ranges separate", () => {
    expect(normalize([r(0, 5), r(6, 9)])).toEqual([r(0, 5), r(6, 9)]);
  });
});

describe("union", () => {
  it("combines and normalizes", () => {
    expect(union([r(0, 5)], [r(4, 10)])).toEqual([r(0, 10)]);
  });
});

describe("intersect", () => {
  it("returns overlapping portions", () => {
    expect(intersect([r(0, 10)], [r(5, 15)])).toEqual([r(5, 10)]);
  });

  it("handles multiple overlaps via two-pointer sweep", () => {
    expect(intersect([r(0, 5), r(10, 20)], [r(3, 12), r(15, 25)])).toEqual([
      r(3, 5),
      r(10, 12),
      r(15, 20),
    ]);
  });

  it("returns empty when disjoint", () => {
    expect(intersect([r(0, 5)], [r(6, 10)])).toEqual([]);
  });
});

describe("intersectMany", () => {
  it("intersects across N sets", () => {
    expect(intersectMany([[r(0, 20)], [r(5, 18)], [r(8, 30)]])).toEqual([
      r(8, 18),
    ]);
  });

  it("empty input → empty", () => {
    expect(intersectMany([])).toEqual([]);
  });

  it("short-circuits to empty once intersection vanishes", () => {
    expect(intersectMany([[r(0, 5)], [r(10, 15)], [r(0, 100)]])).toEqual([]);
  });
});

describe("subtract", () => {
  it("carves a hole in the middle", () => {
    expect(subtract([r(0, 10)], [r(3, 6)])).toEqual([r(0, 3), r(6, 10)]);
  });

  it("trims both ends", () => {
    expect(subtract([r(0, 10)], [r(0, 2), r(8, 10)])).toEqual([r(2, 8)]);
  });

  it("removes a fully-covered range", () => {
    expect(subtract([r(2, 8)], [r(0, 10)])).toEqual([]);
  });

  it("is a no-op when cut is disjoint", () => {
    expect(subtract([r(0, 5)], [r(6, 9)])).toEqual([r(0, 5)]);
  });
});

describe("clamp / contains / totalMs", () => {
  it("clamps to bounds", () => {
    expect(clamp([r(0, 100)], 10, 40)).toEqual([r(10, 40)]);
  });

  it("contains respects half-open semantics", () => {
    expect(contains([r(0, 10)], 0)).toBe(true);
    expect(contains([r(0, 10)], 10)).toBe(false);
    expect(contains([r(0, 10)], 9)).toBe(true);
  });

  it("sums covered duration after normalization", () => {
    expect(totalMs([r(0, 5), r(3, 8), r(20, 25)])).toBe(13);
  });
});
