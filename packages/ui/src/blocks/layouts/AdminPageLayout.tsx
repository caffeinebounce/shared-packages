"use client";

import type { ReactNode } from "react";

import { cn } from "../../utils";

export interface AdminPageLayoutProps {
  /** Page title displayed in header */
  title?: string;
  /** Page description/subtitle displayed below title */
  description?: string;
  /** Actions to display in the header (buttons, etc.) */
  actions?: ReactNode;
  /** Main content */
  children: ReactNode;
  /** Additional class names for the container */
  className?: string;
  /** Additional class names for the content area */
  contentClassName?: string;
}

/**
 * Shared layout component for admin pages.
 * Provides consistent padding, spacing, and optional header with title/description.
 *
 * @example
 * // With header
 * <AdminPageLayout title="Users" description="Manage user accounts">
 *   <AdminUsersManagement />
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
}: AdminPageLayoutProps) {
  const showHeader = Boolean(title || description || actions);

  return (
    <div className={cn("flex flex-1 flex-col gap-4 p-4", className)}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h1 className="text-2xl font-semibold">{title}</h1>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn("flex-1", contentClassName)}>{children}</div>
    </div>
  );
}
