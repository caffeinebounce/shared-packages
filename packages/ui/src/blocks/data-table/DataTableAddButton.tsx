"use client";

import { Plus } from "lucide-react";
import type * as React from "react";
import { Button, type ButtonProps } from "../../components/ui/button";
import { cn } from "../../utils";
import { useDataTableContext } from "./DataTable";
import {
  dataTableTopperButtonProps,
  dataTableTopperResponsiveClasses,
} from "./data-table-styles";

/**
 * Props for DataTableAddButton
 */
export interface DataTableAddButtonProps
  extends Omit<ButtonProps, "variant" | "size"> {
  /** Label text to display (defaults to "Add") */
  label?: string;
  /** Custom icon to use instead of Plus */
  icon?: React.ReactNode;
  /** Hide label on small screens (responsive) */
  responsiveLabel?: boolean;
}

/**
 * Standardized "Add" button for DataTable headers.
 *
 * Provides a consistent styling pattern:
 * - Ghost variant with muted text that highlights on hover
 * - Small size with compact height (h-7)
 * - Plus icon by default
 * - Optional responsive label (hidden on small screens)
 *
 * @example
 * ```tsx
 * <DataTableTopper>
 *   <DataTableViews ... />
 *   <DataTableSearch ... />
 *   <DataTableAddButton onClick={() => setShowDialog(true)} />
 * </DataTableTopper>
 * ```
 *
 * @example With custom label
 * ```tsx
 * <DataTableAddButton label="New User" onClick={handleAdd} />
 * ```
 *
 * @example Non-responsive (always show label)
 * ```tsx
 * <DataTableAddButton label="Add" responsiveLabel={false} onClick={handleAdd} />
 * ```
 */
export function DataTableAddButton({
  label = "Add",
  icon,
  responsiveLabel = true,
  className,
  children,
  ...props
}: DataTableAddButtonProps) {
  const context = useDataTableContext();
  const fontSizeClass = context?.fontSizeClass ?? "text-xs";

  const iconElement = icon ?? <Plus className="size-4" />;

  return (
    <Button
      {...dataTableTopperButtonProps}
      className={cn(
        fontSizeClass,
        responsiveLabel ? dataTableTopperResponsiveClasses : "px-2 w-auto",
        className,
      )}
      {...props}
    >
      {iconElement}
      {responsiveLabel ? (
        <span className="hidden @min-[450px]:inline">{children ?? label}</span>
      ) : (
        <span>{children ?? label}</span>
      )}
    </Button>
  );
}
