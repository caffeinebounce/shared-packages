"use client";

import type { ComponentType, ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "../../components/ui/sidebar";
import { cn } from "../../utils";
import type { UserAvatarMenuItem } from "../user/UserAvatarMenu";
import { AppHeader, type HeaderLink } from "./AppHeader";
import { AppSidebar, type AppSidebarUser, type NavItem } from "./AppSidebar";
import { FloatingUserMenu } from "./FloatingUserMenu";

/**
 * Props for the AppLayout component
 */
export interface AppLayoutProps {
  /** Main page content */
  children: ReactNode;

  // === Sidebar Props ===
  /** Navigation items for the sidebar */
  navItems?: NavItem[];
  /** Header content for sidebar (e.g., team switcher) */
  sidebarHeader?: ReactNode;
  /** Custom sidebar element (overrides navItems, user, etc.) */
  sidebar?: ReactNode;
  /** Sidebar collapsible mode */
  sidebarCollapsible?: "icon" | "offcanvas" | "none";

  // === User Props ===
  /** User information */
  user?: AppSidebarUser | null;
  /** User loading state */
  userLoading?: boolean;
  /** User menu items */
  userMenuItems?: UserAvatarMenuItem[];
  /** Sign out handler */
  onSignOut?: () => void | Promise<void>;
  /** Sign in URL */
  signInHref?: string;
  /** Current pathname (for active states) */
  pathname?: string;

  // === Header Props ===
  /** Show the header */
  showHeader?: boolean;
  /** Show sidebar trigger in header */
  showSidebarTrigger?: boolean;
  /** Show theme toggle in header */
  showThemeToggle?: boolean;
  /** Theme toggle shortcut display */
  themeToggleShortcut?: string;
  /** Whether shortcuts are visible based on user preference */
  shortcutsVisible?: boolean;
  /** Help link configuration */
  helpLink?: HeaderLink | string;
  /** About link configuration */
  aboutLink?: HeaderLink | string;
  /** Custom header actions */
  headerActions?: ReactNode;
  /** Custom header leading content */
  headerLeading?: ReactNode;
  /** Custom header element (overrides all header props) */
  header?: ReactNode;
  /** Additional className for the header */
  headerClassName?: string;

  // === Floating User Menu ===
  /** Show floating user menu when sidebar collapsed */
  showFloatingUserMenu?: boolean;

  // === General Props ===
  /** Additional className for the root container */
  className?: string;
  /** Default sidebar open state */
  defaultOpen?: boolean;
  /** Controlled sidebar open state */
  open?: boolean;
  /** Callback when sidebar state changes */
  onOpenChange?: (open: boolean) => void;
  /** Link component (for Next.js) */
  LinkComponent?: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
  /** Keyboard shortcut component */
  ShortcutComponent?: ComponentType<{
    className?: string;
    children: ReactNode;
  }>;
  /** User menu keyboard shortcut display */
  userMenuShortcut?: string;
  /** Callback for navigation (for keyboard shortcuts) */
  onNavigate?: (href: string) => void;
  /** Whether keyboard shortcuts are enabled for nav items */
  enableNavShortcuts?: boolean;
}

/**
 * A layout component for authenticated app pages with sidebar and header.
 *
 * Includes sensible defaults for common patterns:
 * - Sidebar with navigation and user menu
 * - Header with SidebarTrigger, help/about links, theme toggle
 * - Floating user menu when sidebar is collapsed
 *
 * All elements can be customized via props or disabled entirely.
 *
 * @example
 * ```tsx
 * // Minimal usage with defaults
 * <AppLayout
 *   navItems={[
 *     { label: "Dashboard", href: "/dashboard", icon: Home },
 *     { label: "Settings", href: "/settings", icon: Settings },
 *   ]}
 *   user={user}
 *   userMenuItems={[{ label: "Profile", href: "/profile", icon: User }]}
 *   onSignOut={handleSignOut}
 *   helpLink="/help"
 *   aboutLink="/about"
 * >
 *   <DashboardContent />
 * </AppLayout>
 *
 * // Full customization
 * <AppLayout
 *   sidebar={<CustomSidebar />}
 *   header={<CustomHeader />}
 *   showFloatingUserMenu={false}
 * >
 *   <DashboardContent />
 * </AppLayout>
 * ```
 */
export function AppLayout({
  children,
  // Sidebar props
  navItems = [],
  sidebarHeader,
  sidebar: customSidebar,
  sidebarCollapsible = "icon",
  // User props
  user,
  userLoading = false,
  userMenuItems = [],
  onSignOut,
  signInHref,
  pathname = "",
  // Header props
  showHeader = true,
  showSidebarTrigger = true,
  showThemeToggle = true,
  themeToggleShortcut,
  shortcutsVisible,
  helpLink,
  aboutLink,
  headerActions,
  headerLeading,
  header: customHeader,
  headerClassName,
  // Floating user menu
  showFloatingUserMenu = true,
  // General props
  className,
  defaultOpen,
  open,
  onOpenChange,
  LinkComponent,
  ShortcutComponent,
  userMenuShortcut,
  onNavigate,
  enableNavShortcuts = true,
}: AppLayoutProps) {
  // Use custom sidebar or build from props
  const sidebarElement = customSidebar ?? (
    <AppSidebar
      navItems={navItems}
      pathname={pathname}
      user={user}
      userMenuItems={userMenuItems}
      userLoading={userLoading}
      header={sidebarHeader}
      onSignOut={onSignOut}
      signInHref={signInHref}
      collapsible={sidebarCollapsible}
      LinkComponent={LinkComponent}
      ShortcutComponent={ShortcutComponent}
      userMenuShortcut={userMenuShortcut}
      onNavigate={onNavigate}
      enableKeyboardShortcuts={enableNavShortcuts}
      shortcutsVisible={shortcutsVisible}
    />
  );

  // Use custom header or build from props
  const headerElement =
    customHeader !== undefined ? (
      customHeader
    ) : showHeader ? (
      <AppHeader
        showSidebarTrigger={showSidebarTrigger}
        showThemeToggle={showThemeToggle}
        themeToggleShortcut={themeToggleShortcut}
        shortcutsVisible={shortcutsVisible}
        helpLink={helpLink}
        aboutLink={aboutLink}
        actions={headerActions}
        leadingContent={headerLeading}
        className={headerClassName}
        LinkComponent={LinkComponent}
        ShortcutComponent={ShortcutComponent}
      />
    ) : null;

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      className={cn("h-dvh", className)}
    >
      {sidebarElement}
      <SidebarInset>
        {headerElement}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
          {children}
        </div>
      </SidebarInset>
      {showFloatingUserMenu && (
        <FloatingUserMenu
          user={user}
          menuItems={userMenuItems}
          loading={userLoading}
          onSignOut={onSignOut}
          pathname={pathname}
          LinkComponent={LinkComponent}
        />
      )}
    </SidebarProvider>
  );
}
