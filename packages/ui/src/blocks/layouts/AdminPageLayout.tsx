"use client";

import type { ReactNode } from "react";
import { BackLink } from "../../components/ui/back-link";
import { cn } from "../../utils";

export interface AdminPageLayoutBackLink {
  /** URL to navigate back to */
  href: string;
  /** Label for the back link */
  label: string;
}

export interface AdminPageLayoutProps {
  /** Page title displayed in header (ignored when backLink is provided) */
  title?: string;
  /** Page description/subtitle displayed below title (ignored when backLink is provided) */
  description?: string;
  /** Actions to display in the header (buttons, etc.) */
  actions?: ReactNode;
  /** Main content */
  children?: ReactNode;
  /** Additional class names for the container */
  className?: string;
  /** Additional class names for the content area */
  contentClassName?: string;
  /** Optional footer content */
  footer?: ReactNode;
  /** Optional back link - when provided, title and description are not shown */
  backLink?: AdminPageLayoutBackLink;
}

/**
 * Shared layout component for admin pages.
 * Provides consistent padding, spacing, and optional header with title/description.
 * When backLink is provided, the title/description header is replaced with a back link.
 *
 * @example
 * // With header
 * <AdminPageLayout title="Users" description="Manage user accounts">
 *   <AdminUsersManagement />
 * </AdminPageLayout>
 *
 * @example
 * // With back link (detail pages)
 * <AdminPageLayout backLink={{ href: "/admin/cohorts", label: "Back to Cohorts" }}>
 *   <CohortProfile />
 * </AdminPageLayout>
 *
 * @example
 * // Without header (dashboard style)
 * <AdminPageLayout>
 *   <DashboardContent />
 * </AdminPageLayout>
 */
export function AdminPageLayout({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
  footer,
  backLink,
}: AdminPageLayoutProps) {
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
        <div className={cn("flex-1", contentClassName)}>{children}</div>
      </div>
      {footer}
    </div>
  );
}
