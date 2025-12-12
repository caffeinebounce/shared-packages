"use client";

import type { LucideIcon } from "lucide-react";
import type * as React from "react";
import { PageHeader } from "../../components/ui/page-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

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

export interface PageLayoutProps {
  /** Page title */
  title: string;
  /** Optional page description/subtitle */
  description?: string;
  /** Optional actions (buttons, etc.) to display in the header */
  actions?: React.ReactNode;
  /** Whether to show a bottom border on the header */
  headerBordered?: boolean;
  /** Optional back link URL */
  backHref?: string;
  /** Optional back link label (defaults to "Back") */
  backLabel?: string;
  /** Page content - used when no tabs */
  children?: React.ReactNode;
  /** Additional className for the header */
  headerClassName?: string;
  /** Additional className for the wrapper */
  className?: string;
  /** Loading state - shows skeleton if true */
  loading?: boolean;
  /** Custom loading skeleton */
  loadingSkeleton?: React.ReactNode;
  /** Optional tabs configuration - when provided, renders tabbed layout */
  tabs?: PageTab[];
  /** Default selected tab value (first tab if not specified) */
  defaultTab?: string;
}

/**
 * PageLayout - Standard layout for app pages with consistent header and optional tabs
 *
 * Provides:
 * - PageHeader with title, description, and optional actions
 * - Optional tabbed interface with icon support
 * - Consistent spacing (mb-8 for header, space-y-6 for tabs)
 *
 * Note: Container/width is controlled by the parent layout, not this component.
 *
 * @example Without tabs:
 * ```tsx
 * <PageLayout
 *   title="Dashboard"
 *   description="Manage your company and applications"
 *   actions={<Button>Add New</Button>}
 * >
 *   <YourContent />
 * </PageLayout>
 * ```
 *
 * @example With tabs:
 * ```tsx
 * <PageLayout
 *   title="Company"
 *   description="Manage your company profile"
 *   tabs={[
 *     { value: "profile", label: "Profile", icon: Building2, content: <ProfileTab /> },
 *     { value: "users", label: "Users", icon: Users, content: <UsersTab /> },
 *   ]}
 * />
 * ```
 */
export function PageLayout({
  title,
  description,
  actions,
  headerBordered = false,
  backHref,
  backLabel,
  headerClassName,
  className,
  loading = false,
  loadingSkeleton,
  children,
  tabs,
  defaultTab,
}: PageLayoutProps) {
  if (loading && loadingSkeleton) {
    return <div className={className}>{loadingSkeleton}</div>;
  }

  return (
    <div className={className}>
      <PageHeader
        title={title}
        description={description}
        actions={actions}
        bordered={headerBordered}
        backHref={backHref}
        backLabel={backLabel}
        className={`mb-8 ${headerClassName || ""}`}
      />

      {tabs && tabs.length > 0 ? (
        <Tabs defaultValue={defaultTab || tabs[0].value} className="space-y-6">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                {tab.icon && <tab.icon className="h-4 w-4" />}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        children
      )}
    </div>
  );
}
