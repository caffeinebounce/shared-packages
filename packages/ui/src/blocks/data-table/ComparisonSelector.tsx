"use client";

import { Check, Percent } from "lucide-react";

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
  customStart,
  customEnd,
  onChange,
  className,
}: ComparisonSelectorProps) {
  const setMode = (nextMode: ComparisonMode) => {
    onChange({
      mode: nextMode,
      periods: nextMode === "none" ? periods || 1 : 1,
      customStart,
      customEnd,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-8 w-[190px] justify-between gap-2 focus-visible:ring-0", className)}>
          <Percent className="size-3.5" />
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
