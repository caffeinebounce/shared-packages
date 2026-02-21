"use client";

import {
  Building2,
  Download,
  FileSpreadsheet,
  FileText,
  MapPin,
  Settings2,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Combobox } from "../../components/ui/combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Switch } from "../../components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import type { ComparisonMode } from "./ComparisonSelector";
import { ComparisonSelector } from "./ComparisonSelector";
import { MobilePeriodStepper } from "./MobilePeriodStepper";
import { MobileStatementActions } from "./MobileStatementActions";
import { MobileStatementFilters } from "./MobileStatementFilters";
import type { PeriodGranularity } from "./PeriodSelector";
import { PeriodSelector } from "./PeriodSelector";

interface FilterOption {
  id: string;
  name: string;
}

interface FinancialStatementControlsProps {
  granularity: PeriodGranularity;
  periodStart: string;
  periodEnd: string;
  fiscalYearEndMonth?: number;
  comparisonMode: ComparisonMode;
  comparisonPeriods: number;
  comparisonCustomStart?: string;
  comparisonCustomEnd?: string;
  selectedClass: string;
  selectedDepartment: string;
  classes: FilterOption[];
  departments: FilterOption[];
  isLoading: boolean;
  mobileFiltersOpen: boolean;
  periodChipLabel: string;
  comparisonChipLabel: string;
  activeFilterCount: number;
  hideZeroRows: boolean;
  showRowTotals: boolean;
  mobilePeriodLabel: string;
  mobileCompareLabel?: string;
  hasMobilePrev: boolean;
  hasMobileNext: boolean;
  mobileCompareEnabled: boolean;
  hasMobileComparisonCandidate: boolean;
  onPeriodChange: (params: {
    granularity: PeriodGranularity;
    periodStart: string;
    periodEnd: string;
    timeUnit: "month" | "quarter" | "year";
  }) => void;
  onComparisonChange: (params: {
    mode: ComparisonMode;
    periods: number;
    customStart?: string;
    customEnd?: string;
  }) => void;
  onClassChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onMobileFiltersOpenChange: (open: boolean) => void;
  onResetFilters: () => void;
  onApplyFilters: () => void;
  onExport: (format: "csv" | "excel") => void;
  onHideZeroRowsChange: (checked: boolean) => void;
  onShowRowTotalsChange: (checked: boolean) => void;
  onMobilePrev: () => void;
  onMobileNext: () => void;
  onMobileCompareChange: (enabled: boolean) => void;
  classIcon?: ReactNode;
  departmentIcon?: ReactNode;
  exportIcon?: ReactNode;
  settingsIcon?: ReactNode;
  csvIcon?: ReactNode;
  excelIcon?: ReactNode;
}

