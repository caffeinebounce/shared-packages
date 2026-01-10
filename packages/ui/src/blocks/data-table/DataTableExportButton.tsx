"use client";

import { Download } from "lucide-react";
import * as React from "react";

import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { cn } from "../../utils";
import { useDataTableContext } from "./DataTable";
import { dataTableTopperButtonProps } from "./data-table-styles";

export interface DataTableExportButtonProps {
  /** Callback when export is triggered. Should return a Promise that resolves when export is complete. */
  onExport: () => Promise<void>;
  /** Label for the tooltip */
  label?: string;
  /** File format hint (e.g., "CSV", "Excel") - shown in tooltip */
  format?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
}

/**
 * Export button for DataTable with loading state.
 * Icon-only button styled consistently with other DataTable topper buttons.
 *
 * @example
 * ```tsx
 * <DataTableExportButton
 *   onExport={async () => {
 *     const blob = await fetchExport();
 *     downloadBlob(blob, "data.csv");
 *   }}
 *   format="CSV"
 * />
 * ```
 */
export function DataTableExportButton({
  onExport,
  label = "Export",
  format = "CSV",
  disabled = false,
}: DataTableExportButtonProps) {
  const context = useDataTableContext();
  const fontSizeClass = context?.fontSizeClass ?? "text-xs";
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = React.useCallback(async () => {
    if (disabled) return;
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  }, [onExport, disabled]);

  const tooltipText = `${label} as ${format}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          {...dataTableTopperButtonProps}
          onClick={handleExport}
          disabled={isExporting || disabled}
          className={cn(fontSizeClass)}
        >
          {isExporting ? (
            <Spinner className="size-4" />
          ) : (
            <Download className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent className={fontSizeClass}>{tooltipText}</TooltipContent>
    </Tooltip>
  );
}
