"use client";

import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Spinner } from "../ui/spinner";
import type { HelpArticle } from "./HelpProvider";

export interface HelpArticleViewProps {
  article: HelpArticle;
  onNavigate: (slug: string) => void;
  onBackToIndex: () => void;
  relatedArticles?: HelpArticle[];
  isLoading?: boolean;
  children?: ReactNode;
}

export function HelpArticleView({
  article,
  onNavigate,
  onBackToIndex,
  relatedArticles = [],
  isLoading = false,
  children,
}: HelpArticleViewProps) {
  return (
    <div className="space-y-6">
      {/* Article header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <button
            type="button"
            onClick={onBackToIndex}
            className="capitalize hover:text-foreground hover:underline transition-colors cursor-pointer"
          >
            {article.category}
          </button>
          {article.subcategory && (
            <>
              <ChevronRight className="size-3" />
              <span className="capitalize">{article.subcategory}</span>
            </>
          )}
        </div>
        <h1 className="text-xl font-semibold">{article.title}</h1>
        <p className="text-muted-foreground mt-1">{article.description}</p>
      </div>

      {/* Article content */}
      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary hover:prose-a:underline [&>*:first-child]:mt-0">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : children ? (
          children
        ) : (
          <p className="text-muted-foreground">
            Failed to load article content. Please try again later.
          </p>
        )}
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="pt-4 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex px-2 py-0.5 text-xs rounded-full bg-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div className="pt-4 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Related Articles
          </p>
          <div className="space-y-2">
            {relatedArticles.map((related) => (
              <button
                key={related.slug}
                type="button"
                onClick={() => onNavigate(related.slug)}
                className="w-full text-left p-2 rounded border hover:bg-accent transition-colors text-sm"
              >
                <p className="font-medium">{related.title}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
