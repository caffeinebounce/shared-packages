"use client";

import { Filter } from "lucide-react";
import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";

export interface MobileStatementFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLabel: string;
  comparisonLabel: string;
  filterCount: number;
  children: ReactNode;
  onReset: () => void;
  onApply: () => void;
}

export function MobileStatementFilters({
  open,
  onOpenChange,
  periodLabel,
  comparisonLabel,
  filterCount,
  children,
  onReset,
  onApply,
}: MobileStatementFiltersProps) {
  return (
    <>
      <div className="flex md:hidden items-center gap-2.5 flex-wrap">
        <span className="inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium text-muted-foreground bg-muted/20">
          {periodLabel}
        </span>
        <span className="inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium text-muted-foreground bg-muted/20">
          {comparisonLabel}
        </span>
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="ml-auto inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium"
        >
          <Filter className="size-3.5" />
          Filters
          {filterCount > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {filterCount}
            </span>
          )}
        </button>
      </div>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Update period and statement filters.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-3 pt-2">{children}</div>
          <SheetFooter className="flex-row">
            <button
              type="button"
              onClick={onReset}
              className="flex-1 rounded-md border px-3 py-2 text-sm"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onApply}
              className="flex-1 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
            >
              Apply
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
