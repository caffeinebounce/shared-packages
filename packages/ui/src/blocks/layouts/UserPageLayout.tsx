"use client";

import type { LucideIcon } from "lucide-react";
import type * as React from "react";
import { BackLink } from "../../components/ui/back-link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { cn } from "../../utils";

export interface PageTab {
  /** Unique value identifier for the tab */
  value: string;
  /** Display label for the tab */
  label: string;
  /** Optional icon component */
  icon?: LucideIcon;
  /** Tab content */
  content: React.ReactNode;
}

export interface UserPageLayoutBackLink {
  /** URL to navigate back to */
  href: string;
  /** Label for the back link */
  label: string;
}

export interface UserPageLayoutProps {
  /** Page title displayed in header (ignored when backLink is provided) */
  title?: string;
  /** Page description/subtitle displayed below title (ignored when backLink is provided) */
  description?: string;
  /** Actions to display in the header (buttons, etc.) */
  actions?: React.ReactNode;
  /** Additional class names for the container */
  className?: string;
  /** Additional class names for the content area */
  contentClassName?: string;
  /** Whether to show a bottom border on the header (not used in BasePageLayout currently, but kept for compatibility if needed) */
  headerBordered?: boolean;
  /** Optional back link - when provided, title and description are not shown */
  backLink?: UserPageLayoutBackLink;
  /** Loading state - shows skeleton if true */
  loading?: boolean;
  /** Custom loading skeleton */
  loadingSkeleton?: React.ReactNode;
  /** Optional tabs configuration - when provided, renders tabbed layout */
  tabs?: PageTab[];
  /** Default selected tab value (first tab if not specified) */
  defaultTab?: string;
  /** Main content (optional if tabs are provided) */
  children?: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
}

/**
 * UserPageLayout - Standard layout for user app pages.
 * Provides consistent padding, spacing, and optional header with title/description.
 * When backLink is provided, the title/description header is replaced with a back link.
 */
export function UserPageLayout({
  title,
  description,
  actions,
  className,
  contentClassName,
  loading = false,
  loadingSkeleton,
  children,
  tabs,
  defaultTab,
  footer,
  backLink,
}: UserPageLayoutProps) {
  // When backLink is provided, don't show the title/description header
  const showHeader = !backLink && Boolean(title || description || actions);

  return (
    <div className={cn("flex flex-1 flex-col min-w-0 min-h-full", className)}>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Back link mode */}
        {backLink && <BackLink href={backLink.href}>{backLink.label}</BackLink>}

        {/* Standard header mode */}
        {showHeader && (
          <div className="flex items-center justify-between">
            <div>
              {title && <h1 className="text-2xl font-semibold">{title}</h1>}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2">{actions}</div>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn("flex-1", contentClassName)}>
          {loading && loadingSkeleton ? (
            loadingSkeleton
          ) : tabs && tabs.length > 0 ? (
            <Tabs
              defaultValue={defaultTab || tabs[0].value}
              className="space-y-4"
            >
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="gap-2"
                  >
                    {tab.icon && <tab.icon className="h-4 w-4" />}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-2">
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            children
          )}
        </div>
      </div>
      {footer}
    </div>
  );
}
