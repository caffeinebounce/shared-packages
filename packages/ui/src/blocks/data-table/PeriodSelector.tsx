"use client";

import {
  addMonths,
  addYears,
  endOfMonth,
  format,
  isValid,
  parseISO,
  startOfMonth,
  subDays,
} from "date-fns";
import { CalendarDays, Check, ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { Button } from "../../components/ui/button";
import { DateRangePicker } from "../../components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { cn } from "../../utils";

export type PeriodGranularity =
  | "month"
  | "quarter"
  | "year"
  | "ltm"
  | "ytd"
  | "custom";

export interface PeriodSelectorProps {
  /** Currently selected granularity */
  granularity: PeriodGranularity;
  /** The current period start date (ISO string YYYY-MM-DD) */
  periodStart: string;
  /** The current period end date (ISO string YYYY-MM-DD) */
  periodEnd: string;
  /** Fiscal year end month (1-12, default 12 = December = calendar year) */
  fiscalYearEndMonth?: number;
  /** Called when user changes granularity or navigates */
  onChange: (params: {
    granularity: PeriodGranularity;
    periodStart: string;
    periodEnd: string;
    timeUnit: "month" | "quarter" | "year";
  }) => void;
  /** Optional className */
  className?: string;
}

type PeriodRange = { start: Date; end: Date };

const GRANULARITY_ROWS: Array<{
  key: Exclude<PeriodGranularity, "custom">;
  label: string;
}> = [
  { key: "month", label: "Month" },
  { key: "quarter", label: "Quarter" },
  { key: "year", label: "Year" },
  { key: "ltm", label: "LTM" },
  { key: "ytd", label: "YTD" },
];

function toIso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function safeParseDate(iso: string, fallback: Date): Date {
  const parsed = parseISO(iso);
  return isValid(parsed) ? parsed : fallback;
}

function getTimeUnit(
  granularity: PeriodGranularity,
): "month" | "quarter" | "year" {
  if (granularity === "quarter") return "quarter";
  if (granularity === "year") return "year";
  return "month";
}

function normalizeFiscalYearEndMonth(month?: number): number {
  if (!month || month < 1 || month > 12) return 12;
  return month;
}

function getFiscalYearStart(date: Date, fiscalYearEndMonth: number): Date {
  const fyStartMonth = (fiscalYearEndMonth % 12) + 1;
  const month = date.getMonth() + 1;
  const year =
    month >= fyStartMonth ? date.getFullYear() : date.getFullYear() - 1;
  return new Date(year, fyStartMonth - 1, 1);
}

function getFiscalYearRange(
  date: Date,
  fiscalYearEndMonth: number,
): PeriodRange {
  const start = getFiscalYearStart(date, fiscalYearEndMonth);
  const end = subDays(addYears(start, 1), 1);
  return { start, end };
}

function getFiscalQuarterRange(
  date: Date,
  fiscalYearEndMonth: number,
): PeriodRange {
  const fyStart = getFiscalYearStart(date, fiscalYearEndMonth);
  const monthDiff =
    (date.getFullYear() - fyStart.getFullYear()) * 12 +
    (date.getMonth() - fyStart.getMonth());
  const quarterIndex = Math.floor(monthDiff / 3);
  const start = addMonths(fyStart, quarterIndex * 3);
  const end = subDays(addMonths(start, 3), 1);
  return { start, end };
}

function getRangeForGranularity(
  granularity: Exclude<PeriodGranularity, "custom">,
  anchor: Date,
  fiscalYearEndMonth: number,
  today: Date,
): PeriodRange {
  if (granularity === "month") {
    return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
  }

  if (granularity === "quarter") {
    return getFiscalQuarterRange(anchor, fiscalYearEndMonth);
  }

  if (granularity === "year") {
    return getFiscalYearRange(anchor, fiscalYearEndMonth);
  }

  if (granularity === "ltm") {
    const end = endOfMonth(today);
    const start = startOfMonth(addMonths(end, -11));
    return { start, end };
  }

  const fy = getFiscalYearRange(today, fiscalYearEndMonth);
  const boundedEnd = today > fy.end ? fy.end : today;
  return { start: fy.start, end: boundedEnd };
}

function shiftRange(
  granularity: Exclude<PeriodGranularity, "custom">,
  current: PeriodRange,
  direction: -1 | 1,
): PeriodRange {
  if (granularity === "month") {
    const next = addMonths(current.start, direction);
    return { start: startOfMonth(next), end: endOfMonth(next) };
  }

  if (granularity === "quarter") {
    const nextStart = addMonths(current.start, direction * 3);
    return { start: nextStart, end: subDays(addMonths(nextStart, 3), 1) };
  }

  if (granularity === "year") {
    const nextStart = addYears(current.start, direction);
    return { start: nextStart, end: subDays(addYears(nextStart, 1), 1) };
  }

  if (granularity === "ltm") {
    const start = startOfMonth(addMonths(current.start, direction));
    const end = endOfMonth(addMonths(current.end, direction));
    return { start, end };
  }

  return {
    start: addYears(current.start, direction),
    end: addYears(current.end, direction),
  };
}

function formatRangeLabel(
  granularity: PeriodGranularity,
  start: Date,
  end: Date,
): string {
  if (granularity === "month") return format(start, "MMMM yyyy");
  if (granularity === "quarter")
    return `${format(start, "MMM")} – ${format(end, "MMM yyyy")}`;
  if (granularity === "year") return format(start, "yyyy");
  if (granularity === "ltm" || granularity === "ytd") {
    return `${format(start, "MMM yyyy")} – ${format(end, "MMM yyyy")}`;
  }
  return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
}

export function PeriodSelector({
  granularity,
  periodStart,
  periodEnd,
  fiscalYearEndMonth,
  onChange,
  className,
}: PeriodSelectorProps) {
  const fiscalMonth = normalizeFiscalYearEndMonth(fiscalYearEndMonth);
  const now = React.useMemo(() => new Date(), []);
  const selectedStart = safeParseDate(periodStart, now);
  const selectedEnd = safeParseDate(periodEnd, now);
  const anchorDate = granularity === "custom" ? selectedEnd : selectedStart;

  const ranges = React.useMemo(() => {
    const map = new Map<Exclude<PeriodGranularity, "custom">, PeriodRange>();
    for (const row of GRANULARITY_ROWS) {
      map.set(
        row.key,
        getRangeForGranularity(row.key, anchorDate, fiscalMonth, now),
      );
    }
    return map;
  }, [anchorDate, fiscalMonth, now]);

  const activeLabel = formatRangeLabel(granularity, selectedStart, selectedEnd);

  const applyRange = React.useCallback(
    (nextGranularity: PeriodGranularity, nextRange: PeriodRange) => {
      onChange({
        granularity: nextGranularity,
        periodStart: toIso(nextRange.start),
        periodEnd: toIso(nextRange.end),
        timeUnit: getTimeUnit(nextGranularity),
      });
    },
    [onChange],
  );

  const selectGranularity = React.useCallback(
    (nextGranularity: Exclude<PeriodGranularity, "custom">) => {
      const range = ranges.get(nextGranularity);
      if (!range) return;
      applyRange(nextGranularity, range);
    },
    [applyRange, ranges],
  );

  const navigate = React.useCallback(
    (
      rowGranularity: Exclude<PeriodGranularity, "custom">,
      direction: -1 | 1,
    ) => {
      const current =
        granularity === rowGranularity
          ? { start: selectedStart, end: selectedEnd }
          : ranges.get(rowGranularity);

      if (!current) return;

      const next = shiftRange(rowGranularity, current, direction);
      applyRange(rowGranularity, next);
    },
    [applyRange, granularity, ranges, selectedEnd, selectedStart],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("h-8 gap-2 focus-visible:ring-0 focus-visible:outline-none", className)}
        >
          <CalendarDays className="size-4" />
          <span className="text-xs font-medium">{activeLabel}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[380px] p-2" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="space-y-1">
          {GRANULARITY_ROWS.map((row) => {
            const range = ranges.get(row.key);
            if (!range) return null;

            const isActive = granularity === row.key;
            const showNav = row.key === "month" || row.key === "quarter" || row.key === "year";

            return (
              <div
                key={row.key}
                role="button"
                tabIndex={0}
                onClick={() => selectGranularity(row.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectGranularity(row.key);
                  }
                }}
                className={cn(
                  "grid w-full cursor-pointer grid-cols-[16px_84px_28px_minmax(0,1fr)_28px] items-center gap-2 rounded-md px-1 py-1 text-left",
                  "hover:bg-accent/60 focus:outline-none",
                  isActive && "bg-accent/60",
                )}
              >
                <span className="flex size-4 items-center justify-center text-primary">
                  {isActive ? <Check className="size-3.5" /> : null}
                </span>

                <span className="text-sm font-medium">{row.label}</span>

                {showNav ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 focus-visible:ring-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(row.key, -1);
                    }}
                    aria-label={`Previous ${row.label}`}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                ) : <span className="size-7" />}

                <span className="min-w-0 truncate text-center text-sm text-muted-foreground">
                  {formatRangeLabel(row.key, range.start, range.end)}
                </span>

                {showNav ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 focus-visible:ring-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(row.key, 1);
                    }}
                    aria-label={`Next ${row.label}`}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                ) : <span className="size-7" />}
              </div>
            );
          })}

          <div className="my-2 h-px bg-border" />

          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-0",
              granularity === "custom" && "bg-accent/60",
            )}
            onClick={() =>
              applyRange("custom", {
                start: selectedStart,
                end: selectedEnd,
              })
            }
          >
            <span className="flex size-4 items-center justify-center text-primary">
              {granularity === "custom" ? <Check className="size-3.5" /> : null}
            </span>
            Custom
          </button>

          {granularity === "custom" ? (
            <div className="px-2 pb-1 pt-1">
              <DateRangePicker
                value={{ from: selectedStart, to: selectedEnd }}
                onChange={(range) => {
                  if (!range?.from) return;
                  applyRange("custom", {
                    start: range.from,
                    end: range.to ?? range.from,
                  });
                }}
                className="h-8 text-xs focus-visible:ring-0"
                numberOfMonths={2}
              />
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
