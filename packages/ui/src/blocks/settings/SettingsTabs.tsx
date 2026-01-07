"use client";

import { type ComponentType, type ReactNode, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { cn } from "../../utils";

export interface SettingsTab {
  /** Unique tab identifier */
  id: string;
  /** Tab label text */
  label: string;
  /** Optional icon component */
  icon?: ComponentType<{ className?: string }>;
}

export interface SettingsTabsProps {
  /** List of tabs to display */
  tabs: SettingsTab[];
  /** Currently active tab id */
  activeTab: string;
  /** Callback when tab changes */
  onTabChange: (tabId: string) => void;
  /** Tab content (use SettingsTabContent components) */
  children: ReactNode;
  /** Sync active tab with URL hash */
  syncWithHash?: boolean;
  /** Tab orientation */
  orientation?: "horizontal" | "vertical";
  /** Additional class name for the container */
  className?: string;
}

/**
 * SettingsTabs - A reusable tabbed settings layout component
 *
 * @example
 * ```tsx
 * <SettingsTabs
 *   tabs={[
 *     { id: 'account', label: 'Account', icon: User },
 *     { id: 'security', label: 'Security', icon: Shield },
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   syncWithHash
 * >
 *   <SettingsTabContent tabId="account">
 *     <AccountSettings />
 *   </SettingsTabContent>
 *   <SettingsTabContent tabId="security">
 *     <SecuritySettings />
 *   </SettingsTabContent>
 * </SettingsTabs>
 * ```
 */
export function SettingsTabs({
  tabs,
  activeTab,
  onTabChange,
  children,
  syncWithHash = false,
  orientation = "horizontal",
  className,
}: SettingsTabsProps) {
  // Handle URL hash synchronization
  useEffect(() => {
    if (!syncWithHash) return;

    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const tabIds = tabs.map((tab) => tab.id);
      if (hash && tabIds.includes(hash)) {
        onTabChange(hash);
      }
    };

    // Check initial hash on mount
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [syncWithHash, tabs, onTabChange]);

  const handleTabChange = (value: string) => {
    onTabChange(value);
    if (syncWithHash) {
      // Validate that the value is in the tabs array before updating URL
      const isValidTab = tabs.some((tab) => tab.id === value);
      if (isValidTab) {
        window.history.replaceState(null, "", `#${value}`);
      }
    }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      orientation={orientation}
      className={cn("space-y-6", className)}
    >
      <TabsList
        className={cn(
          orientation === "vertical" &&
            "flex-col h-auto items-stretch justify-start",
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn("gap-2", orientation === "vertical" && "w-full")}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {children}
    </Tabs>
  );
}
