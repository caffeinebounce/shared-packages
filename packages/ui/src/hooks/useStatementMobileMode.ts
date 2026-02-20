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
  const [activePeriodIndex, setActivePeriodIndex] = useState(0);
  const [compareEnabled, setCompareEnabled] = useState(false);

  useEffect(() => {
    setActivePeriodIndex((index) =>
      currentPeriodKeys.length === 0
        ? 0
        : Math.min(index, currentPeriodKeys.length - 1),
    );
  }, [currentPeriodKeys.length]);

  const activePeriod =
    currentPeriodKeys[activePeriodIndex] ?? currentPeriodKeys[0];

  const comparisonPeriodKeys = useMemo(
    () =>
      Array.from(new Set(entries.map((entry) => entry.period_first_day)))
        .filter((period) => !currentPeriodKeys.includes(period))
        .sort((a, b) => b.localeCompare(a)),
    [entries, currentPeriodKeys],
  );

  const hasComparisonCandidate =
    comparisonMode === "none"
      ? currentPeriodKeys.length > 1
      : comparisonPeriodKeys.length > 0;

  useEffect(() => {
    if (!hasComparisonCandidate) setCompareEnabled(false);
  }, [hasComparisonCandidate]);

  const mobileComparisonPeriod = useMemo(() => {
    if (!compareEnabled || !activePeriod) return undefined;
    if (comparisonMode !== "none") return comparisonPeriodKeys[0];
    const activeIndex = currentPeriodKeys.indexOf(activePeriod);
    return activeIndex >= 0 ? currentPeriodKeys[activeIndex + 1] : undefined;
  }, [
    compareEnabled,
    activePeriod,
    comparisonMode,
    comparisonPeriodKeys,
    currentPeriodKeys,
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
      currentPeriodKeys.length > 0 &&
      activePeriodIndex < currentPeriodKeys.length - 1,
    hasComparisonCandidate,
    activePeriod,
  };
}
