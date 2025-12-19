"use client";

import type { Column } from "@tanstack/react-table";
import { Check, type LucideIcon, MoreHorizontal, Trash2 } from "lucide-react";
import * as React from "react";

import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { cn } from "../../utils";

/** Filter type determines the UI shown */
export type FilterType = "text" | "select" | "boolean" | "number";

/** Filter operator for conditions */
export type FilterOperator =
  | "is"
  | "is_not"
  | "contains"
  | "does_not_contain"
  | "is_empty"
  | "is_not_empty";

/** Option for select/boolean filters */
export interface FilterOption {
  label: string;
  value: string;
  /** Color indicator (e.g., "green", "red", "blue", "#22c55e") */
  color?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Custom badge element to render (takes precedence over color/icon) */
  badge?: React.ReactNode;
}

/** Props for DataTableColumnFilter */
export interface DataTableColumnFilterProps<TData, TValue> {
  /** TanStack Table column instance */
  column: Column<TData, TValue>;
  /** Column display name */
  title: string;
  /** Type of filter UI to show */
  filterType?: FilterType;
  /** Options for select/enum filters */
  filterOptions?: FilterOption[];
  /** Placeholder for text input */
  placeholder?: string;
  /** Children (trigger element) */
  children: React.ReactNode;
  /** Callback when filter value changes */
  onFilterChange?: (columnId: string, value: unknown) => void;
}

/** Color map for common status colors */
const colorMap: Record<string, string> = {
  green: "#22c55e",
  red: "#ef4444",
  blue: "#3b82f6",
  yellow: "#eab308",
  orange: "#f97316",
  purple: "#a855f7",
  pink: "#ec4899",
  gray: "#6b7280",
  slate: "#64748b",
};

/** Get color value (supports named colors and hex) */
function getColorValue(color?: string): string | undefined {
  if (!color) return undefined;
  return colorMap[color.toLowerCase()] ?? color;
}

/**
 * Filter UI content (reusable) - Notion-style
 */