export function FinancialStatementControls({
  granularity,
  periodStart,
  periodEnd,
  fiscalYearEndMonth = 12,
  comparisonMode,
  comparisonPeriods,
  comparisonCustomStart,
  comparisonCustomEnd,
  selectedClass,
  selectedDepartment,
  classes,
  departments,
  isLoading,
  mobileFiltersOpen,
  periodChipLabel,
  comparisonChipLabel,
  activeFilterCount,
  hideZeroRows,
  showRowTotals,
  mobilePeriodLabel,
  mobileCompareLabel,
  hasMobilePrev,
  hasMobileNext,
  mobileCompareEnabled,
  hasMobileComparisonCandidate,
  onPeriodChange,
  onComparisonChange,
  onClassChange,
  onDepartmentChange,
  onMobileFiltersOpenChange,
  onResetFilters,
  onApplyFilters,
  onExport,
  onHideZeroRowsChange,
  onShowRowTotalsChange,
  onMobilePrev,
  onMobileNext,
  onMobileCompareChange,
  classIcon,
  departmentIcon,
  exportIcon,
  settingsIcon,
  csvIcon,
  excelIcon,
}: FinancialStatementControlsProps) {
  const desktopToolbarRef = useRef<HTMLDivElement>(null);
  const [useCompactFilters, setUseCompactFilters] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateCompactFilters = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const shortestSide = Math.min(width, height);
      const isTouchDevice =
        window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
        navigator.maxTouchPoints > 0;
      const isLandscapeMobile =
        isTouchDevice && width > height && shortestSide < 900;
      const isSmallViewport = width < 768;

      const desktopToolbar = desktopToolbarRef.current;
      const desktopWrapRisk =
        !!desktopToolbar &&
        desktopToolbar.scrollWidth > desktopToolbar.clientWidth;

      setUseCompactFilters(
        isSmallViewport || isLandscapeMobile || desktopWrapRisk,
      );
    };

    updateCompactFilters();

    const ro = new ResizeObserver(() => updateCompactFilters());
    if (desktopToolbarRef.current) {
      ro.observe(desktopToolbarRef.current);
    }

    window.addEventListener("resize", updateCompactFilters);
    window.addEventListener("orientationchange", updateCompactFilters);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateCompactFilters);
      window.removeEventListener("orientationchange", updateCompactFilters);
    };
  }, []);

  return (
    <>
      <div className="space-y-2">
        <div
          ref={desktopToolbarRef}
          className={
            useCompactFilters
              ? "hidden"
              : "hidden md:flex items-center gap-2 flex-nowrap"
          }
        >
          <PeriodSelector
            granularity={granularity}
            periodStart={periodStart}
            periodEnd={periodEnd}
            fiscalYearEndMonth={fiscalYearEndMonth}
            onChange={onPeriodChange}
          />

          <ComparisonSelector
            mode={granularity === "ltm" ? "previous" : comparisonMode}
            periods={granularity === "ltm" ? 11 : comparisonPeriods}
            defaultPreviousPeriods={granularity === "ltm" ? 11 : 1}
            customStart={comparisonCustomStart}
            customEnd={comparisonCustomEnd}
            onChange={onComparisonChange}
          />

          <Combobox
            size="sm"
            className="w-[190px]"
            icon={classIcon ?? <Building2 className="h-4 w-4" />}
            value={selectedClass}
            disabled={false}
            onValueChange={(value) => onClassChange(value || "")}
            options={[
              { value: "__unspecified__", label: "Unspecified" },
              ...classes.map((option) => ({
                value: option.id,
                label: option.name,
              })),
            ]}
            placeholder="Class"
            mutedPlaceholder={false}
            searchPlaceholder="Search classes..."
            emptyText="No classes found"
          />

          <Combobox
            size="sm"
            className="w-[190px]"
            icon={departmentIcon ?? <MapPin className="h-4 w-4" />}
            value={selectedDepartment}
            disabled={false}
            onValueChange={(value) => onDepartmentChange(value || "")}
            options={[
              { value: "__unspecified__", label: "Unspecified" },
              ...departments.map((option) => ({
                value: option.id,
                label: option.name,
              })),
            ]}
            placeholder="Location"
            mutedPlaceholder={false}
            searchPlaceholder="Search locations..."
            emptyText="No locations found"
          />

          <div className="ml-auto" />

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <div className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground">
                    {exportIcon ?? <Download size={16} />}
                  </div>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Export</TooltipContent>
            </Tooltip>
            <PopoverContent align="end" className="w-40 p-1">
              <button
                type="button"
                onClick={() => onExport("csv")}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
              >
                {csvIcon ?? (
                  <FileText size={14} className="text-muted-foreground" />
                )}
                CSV
              </button>
              <button
                type="button"
                onClick={() => onExport("excel")}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
              >
                {excelIcon ?? (
                  <FileSpreadsheet className="size-3.5 text-muted-foreground" />
                )}
                Excel
              </button>
            </PopoverContent>
          </Popover>

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <div className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground">
                    {settingsIcon ?? <Settings2 size={16} />}
                  </div>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Settings</TooltipContent>
            </Tooltip>
            <PopoverContent align="end" className="w-52 p-2">
              <div className="space-y-1">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  Display Settings
                </p>
                <button
                  type="button"
                  onClick={() => onHideZeroRowsChange(!hideZeroRows)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
                >
                  <span>Hide zero rows</span>
                  <Switch
                    checked={hideZeroRows}
                    onCheckedChange={onHideZeroRowsChange}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => onShowRowTotalsChange(!showRowTotals)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
                >
                  <span>Show row totals</span>
                  <Switch
                    checked={showRowTotals}
                    onCheckedChange={onShowRowTotalsChange}
                  />
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div
          className={
            useCompactFilters
              ? "flex w-full items-center justify-end gap-2.5 flex-wrap"
              : "flex md:hidden items-center gap-2.5 flex-wrap"
          }
        >
          {useCompactFilters && (
            <>
              <span className="inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium text-muted-foreground bg-muted/20">
                {periodChipLabel}
              </span>
              <span className="inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium text-muted-foreground bg-muted/20">
                {comparisonChipLabel}
              </span>
            </>
          )}

          <MobileStatementFilters
            open={mobileFiltersOpen}
            onOpenChange={onMobileFiltersOpenChange}
            periodLabel={periodChipLabel}
            comparisonLabel={comparisonChipLabel}
            filterCount={activeFilterCount}
            showSummaryChips={!useCompactFilters}
            onReset={onResetFilters}
            onApply={onApplyFilters}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <PeriodSelector
                granularity={granularity}
                periodStart={periodStart}
                periodEnd={periodEnd}
                fiscalYearEndMonth={fiscalYearEndMonth}
                onChange={onPeriodChange}
                className="w-full justify-start"
              />
              <ComparisonSelector
                mode={granularity === "ltm" ? "previous" : comparisonMode}
                periods={granularity === "ltm" ? 11 : comparisonPeriods}
                defaultPreviousPeriods={granularity === "ltm" ? 11 : 1}
                customStart={comparisonCustomStart}
                customEnd={comparisonCustomEnd}
                onChange={onComparisonChange}
                className="w-full justify-start"
              />
            </div>
            <Combobox
              size="sm"
              icon={classIcon ?? <Building2 className="h-4 w-4" />}
              value={selectedClass}
              disabled={false}
              onValueChange={(value) => onClassChange(value || "")}
              options={[
                { value: "__unspecified__", label: "Unspecified" },
                ...classes.map((option) => ({
                  value: option.id,
                  label: option.name,
                })),
              ]}
              placeholder="Class"
              mutedPlaceholder={false}
              searchPlaceholder="Search classes..."
              emptyText="No classes found"
            />
            <Combobox
              size="sm"
              icon={departmentIcon ?? <MapPin className="h-4 w-4" />}
              value={selectedDepartment}
              disabled={false}
              onValueChange={(value) => onDepartmentChange(value || "")}
              options={[
                { value: "__unspecified__", label: "Unspecified" },
                ...departments.map((option) => ({
                  value: option.id,
                  label: option.name,
                })),
              ]}
              placeholder="Location"
              mutedPlaceholder={false}
              searchPlaceholder="Search locations..."
              emptyText="No locations found"
            />
          </MobileStatementFilters>

          <MobileStatementActions
            exports={[
              {
                label: "CSV",
                icon: csvIcon ?? <FileText size={14} />,
                onClick: () => onExport("csv"),
              },
              {
                label: "Excel",
                icon: excelIcon ?? <FileSpreadsheet className="size-3.5" />,
                onClick: () => onExport("excel"),
              },
            ]}
            settings={[
              {
                label: "Hide zero rows",
                checked: hideZeroRows,
                onCheckedChange: onHideZeroRowsChange,
                ariaLabel: "Toggle hide zero rows",
              },
              {
                label: "Show row totals",
                checked: showRowTotals,
                onCheckedChange: onShowRowTotalsChange,
                ariaLabel: "Toggle show row totals",
              },
            ]}
          />
        </div>
      </div>

      <MobilePeriodStepper
        periodLabel={mobilePeriodLabel}
        onPrev={onMobilePrev}
        onNext={onMobileNext}
        hasPrev={hasMobilePrev}
        hasNext={hasMobileNext}
        compareEnabled={mobileCompareEnabled}
        onCompareChange={onMobileCompareChange}
        compareAvailable={hasMobileComparisonCandidate}
        compareLabel={mobileCompareLabel}
      />
    </>
  );
}

export type { FinancialStatementControlsProps };
