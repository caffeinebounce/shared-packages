"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Switch } from "../../components/ui/switch";

export interface MobilePeriodStepperProps {
  periodLabel: string;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  compareEnabled: boolean;
  onCompareChange: (enabled: boolean) => void;
  compareLabel?: string;
  compareAvailable?: boolean;
}

export function MobilePeriodStepper({
  periodLabel,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  compareEnabled,
  onCompareChange,
  compareLabel,
  compareAvailable = true,
}: MobilePeriodStepperProps) {
  return (
    <div className="md:hidden rounded-lg border bg-muted/15 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Period
        </span>
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border text-muted-foreground disabled:opacity-40"
            aria-label="Previous period"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <span className="min-w-16 text-center text-xs font-semibold">
            {periodLabel}
          </span>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border text-muted-foreground disabled:opacity-40"
            aria-label="Next period"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="text-xs font-medium text-muted-foreground">
          Compare period{compareEnabled && compareLabel ? ` vs ${compareLabel}` : ""}
        </div>
        <Switch
          checked={compareEnabled}
          disabled={!compareAvailable}
          onCheckedChange={onCompareChange}
          aria-label="Toggle compare period"
        />
      </div>
    </div>
  );
}
