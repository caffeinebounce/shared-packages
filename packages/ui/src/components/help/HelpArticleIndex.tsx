"use client";

import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { HelpArticle } from "./HelpProvider";

export interface HelpArticleGroup {
  title: string;
  icon?: ReactNode;
  articles: HelpArticle[];
}

export interface HelpArticleIndexProps {
  groups: HelpArticleGroup[];
  onSelect: (slug: string) => void;
}

export function HelpArticleIndex({ groups, onSelect }: HelpArticleIndexProps) {
  return (
    <div className="space-y-6">
      {groups.map((group, index) => (
        <div key={index}>
          <div className="flex items-center gap-2 mb-3">
            {group.icon}
            <h3 className="font-medium">{group.title}</h3>
          </div>
          <div className="space-y-1">
            {group.articles.map((article) => (
              <button
                key={article.slug}
                type="button"
                onClick={() => onSelect(article.slug)}
                className="w-full text-left p-2 rounded hover:bg-accent transition-colors flex items-center justify-between group"
              >
                <span className="text-sm">{article.title}</span>
                <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
