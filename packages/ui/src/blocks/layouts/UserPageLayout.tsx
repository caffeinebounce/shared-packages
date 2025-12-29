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
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto gap-6">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="relative rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground gap-2"
              >
                {tab.icon && <tab.icon className="h-4 w-4" />}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
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
