"use client";

import type { LucideIcon } from "lucide-react";
import type * as React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { BasePageLayout, type BasePageLayoutProps } from "./BasePageLayout";

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

export interface UserPageLayoutProps
  extends Omit<BasePageLayoutProps, "children"> {
  /** Whether to show a bottom border on the header (not used in BasePageLayout currently, but kept for compatibility if needed) */
  headerBordered?: boolean;
  /** Optional back link URL (not used in BasePageLayout currently) */
  backHref?: string;
  /** Optional back link label (defaults to "Back") */
  backLabel?: string;
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
}

/**
 * UserPageLayout - Standard layout for user app pages.
 * Wraps BasePageLayout to provide consistent structure with Admin pages,
 * while adding user-specific features like tabs and loading states.
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
}: UserPageLayoutProps) {
  return (
    <BasePageLayout
      title={title}
      description={description}
      actions={actions}
      className={className}
      contentClassName={contentClassName}
    >
      {loading && loadingSkeleton ? (
        loadingSkeleton
      ) : tabs && tabs.length > 0 ? (
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
    </BasePageLayout>
  );
}
