"use client";

import { ChevronRight, HelpCircle } from "lucide-react";
import type { ComponentType } from "react";
import type { HelpSearchResult } from "./HelpProvider";

export interface HelpSearchResultsProps {
  results: HelpSearchResult[];
  query: string;
  onSelect: (slug: string) => void;
  categoryIcons?: Record<string, ComponentType<{ className?: string }>>;
}

export function HelpSearchResults({
  results,
  query,
  onSelect,
  categoryIcons = {},
}: HelpSearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <HelpCircle className="size-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">
          No results found for &ldquo;{query}&rdquo;
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Try different keywords or browse categories below
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-3">
        {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;
        {query}&rdquo;
      </p>
      {results.map((result) => {
        const Icon = categoryIcons[result.category] || HelpCircle;
        return (
          <button
            key={result.slug}
            type="button"
            onClick={() => onSelect(result.slug)}
            className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-start gap-3">
              <Icon className="size-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{result.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {result.description}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground shrink-0" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
