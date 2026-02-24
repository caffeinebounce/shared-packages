"use client";

import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import type { ComparisonMode } from "../blocks/data-table/ComparisonSelector";
import type { TimeUnit } from "../blocks/data-table/FinancialStatementTable";
import type { PeriodGranularity } from "../blocks/data-table/PeriodSelector";

export interface DateRange {
  start: string;
  end: string;
}

export function getDefaultLtmRange(): DateRange {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = new Date(year - 1, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

interface UseFinancialStatementStateOptions {
  initialGranularity?: PeriodGranularity;
  initialComparisonMode?: ComparisonMode;
  initialComparisonPeriods?: number;
}

export function useFinancialStatementState({
  initialGranularity = "ltm",
  initialComparisonMode = "none",
  initialComparisonPeriods = 1,
}: UseFinancialStatementStateOptions = {}) {
  const defaultRange = useMemo(() => getDefaultLtmRange(), []);

  const [granularity, setGranularity] =
    useState<PeriodGranularity>(initialGranularity);
  const [periodStart, setPeriodStart] = useState(defaultRange.start);
  const [periodEnd, setPeriodEnd] = useState(defaultRange.end);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("month");

  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>(
    initialComparisonMode,
  );
  const [comparisonPeriods, setComparisonPeriods] = useState(
    initialComparisonPeriods,
  );
  const [comparisonCustomStart, setComparisonCustomStart] = useState<string>();
  const [comparisonCustomEnd, setComparisonCustomEnd] = useState<string>();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [hideZeroRows, setHideZeroRows] = useState(true);
  const [showRowTotals, setShowRowTotals] = useState(false);

  const handlePeriodChange = useCallback(
    (params: {
      granularity: PeriodGranularity;
      periodStart: string;
      periodEnd: string;
      timeUnit: "month" | "quarter" | "year";
    }) => {
      setGranularity(params.granularity);
      setPeriodStart(params.periodStart);
      setPeriodEnd(params.periodEnd);
      setTimeUnit(params.timeUnit as TimeUnit);
    },
    [],
  );

  const handleComparisonChange = useCallback(
    (params: {
      mode: ComparisonMode;
      periods: number;
      customStart?: string;
      customEnd?: string;
    }) => {
      if (granularity === "ltm") {
        const ltmDefault = params.mode === "previous" && params.periods === 11;
        if (!ltmDefault) {
          const end = endOfMonth(parseISO(periodEnd));
          const start = startOfMonth(end);
          setGranularity("month");
          setTimeUnit("month");
          setPeriodStart(start.toISOString().slice(0, 10));
          setPeriodEnd(end.toISOString().slice(0, 10));
        }
      }

      setComparisonMode(params.mode);
      setComparisonPeriods(params.periods);
      setComparisonCustomStart(params.customStart);
      setComparisonCustomEnd(params.customEnd);
    },
    [granularity, periodEnd],
  );

  const priorRange = useMemo(() => {
    const start = new Date(`${periodStart}T00:00:00`);
    const end = new Date(`${periodEnd}T00:00:00`);
    const durationMs = end.getTime() - start.getTime();
    const priorEnd = new Date(start.getTime() - 1);
    const priorStart = new Date(priorEnd.getTime() - durationMs);
    return {
      start: priorStart.toISOString().slice(0, 10),
      end: priorEnd.toISOString().slice(0, 10),
    };
  }, [periodStart, periodEnd]);

  const comparisonRanges = useMemo(() => {
    if (comparisonMode === "none") return [] as DateRange[];
    if (
      comparisonMode === "custom" &&
      comparisonCustomStart &&
      comparisonCustomEnd
    ) {
      return [{ start: comparisonCustomStart, end: comparisonCustomEnd }];
    }

    const start = new Date(`${periodStart}T00:00:00`);
    const end = new Date(`${periodEnd}T00:00:00`);
    const durationMs = end.getTime() - start.getTime();
    const ranges: DateRange[] = [];

    if (comparisonMode === "previous") {
      const dayCount = Math.round(durationMs / 86400000) + 1;
      const cEnd = new Date(start);
      cEnd.setDate(cEnd.getDate() - 1);
      const cStart = new Date(cEnd);
      cStart.setDate(cStart.getDate() - (dayCount * comparisonPeriods - 1));
      return [
        {
          start: cStart.toISOString().slice(0, 10),
          end: cEnd.toISOString().slice(0, 10),
        },
      ];
    }

    for (let i = 1; i <= comparisonPeriods; i++) {
      if (comparisonMode === "same-period-last-year") {
        const cStart = new Date(start);
        cStart.setFullYear(cStart.getFullYear() - i);
        const cEnd = new Date(end);
        cEnd.setFullYear(cEnd.getFullYear() - i);
        ranges.push({
          start: cStart.toISOString().slice(0, 10),
          end: cEnd.toISOString().slice(0, 10),
        });
      }
    }

    return ranges;
  }, [
    comparisonMode,
    comparisonPeriods,
    comparisonCustomStart,
    comparisonCustomEnd,
    periodStart,
    periodEnd,
  ]);

  const formatPeriodLabel = useCallback((periodKey?: string) => {
    if (!periodKey) return "—";
    return format(parseISO(periodKey), "MMM yy");
  }, []);

  const activeFilterCount =
    (selectedClass ? 1 : 0) +
    (selectedDepartment ? 1 : 0) +
    (comparisonMode !== "none" ? 1 : 0);

  const periodChipLabel =
    granularity === "ltm"
      ? "LTM"
      : granularity === "ytd"
        ? "YTD"
        : granularity === "month"
          ? "Month"
          : granularity === "quarter"
            ? "Quarter"
            : granularity === "year"
              ? "Year"
              : "Custom";

  const comparisonChipLabel =
    granularity === "ltm"
      ? "vs Previous 11"
      : comparisonMode === "none"
        ? "No comparison"
        : comparisonMode === "previous"
          ? `vs Previous ${comparisonPeriods}`
          : comparisonMode === "same-period-last-year"
            ? `vs Last year (${comparisonPeriods})`
            : "Custom comparison";

  const resetFilters = useCallback(() => {
    setSelectedClass("");
    setSelectedDepartment("");
    setComparisonMode("none");
    setComparisonPeriods(1);
    setComparisonCustomStart(undefined);
    setComparisonCustomEnd(undefined);
  }, []);

  return {
    granularity,
    periodStart,
    periodEnd,
    timeUnit,
    selectedClass,
    selectedDepartment,
    comparisonMode,
    comparisonPeriods,
    comparisonCustomStart,
    comparisonCustomEnd,
    mobileFiltersOpen,
    hideZeroRows,
    showRowTotals,
    priorRange,
    comparisonRanges,
    periodChipLabel,
    comparisonChipLabel,
    activeFilterCount,
    formatPeriodLabel,
    setSelectedClass,
    setSelectedDepartment,
    setMobileFiltersOpen,
    setHideZeroRows,
    setShowRowTotals,
    handlePeriodChange,
    handleComparisonChange,
    resetFilters,
  };
}
