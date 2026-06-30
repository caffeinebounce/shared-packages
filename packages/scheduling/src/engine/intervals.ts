/**
 * Interval-set algebra over half-open `[start, end)` ranges of epoch-ms.
 *
 * The slot engine is fundamentally set arithmetic on time: a principal's free
 * time is `availability − blocks − busy − bookings`, and a mutually-free window
 * is the intersection of every blocking participant's free set. These helpers
 * are deliberately tiny, allocation-light, and dependency-free so they can be
 * exhaustively unit-tested.
 *
 * Invariants for a "normalized" set: sorted by `start`, no zero/negative-width
 * ranges, and no overlapping or touching ranges (touching ranges are merged).
 */
import type { TimeRange } from "../types";

/** Drop empty ranges and sort by start. */
function sortAndPrune(ranges: TimeRange[]): TimeRange[] {
  return ranges
    .filter((r) => r.end > r.start)
    .sort((a, b) => a.start - b.start);
}

/**
 * Normalize a set of ranges: prune empties, sort, and merge any overlapping or
 * adjacent ranges into a minimal canonical set.
 */
export function normalize(ranges: TimeRange[]): TimeRange[] {
  const sorted = sortAndPrune(ranges);
  if (sorted.length === 0) return [];

  const merged: TimeRange[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const cur = sorted[i];
    // Merge when overlapping OR exactly touching (last.end === cur.start).
    if (cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end);
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

/** Union of two interval sets (inputs need not be normalized). */
export function union(a: TimeRange[], b: TimeRange[]): TimeRange[] {
  return normalize([...a, ...b]);
}

/**
 * Intersection of two interval sets. Result is normalized. O(n + m) over the
 * normalized inputs via a two-pointer sweep.
 */
export function intersect(a: TimeRange[], b: TimeRange[]): TimeRange[] {
  const na = normalize(a);
  const nb = normalize(b);
  const out: TimeRange[] = [];
  let i = 0;
  let j = 0;
  while (i < na.length && j < nb.length) {
    const start = Math.max(na[i].start, nb[j].start);
    const end = Math.min(na[i].end, nb[j].end);
    if (end > start) out.push({ start, end });
    // Advance whichever range ends first.
    if (na[i].end < nb[j].end) i++;
    else j++;
  }
  return out;
}

/** Intersection across many sets. Empty input → empty set. */
export function intersectMany(sets: TimeRange[][]): TimeRange[] {
  if (sets.length === 0) return [];
  let acc = normalize(sets[0]);
  for (let k = 1; k < sets.length; k++) {
    if (acc.length === 0) return [];
    acc = intersect(acc, sets[k]);
  }
  return acc;
}

/** `a − b`: remove every part of `b` from `a`. Result is normalized. */
export function subtract(a: TimeRange[], b: TimeRange[]): TimeRange[] {
  const base = normalize(a);
  const cut = normalize(b);
  if (cut.length === 0) return base;

  const out: TimeRange[] = [];
  for (const range of base) {
    // `cursor` tracks the uncovered portion of `range` as we carve out cuts.
    let cursor = range.start;
    for (const c of cut) {
      if (c.end <= cursor || c.start >= range.end) continue; // no overlap
      if (c.start > cursor) out.push({ start: cursor, end: c.start });
      cursor = Math.max(cursor, c.end);
      if (cursor >= range.end) break;
    }
    if (cursor < range.end) out.push({ start: cursor, end: range.end });
  }
  return out;
}

/** Clamp a set to `[lo, hi)`. */
export function clamp(
  ranges: TimeRange[],
  lo: number,
  hi: number,
): TimeRange[] {
  return intersect(ranges, [{ start: lo, end: hi }]);
}

/** True if `point` (epoch ms) falls within any range. */
export function contains(ranges: TimeRange[], point: number): boolean {
  return ranges.some((r) => point >= r.start && point < r.end);
}

/** Total covered duration in milliseconds. */
export function totalMs(ranges: TimeRange[]): number {
  return normalize(ranges).reduce((sum, r) => sum + (r.end - r.start), 0);
}
