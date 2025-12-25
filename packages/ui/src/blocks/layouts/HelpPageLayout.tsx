"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "../../utils";

export interface HelpBreadcrumb {
  label: string;
  href: string;
}

export interface HelpPageLayoutProps {
  /** Breadcrumbs to display at the top */
  breadcrumbs?: HelpBreadcrumb[];
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Main content */
  children: ReactNode;
  /** Sidebar content */
  sidebar?: ReactNode;
  /** Additional content (e.g. related articles) displayed below main content or in a sidebar */
  relatedContent?: ReactNode;
  /** Additional class names for the container */
  className?: string;
  /** Additional class names for the content area */
  contentClassName?: string;
  /** Home link href (defaults to /admin/help) */
  homeHref?: string;
}

/**
 * Layout component for help pages.
 * Includes breadcrumbs, header, and consistent spacing for content and related articles.
 */
export function HelpPageLayout({
  breadcrumbs = [],
  title,
  description,
  children,
  sidebar,
  relatedContent,
  className,
  contentClassName,
  homeHref = "/admin/help",
}: HelpPageLayoutProps) {
  return (
    <div className={cn("flex flex-1 flex-col gap-6 p-4 max-w-7xl w-full", className)}>
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
        <Link 
          href={homeHref} 
          className="flex items-center hover:text-foreground transition-colors"
          data-prevent-help-intercept="true"
        >
          <Home className="size-4 mr-2" />
          Help Center
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center">
            <ChevronRight className="size-4 mx-2" />
            <Link 
              href={crumb.href}
              className={cn(
                "hover:text-foreground transition-colors",
                index === breadcrumbs.length - 1 && "text-foreground font-medium pointer-events-none"
              )}
            >
              {crumb.label}
            </Link>
          </div>
        ))}
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Sidebar */}
        {sidebar && (
          <aside className="w-full lg:w-64 shrink-0 hidden lg:block">
            <div className="sticky top-8">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="space-y-1 mb-4">
            <h1 className="text-xl font-semibold">{title}</h1>
            {description && (
              <p className="text-xs text-muted-foreground max-w-3xl">
                {description}
              </p>
            )}
          </div>

          {/* Main Content */}
          <div className={contentClassName}>
            {children}
          </div>

          {/* Related Content / Footer Navigation */}
          {relatedContent && (
            <div className="pt-8 border-t mt-8">
              {relatedContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
