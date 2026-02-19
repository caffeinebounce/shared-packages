"use client";

import { Check, Minus, Percent, Plus } from "lucide-react";

import { Button } from "../../components/ui/button";
import { DateRangePicker } from "../../components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { cn } from "../../utils";

export type ComparisonMode =
  | "none"
  | "previous"
  | "same-period-last-year"
  | "custom";

export interface ComparisonSelectorProps {
  /** Current comparison mode */
  mode: ComparisonMode;
  /** Number of comparison periods (for previous/same-period modes) */
  periods: number;
  /** Suggested default count for Previous Period (e.g. LTM => 12) */
  defaultPreviousPeriods?: number;
  /** Custom comparison date range (when mode = "custom") */
  customStart?: string;
  customEnd?: string;
  /** Called when comparison settings change */
  onChange: (params: {
    mode: ComparisonMode;
    periods: number;
    customStart?: string;
    customEnd?: string;
  }) => void;
  /** Optional className */
  className?: string;
}

function getTriggerLabel(mode: ComparisonMode) {
  if (mode === "none") return "Comparison";
  if (mode === "previous") return "vs Prior Period";
  if (mode === "same-period-last-year") return "vs Last Year";
  return "vs Custom";
}

export function ComparisonSelector({
  mode,
  periods,
  defaultPreviousPeriods = 1,
  customStart,
  customEnd,
  onChange,
  className,
}: ComparisonSelectorProps) {
  const setMode = (nextMode: ComparisonMode) => {
    const nextPeriods =
      nextMode === "previous"
        ? Math.max(1, mode === "previous" ? periods : defaultPreviousPeriods)
        : nextMode === "same-period-last-year"
          ? 1
          : periods || 1;
    onChange({
      mode: nextMode,
      periods: nextPeriods,
      customStart,
      customEnd,
    });
  };

  const updatePreviousPeriods = (nextPeriods: number) => {
    const bounded = Math.min(24, Math.max(1, nextPeriods));
    onChange({
      mode: "previous",
      periods: bounded,
      customStart,
      customEnd,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-8 min-w-[140px] justify-between gap-2 focus-visible:ring-0", className)}>
          <Percent className="size-4" />
          <span>{getTriggerLabel(mode)}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[380px] p-2" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setMode("none")}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-0"
          >
            <Check
              className={cn(
                "size-4 text-primary transition-opacity",
                mode === "none" ? "opacity-100" : "opacity-0",
              )}
            />
            <span>No Comparison</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("previous")}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-0"
          >
            <Check
              className={cn(
                "size-4 text-primary transition-opacity",
                mode === "previous" ? "opacity-100" : "opacity-0",
              )}
            />
            <span className="flex-1">Previous Period</span>

            <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-background px-1 py-0.5 text-xs">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  updatePreviousPeriods((mode === "previous" ? periods : defaultPreviousPeriods) - 1);
                }}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 focus-visible:outline-none focus-visible:ring-0"
                disabled={(mode === "previous" ? periods : defaultPreviousPeriods) <= 1}
                aria-label="Decrease previous periods"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-6 text-center">{mode === "previous" ? periods : defaultPreviousPeriods}</span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  updatePreviousPeriods((mode === "previous" ? periods : defaultPreviousPeriods) + 1);
                }}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 focus-visible:outline-none focus-visible:ring-0"
                disabled={(mode === "previous" ? periods : defaultPreviousPeriods) >= 24}
                aria-label="Increase previous periods"
              >
                <Plus className="size-3" />
              </button>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode("same-period-last-year")}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-0"
          >
            <Check
              className={cn(
                "size-4 text-primary transition-opacity",
                mode === "same-period-last-year" ? "opacity-100" : "opacity-0",
              )}
            />
            <span className="flex-1">Same Period Last Year</span>
          </button>

          <div className="my-1 h-px bg-border" />

          <button
            type="button"
            onClick={() => setMode("custom")}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-0"
          >
            <Check
              className={cn(
                "size-4 text-primary transition-opacity",
                mode === "custom" ? "opacity-100" : "opacity-0",
              )}
            />
            <span>Custom</span>
          </button>

          {mode === "custom" ? (
            <div className="px-2 pt-1">
              <DateRangePicker
                value={{ from: customStart ? new Date(customStart) : undefined, to: customEnd ? new Date(customEnd) : undefined }}
                onChange={(range) =>
                  onChange({
                    mode: "custom",
                    periods,
                    customStart: range?.from ? range.from.toISOString().slice(0, 10) : undefined,
                    customEnd: range?.to ? range.to.toISOString().slice(0, 10) : (range?.from ? range.from.toISOString().slice(0, 10) : undefined),
                  })
                }
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
