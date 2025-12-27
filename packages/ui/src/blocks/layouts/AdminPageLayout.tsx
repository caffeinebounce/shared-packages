"use client";

import type { ReactNode } from "react";

import { BasePageLayout, type BasePageLayoutProps } from "./BasePageLayout";

export interface AdminPageLayoutProps extends BasePageLayoutProps {}

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
export function AdminPageLayout(props: AdminPageLayoutProps) {
  return <BasePageLayout {...props} />;
}