export function DataTableColumnFilterContent({
  title,
  value,
  onChange,
  onClear,
  onDelete,
  filterType = "text",
  filterOptions,
  placeholder,
  showDeleteMenu = true,
}: {
  title: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  onClear?: () => void;
  onDelete?: () => void;
  filterType?: FilterType;
  filterOptions?: FilterOption[];
  placeholder?: string;
  /** Whether to show the 3-dots delete menu (hide when creating new filter from column header) */
  showDeleteMenu?: boolean;
}) {
  const [localValue, setLocalValue] = React.useState<string>(value ?? "");
  const [operator, setOperator] = React.useState<FilterOperator>("is");

  React.useEffect(() => setLocalValue(value ?? ""), [value]);

  const handleApply = () => onChange(localValue || undefined);
  const handleClear = () => {
    setLocalValue("");
    onClear?.();
    onChange(undefined);
  };

  // Parse multi-select value (comma-separated)
  const selectedValues = React.useMemo(() => {
    if (!localValue) return new Set<string>();
    return new Set(localValue.split(",").filter(Boolean));
  }, [localValue]);

  const toggleOption = (optionValue: string) => {
    const newSelected = new Set(selectedValues);
    if (newSelected.has(optionValue)) {
      newSelected.delete(optionValue);
    } else {
      newSelected.add(optionValue);
    }
    const newValue = Array.from(newSelected).join(",");
    setLocalValue(newValue);
    // Auto-apply for select types
    onChange(newValue || undefined);
  };

  // Only show delete menu if there's an active value
  const hasValue = Boolean(localValue);

  return (
    <div className="w-48">
      {/* Header: Title + Operator + Menu */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/40">
        <span className="text-xs text-muted-foreground">{title}</span>

        <Select
          value={operator}
          onValueChange={(v) => setOperator(v as FilterOperator)}
        >
          <SelectTrigger className="!h-auto !min-h-0 !py-0 w-auto gap-0.5 border-0 shadow-none bg-transparent px-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded focus:ring-0 focus:ring-offset-0 focus-visible:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="is" className="text-xs">
              is
            </SelectItem>
            <SelectItem value="is_not" className="text-xs">
              is not
            </SelectItem>
            {filterType === "text" && (
              <>
                <SelectItem value="contains" className="text-xs">
                  contains
                </SelectItem>
                <SelectItem value="does_not_contain" className="text-xs">
                  does not contain
                </SelectItem>
              </>
            )}
            <SelectItem value="is_empty" className="text-xs">
              is empty
            </SelectItem>
            <SelectItem value="is_not_empty" className="text-xs">
              is not empty
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        {showDeleteMenu && hasValue && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="size-5 p-0 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" sideOffset={4}>
              <DropdownMenuItem
                onClick={onDelete ?? handleClear}
                className="text-xs gap-2"
              >
                <Trash2 className="size-3.5" />
                Delete filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Filter content based on type */}
      <div className="p-0.5">
        {filterType === "text" && (
          <div className="p-2">
            <Input
              placeholder={placeholder ?? `Search ${title.toLowerCase()}...`}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApply();
                }
              }}
              className="h-7 text-xs"
              autoFocus
            />
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                className="h-6 text-xs px-2.5"
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>
        )}

        {filterType === "number" && (
          <div className="p-2">
            <Input
              type="number"
              placeholder={placeholder ?? `Enter ${title.toLowerCase()}...`}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApply();
                }
              }}
              className="h-7 text-xs"
              autoFocus
            />
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                className="h-6 text-xs px-2.5"
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>
        )}

        {filterType === "select" && filterOptions && (
          <div className="max-h-64 overflow-y-auto">
            {filterOptions.map((option) => {
              const isSelected = selectedValues.has(option.value);
              const colorValue = getColorValue(option.color);

              return (
                <button
                  type="button"
                  key={option.value}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => toggleOption(option.value)}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded-sm border self-center",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30",
                    )}
                  >
                    {isSelected && <Check className="size-2.5" />}
                  </div>

                  {/* Badge or fallback to color/icon + label */}
                  {option.badge ? (
                    <span className="shrink-0 flex items-center">
                      {option.badge}
                    </span>
                  ) : (
                    <>
                      {(colorValue || option.icon) && (
                        <span className="shrink-0">
                          {option.icon ? (
                            option.icon
                          ) : (
                            <span
                              className="inline-block size-2 rounded-full"
                              style={{ backgroundColor: colorValue }}
                            />
                          )}
                        </span>
                      )}
                      <span className="truncate">{option.label}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {filterType === "boolean" && (
          <div>
            {(
              filterOptions ?? [
                { label: "Yes", value: "true", color: "green" },
                { label: "No", value: "false", color: "red" },
              ]
            ).map((opt) => {
              const isSelected = selectedValues.has(opt.value);
              const colorValue = opt.color
                ? getColorValue(opt.color)
                : undefined;

              // Render icon properly
              let iconElement: React.ReactNode = null;
              if (opt.icon) {
                if (React.isValidElement(opt.icon)) {
                  iconElement = opt.icon;
                } else {
                  const Icon = opt.icon as unknown as LucideIcon;
                  iconElement = <Icon className="size-3" />;
                }
              }

              return (
                <button
                  key={opt.value}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => toggleOption(opt.value)}
                >
                  <div
                    className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded-sm border self-center",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30",
                    )}
                  >
                    {isSelected && <Check className="size-2.5" />}
                  </div>
                  {opt.badge ? (
                    <span className="flex items-center">{opt.badge}</span>
                  ) : (
                    <>
                      {colorValue && (
                        <span
                          className="inline-block size-2 rounded-full"
                          style={{ backgroundColor: colorValue }}
                        />
                      )}
                      {iconElement && (
                        <span className="text-muted-foreground [&>svg]:size-3">
                          {iconElement}
                        </span>
                      )}
                      <span>{opt.label}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Clear footer */}
      {(filterType === "select" || filterType === "boolean") &&
        selectedValues.size > 0 && (
          <div className="border-t border-border/40 p-0.5">
            <button
              type="button"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        )}
    </div>
  );
}

/**
 * Column filter popover component.
 * Shows appropriate filter UI based on filterType.
 */
export function DataTableColumnFilter<TData, TValue>({
  column,
  title,
  filterType = "text",
  filterOptions,
  placeholder,
  children,
  onFilterChange,
}: DataTableColumnFilterProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);
  const current = column.getFilterValue() as string | undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <DataTableColumnFilterContent
          title={title}
          value={current}
          onChange={(v) => {
            column.setFilterValue(v);
            onFilterChange?.(column.id, v);
          }}
          onClear={() => column.setFilterValue(undefined)}
          filterType={filterType}
          filterOptions={filterOptions}
          placeholder={placeholder}
          showDeleteMenu={false}
        />
      </PopoverContent>
    </Popover>
  );
}
