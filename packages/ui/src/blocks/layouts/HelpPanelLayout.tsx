"use client";

import { ArrowLeft, Search, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "../../utils";

export interface HelpPanelLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function HelpPanelLayout({
  isOpen,
  onClose,
  onBack,
  canGoBack,
  searchQuery,
  onSearchChange,
  children,
  footer,
  className,
}: HelpPanelLayoutProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Focus search input when panel opens or search expands
  useEffect(() => {
    if (isOpen && isSearchExpanded && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, isSearchExpanded]);

  // Expand search when there's a query
  useEffect(() => {
    if (searchQuery) {
      setIsSearchExpanded(true);
    }
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <aside
      className={cn(
        "fixed right-0 top-0 z-40 h-full w-full sm:w-[400px] bg-background border-l shadow-xl",
        "flex flex-col",
        "animate-in slide-in-from-right duration-200",
        className,
      )}
      aria-label="Help panel"
    >
      {/* Header - matches navbar height */}
      <div className="flex h-14 items-center justify-between gap-3 border-b px-3">
        {/* Left side: back/title or search */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {canGoBack && (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft className="size-4 transition-transform duration-300 hover:-translate-x-0.5" />
            </button>
          )}

          {/* Expandable search - matches DataTableSearch style */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={cn(
                "relative flex items-center rounded-md border border-transparent transition-all duration-300 ease-out",
                isSearchExpanded
                  ? "flex-1 border-input bg-background"
                  : "w-7 hover:bg-accent/50 cursor-pointer",
              )}
            >
              <button
                type="button"
                onMouseDown={(e) => {
                  // Prevent input blur when clicking the toggle button while expanded
                  if (isSearchExpanded) {
                    e.preventDefault();
                  }
                }}
                onClick={() => {
                  if (isSearchExpanded) {
                    onSearchChange("");
                    setIsSearchExpanded(false);
                  } else {
                    setIsSearchExpanded(true);
                  }
                }}
                className="flex size-7 items-center justify-center shrink-0 cursor-pointer"
                aria-label={isSearchExpanded ? "Close search" : "Search help"}
              >
                <Search className="size-4 text-muted-foreground" />
              </button>

              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search help..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onBlur={() => {
                  if (!searchQuery) {
                    setIsSearchExpanded(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    onSearchChange("");
                    setIsSearchExpanded(false);
                  }
                }}
                className={cn(
                  "h-7 bg-transparent text-sm outline-none placeholder:text-muted-foreground transition-all duration-300",
                  isSearchExpanded
                    ? "w-full pr-7 opacity-100"
                    : "w-0 opacity-0 p-0",
                )}
              />

              <div
                className={cn(
                  "absolute right-1.5 transition-opacity duration-200",
                  isSearchExpanded && searchQuery
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none",
                )}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSearchChange("");
                    searchInputRef.current?.focus();
                  }}
                  className="flex items-center justify-center size-5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Close button - matches navbar icon style */}
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close help"
        >
          <X className="size-4 transition-transform duration-300 hover:rotate-90" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">{children}</div>
      </div>

      {/* Footer */}
      {footer && <div className="border-t px-3 py-2">{footer}</div>}
    </aside>
  );
}
