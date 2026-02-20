"use client";

import { useMemo } from "react";
import type { ComparisonMode } from "../blocks/data-table/ComparisonSelector";
import type { FinancialStatementEntry } from "../blocks/data-table/FinancialStatementTable";
import type { DateRange } from "./useFinancialStatementState";

interface ComparisonHookParams {
  periodStart: string;
  periodEnd: string;
  classId?: string;
  departmentId?: string;
  enabled?: boolean;
  keepPrevious?: boolean;
}

interface ComparisonHookResult<
  TRow,
  TClass = { id: string; name: string },
  TDepartment = { id: string; name: string },
> {
  data?: {
    data: TRow[];
    classes?: TClass[];
    departments?: TDepartment[];
  };
  isLoading: boolean;
}

interface UseComparisonDataParams<
  TRow,
  TClass = { id: string; name: string },
  TDepartment = { id: string; name: string },
> {
  useDataHook: (
    params: ComparisonHookParams,
  ) => ComparisonHookResult<TRow, TClass, TDepartment>;
  currentParams: {
    periodStart: string;
    periodEnd: string;
    classId?: string;
    departmentId?: string;
  };
  comparisonRanges: DateRange[];
  comparisonMode: ComparisonMode;
  comparisonPeriods: number;
  toEntries: (rows: TRow[]) => FinancialStatementEntry[];
  getPeriodKey: (row: TRow) => string;
}

export function useComparisonData<
  TRow,
  TClass = { id: string; name: string },
  TDepartment = { id: string; name: string },
>({
  useDataHook,
  currentParams,
  comparisonRanges,
  comparisonMode,
  comparisonPeriods,
  toEntries,
  getPeriodKey,
}: UseComparisonDataParams<TRow, TClass, TDepartment>) {
  const { data: response, isLoading } = useDataHook(currentParams);

  const { data: compResp0 } = useDataHook({
    ...currentParams,
    periodStart: comparisonRanges[0]?.start ?? "",
    periodEnd: comparisonRanges[0]?.end ?? "",
    enabled: !!comparisonRanges[0],
    keepPrevious: true,
  });
  const { data: compResp1 } = useDataHook({
    ...currentParams,
    periodStart: comparisonRanges[1]?.start ?? "",
    periodEnd: comparisonRanges[1]?.end ?? "",
    enabled: !!comparisonRanges[1],
    keepPrevious: true,
  });
  const { data: compResp2 } = useDataHook({
    ...currentParams,
    periodStart: comparisonRanges[2]?.start ?? "",
    periodEnd: comparisonRanges[2]?.end ?? "",
    enabled: !!comparisonRanges[2],
    keepPrevious: true,
  });

  const rawData = response?.data ?? [];

  const entries = useMemo(() => {
    const current = toEntries(rawData);
    if (comparisonMode === "none") return current;
    const compDataSets = [compResp0, compResp1, compResp2].filter(Boolean);
    const compEntries = compDataSets.flatMap((result) =>
      toEntries(result?.data ?? []),
    );
    return [...compEntries, ...current];
  }, [rawData, comparisonMode, compResp0, compResp1, compResp2, toEntries]);

  const currentPeriodCount = useMemo(
    () => new Set(rawData.map(getPeriodKey)).size,
    [rawData, getPeriodKey],
  );

  const currentPeriodKeys = useMemo(
    () =>
      Array.from(new Set(rawData.map(getPeriodKey))).sort((a, b) =>
        b.localeCompare(a),
      ),
    [rawData, getPeriodKey],
  );

  const totalVisiblePeriodCount = useMemo(
    () => new Set(entries.map((entry) => entry.period_first_day)).size,
    [entries],
  );

  const showVariance =
    totalVisiblePeriodCount === 2 &&
    !(comparisonMode === "previous" && comparisonPeriods > 1);

  return {
    response,
    isLoading,
    rawData,
    entries,
    currentPeriodCount,
    currentPeriodKeys,
    totalVisiblePeriodCount,
    showVariance,
    classes: response?.classes ?? [],
    departments: response?.departments ?? [],
  };
}
