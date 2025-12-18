"use client";

import { Search, X } from "lucide-react";
import * as React from "react";

import { cn } from "../../utils";

export interface DataTableToolbarProps extends React.ComponentProps<"div"> {
  /** Search value */
  searchValue?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Callback when search value changes */
  onSearchChange?: (value: string) => void;
}

/**
 * Expandable search input for the data table.
 * Starts as a search icon and expands into a full input on click.
 */
export function DataTableSearch({
  searchValue = "",
  searchPlaceholder = "Search...",
  onSearchChange,
  className,
}: {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-expand if there's a search value
  React.useEffect(() => {
    if (searchValue && !isExpanded) {
      setIsExpanded(true);
    }
  }, [searchValue, isExpanded]);

  // Focus input when expanded
  React.useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleBlur = () => {
    // Only collapse if empty
    if (!searchValue) {
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    onSearchChange?.("");
    setIsExpanded(false);
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <div
        className={cn(
          "flex items-center rounded-md border border-transparent transition-all duration-200 ease-out",
          isExpanded
            ? "w-48 border-input bg-background"
            : "w-7 hover:bg-accent/50 cursor-pointer",
        )}
      >
        <button
          type="button"
          onClick={() => !isExpanded && setIsExpanded(true)}
          className={cn(
            "flex items-center justify-center shrink-0 transition-colors",
            isExpanded ? "size-7 cursor-default" : "size-7",
          )}
          aria-label={isExpanded ? undefined : "Search"}
        >
          <Search className="size-4 text-muted-foreground" />
        </button>

        <input
          ref={inputRef}
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          onBlur={handleBlur}
          className={cn(
            "h-7 bg-transparent text-sm outline-none placeholder:text-muted-foreground transition-all duration-200",
            isExpanded ? "w-full pr-7 opacity-100" : "w-0 opacity-0",
          )}
        />

        {isExpanded && searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-1.5 flex items-center justify-center size-5 rounded-sm hover:bg-accent/50"
            aria-label="Clear search"
          >
            <X className="size-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Toolbar container for the data table.
 * Provides search input and container for filter/view controls.
 */
export function DataTableToolbar({
  searchValue = "",
  searchPlaceholder = "Search...",
  onSearchChange,
  className,
  children,
  ...props
}: DataTableToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        "flex w-full items-center justify-end gap-1 px-1",
        className,
      )}
      {...props}
    >
      {onSearchChange && (
        <DataTableSearch
          searchValue={searchValue}
          searchPlaceholder={searchPlaceholder}
          onSearchChange={onSearchChange}
        />
      )}
      {children}
    </div>
  );
}
