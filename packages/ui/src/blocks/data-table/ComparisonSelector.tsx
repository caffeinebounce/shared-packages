"use client";

import { Check, ChevronLeft, ChevronRight, Percent } from "lucide-react";

import { Button } from "../../components/ui/button";
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

function getTriggerLabel(mode: ComparisonMode, periods: number) {
  if (mode === "none") return "Comparison";

  if (mode === "previous") {
    return periods === 1 ? "vs Prior Period" : `vs ${periods} Prior Periods`;
  }

  if (mode === "same-period-last-year") {
    return periods === 1 ? "vs Last Year" : `vs ${periods} Years Ago`;
  }

  return "vs Custom";
}

export function ComparisonSelector({
  mode,
  periods,
  customStart,
  customEnd,
  onChange,
  className,
}: ComparisonSelectorProps) {
  const setMode = (nextMode: ComparisonMode) => {
    if (nextMode === "previous") {
      onChange({ mode: nextMode, periods: Math.min(5, Math.max(1, periods || 1)) });
      return;
    }

    if (nextMode === "same-period-last-year") {
      onChange({ mode: nextMode, periods: Math.min(3, Math.max(1, periods || 1)) });
      return;
    }

    onChange({
      mode: nextMode,
      periods: periods || 1,
      customStart,
      customEnd,
    });
  };

  const updatePeriods = (nextPeriods: number) => {
    const bounded =
      mode === "previous"
        ? Math.min(5, Math.max(1, nextPeriods))
        : Math.min(3, Math.max(1, nextPeriods));

    onChange({
      mode,
      periods: bounded,
      customStart,
      customEnd,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <Percent className="size-3.5" />
          <span>{getTriggerLabel(mode, periods)}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[320px] p-2">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setMode("none")}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
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
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
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
                  if (mode !== "previous") setMode("previous");
                  updatePeriods((mode === "previous" ? periods : 1) - 1);
                }}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                disabled={(mode === "previous" ? periods : 1) <= 1}
                aria-label="Decrease previous periods"
              >
                <ChevronLeft className="size-3" />
              </button>
              <span className="w-4 text-center">{mode === "previous" ? periods : 1}</span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  if (mode !== "previous") setMode("previous");
                  updatePeriods((mode === "previous" ? periods : 1) + 1);
                }}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                disabled={(mode === "previous" ? periods : 1) >= 5}
                aria-label="Increase previous periods"
              >
                <ChevronRight className="size-3" />
              </button>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode("same-period-last-year")}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
          >
            <Check
              className={cn(
                "size-4 text-primary transition-opacity",
                mode === "same-period-last-year" ? "opacity-100" : "opacity-0",
              )}
            />
            <span className="flex-1">Same Period Last Year</span>

            <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-background px-1 py-0.5 text-xs">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  if (mode !== "same-period-last-year") setMode("same-period-last-year");
                  updatePeriods((mode === "same-period-last-year" ? periods : 1) - 1);
                }}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                disabled={(mode === "same-period-last-year" ? periods : 1) <= 1}
                aria-label="Decrease years"
              >
                <ChevronLeft className="size-3" />
              </button>
              <span className="w-4 text-center">
                {mode === "same-period-last-year" ? periods : 1}
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  if (mode !== "same-period-last-year") setMode("same-period-last-year");
                  updatePeriods((mode === "same-period-last-year" ? periods : 1) + 1);
                }}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                disabled={(mode === "same-period-last-year" ? periods : 1) >= 3}
                aria-label="Increase years"
              >
                <ChevronRight className="size-3" />
              </button>
            </span>
          </button>

          <div className="my-1 h-px bg-border" />

          <button
            type="button"
            onClick={() => setMode("custom")}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
          >
            <Check
              className={cn(
                "size-4 text-primary transition-opacity",
                mode === "custom" ? "opacity-100" : "opacity-0",
              )}
            />
            <span>Custom Dates</span>
          </button>

          {mode === "custom" ? (
            <div className="grid grid-cols-2 gap-2 px-2 pt-1">
              <label className="flex min-w-0 flex-col gap-1 text-[11px] text-muted-foreground">
                Start
                <input
                  type="date"
                  value={customStart ?? ""}
                  onChange={(event) =>
                    onChange({
                      mode: "custom",
                      periods,
                      customStart: event.target.value || undefined,
                      customEnd,
                    })
                  }
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-1 text-[11px] text-muted-foreground">
                End
                <input
                  type="date"
                  value={customEnd ?? ""}
                  onChange={(event) =>
                    onChange({
                      mode: "custom",
                      periods,
                      customStart,
                      customEnd: event.target.value || undefined,
                    })
                  }
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </label>
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
