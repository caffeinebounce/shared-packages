"use client";

import type { ReactNode } from "react";
import { BackLink } from "../../components/ui/back-link";
import { PageLayoutShell } from "./BasePageLayout";

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
    <PageLayoutShell
      title={title}
      description={description}
      actions={actions}
      className={className}
      contentClassName={contentClassName}
      footer={footer}
      showHeader={showHeader}
      beforeHeader={
        backLink ? (
          <BackLink href={backLink.href}>{backLink.label}</BackLink>
        ) : null
      }
      contentBaseClassName="flex-1 min-w-0"
      innerClassName="min-w-0"
    >
      {children}
    </PageLayoutShell>
  );
}
