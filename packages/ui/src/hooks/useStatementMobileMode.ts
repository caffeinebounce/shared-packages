"use client";

import { useEffect, useMemo, useState } from "react";

interface UseStatementMobileModeParams<
  TEntry extends { period_first_day: string },
> {
  isMobile: boolean;
  entries: TEntry[];
  currentPeriodKeys: string[];
  comparisonMode: string;
}

interface UseStatementMobileModeReturn<TEntry> {
  activePeriodIndex: number;
  setActivePeriodIndex: (updater: number | ((prev: number) => number)) => void;
  compareEnabled: boolean;
  setCompareEnabled: (enabled: boolean) => void;
  mobileEntries: TEntry[];
  periodLabel: string;
  compareLabel?: string;
  hasPrev: boolean;
  hasNext: boolean;
  hasComparisonCandidate: boolean;
  activePeriod?: string;
}

export function useStatementMobileMode<
  TEntry extends { period_first_day: string },
>({
  isMobile,
  entries,
  currentPeriodKeys,
  comparisonMode,
}: UseStatementMobileModeParams<TEntry>): UseStatementMobileModeReturn<TEntry> {
  const normalizedPeriodKeys = useMemo(
    () =>
      Array.from(new Set(currentPeriodKeys)).sort((a, b) => b.localeCompare(a)),
    [currentPeriodKeys],
  );

  const [activePeriodIndex, setActivePeriodIndex] = useState(0);
  const [compareEnabled, setCompareEnabled] = useState(false);

  useEffect(() => {
    setActivePeriodIndex((index) =>
      normalizedPeriodKeys.length === 0
        ? 0
        : Math.min(index, normalizedPeriodKeys.length - 1),
    );
  }, [normalizedPeriodKeys.length]);

  const activePeriod =
    normalizedPeriodKeys[activePeriodIndex] ?? normalizedPeriodKeys[0];

  const comparisonPeriodKeys = useMemo(
    () =>
      Array.from(new Set(entries.map((entry) => entry.period_first_day)))
        .filter((period) => !normalizedPeriodKeys.includes(period))
        .sort((a, b) => b.localeCompare(a)),
    [entries, normalizedPeriodKeys],
  );

  const hasComparisonCandidate =
    comparisonMode === "none"
      ? normalizedPeriodKeys.length > 1
      : comparisonPeriodKeys.length > 0;

  useEffect(() => {
    if (!hasComparisonCandidate) setCompareEnabled(false);
  }, [hasComparisonCandidate]);

  const mobileComparisonPeriod = useMemo(() => {
    if (!compareEnabled || !activePeriod) return undefined;
    if (comparisonMode !== "none") return comparisonPeriodKeys[0];
    const activeIndex = normalizedPeriodKeys.indexOf(activePeriod);
    return activeIndex >= 0 ? normalizedPeriodKeys[activeIndex + 1] : undefined;
  }, [
    compareEnabled,
    activePeriod,
    comparisonMode,
    comparisonPeriodKeys,
    normalizedPeriodKeys,
  ]);

  const mobileVisiblePeriods = useMemo(() => {
    if (!isMobile || !activePeriod) return null;
    return mobileComparisonPeriod
      ? [activePeriod, mobileComparisonPeriod]
      : [activePeriod];
  }, [isMobile, activePeriod, mobileComparisonPeriod]);

  const mobileEntries = useMemo(() => {
    if (!mobileVisiblePeriods) return entries;
    const visible = new Set(mobileVisiblePeriods);
    return entries.filter((entry) => visible.has(entry.period_first_day));
  }, [entries, mobileVisiblePeriods]);

  return {
    activePeriodIndex,
    setActivePeriodIndex,
    compareEnabled,
    setCompareEnabled,
    mobileEntries,
    periodLabel: activePeriod ?? "",
    compareLabel: mobileComparisonPeriod,
    hasPrev: activePeriodIndex > 0,
    hasNext:
      normalizedPeriodKeys.length > 0 &&
      activePeriodIndex < normalizedPeriodKeys.length - 1,
    hasComparisonCandidate,
    activePeriod,
  };
}
