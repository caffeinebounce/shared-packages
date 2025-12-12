"use client";

import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import { Container } from "../../components/ui/container";
import { PageHeader } from "../../components/ui/page-header";
import { SettingsTabContent } from "./SettingsTabContent";
import { type SettingsTab, SettingsTabs } from "./SettingsTabs";

export interface SettingsPage {
  /** Unique page/tab identifier */
  id: string;
  /** Tab label */
  label: string;
  /** Optional icon for the tab */
  icon?: ComponentType<{ className?: string }>;
  /** Page content (typically contains SettingsSection components) */
  content: ReactNode;
  /** Show loading state for this page */
  loading?: boolean;
}

export interface SettingsLayoutProps {
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Settings pages/tabs with their content */
  pages: SettingsPage[];
  /** Default active page (defaults to first page) */
  defaultPage?: string;
  /** Sync active tab with URL hash */
  syncWithHash?: boolean;
  /** Tab orientation */
  orientation?: "horizontal" | "vertical";
  /** Additional class name for the container */
  className?: string;
  /** Container size */
  containerSize?: "default" | "narrow" | "wide" | "full";
}

/**
 * SettingsLayout - A complete settings page layout with tabs
 *
 * Apps define pages (tabs) that contain sections of related settings.
 * - **Pages/Tabs**: Top-level navigation (Account, Accessibility, etc.)
 * - **Sections**: Groups of related settings within a page (use SettingsSection)
 * - **Rows**: Individual settings with controls (use SettingsRow)
 *
 * @example
 * ```tsx
 * <SettingsLayout
 *   title="Settings"
 *   description="Manage your account and preferences"
 *   pages={[
 *     {
 *       id: "accessibility",
 *       label: "Accessibility",
 *       icon: Accessibility,
 *       content: (
 *         <>
 *           <SettingsSection title="Display" description="Visual preferences">
 *             <SettingsRow label="Reduce motion" htmlFor="reduce-motion">
 *               <Switch id="reduce-motion" />
 *             </SettingsRow>
 *           </SettingsSection>
 *           <SettingsSection title="Keyboard" description="Keyboard preferences">
 *             <SettingsRow label="Show shortcuts" htmlFor="shortcuts">
 *               <Switch id="shortcuts" />
 *             </SettingsRow>
 *           </SettingsSection>
 *         </>
 *       ),
 *     },
 *   ]}
 *   syncWithHash
 * />
 * ```
 */
export function SettingsLayout({
  title = "Settings",
  description,
  pages,
  defaultPage,
  syncWithHash = false,
  orientation = "horizontal",
  className,
  containerSize = "default",
}: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultPage || pages[0]?.id || "");

  // Convert pages to tabs format
  const tabs: SettingsTab[] = pages.map((page) => ({
    id: page.id,
    label: page.label,
    icon: page.icon,
  }));

  return (
    <Container size={containerSize} className={className}>
      {(title || description) && (
        <PageHeader title={title} description={description} className="mb-6" />
      )}

      <SettingsTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        syncWithHash={syncWithHash}
        orientation={orientation}
      >
        {pages.map((page) => (
          <SettingsTabContent
            key={page.id}
            tabId={page.id}
            loading={page.loading}
          >
            <div className="space-y-6">{page.content}</div>
          </SettingsTabContent>
        ))}
      </SettingsTabs>
    </Container>
  );
}
