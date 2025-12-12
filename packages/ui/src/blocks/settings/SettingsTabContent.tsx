"use client";

import type { ReactNode } from "react";
import { Spinner } from "../../components/ui/spinner";
import { TabsContent } from "../../components/ui/tabs";

export interface SettingsTabContentProps {
  /** Tab ID that this content belongs to */
  tabId: string;
  /** Show loading spinner */
  loading?: boolean;
  /** Tab content */
  children: ReactNode;
}

/**
 * SettingsTabContent - Wrapper for individual tab content panels
 *
 * @example
 * ```tsx
 * <SettingsTabContent tabId="account" loading={isLoading}>
 *   <AccountSettings />
 * </SettingsTabContent>
 * ```
 */
export function SettingsTabContent({
  tabId,
  loading = false,
  children,
}: SettingsTabContentProps) {
  if (loading) {
    return (
      <TabsContent value={tabId}>
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner size="lg" />
        </div>
      </TabsContent>
    );
  }

  return <TabsContent value={tabId}>{children}</TabsContent>;
}
