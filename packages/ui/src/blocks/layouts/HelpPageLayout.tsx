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
  relatedContent,
  className,
  contentClassName,
  homeHref = "/admin/help",
}: HelpPageLayoutProps) {
  return (
    <div className={cn("flex flex-1 flex-col gap-8 p-4 max-w-5xl mx-auto w-full", className)}>
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

      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-lg text-muted-foreground max-w-3xl">
            {description}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className={cn("space-y-8", contentClassName)}>
        {children}
      </div>

      {/* Related Content / Footer Navigation */}
      {relatedContent && (
        <div className="pt-8 border-t mt-8">
          {relatedContent}
        </div>
      )}
    </div>
  );
}
