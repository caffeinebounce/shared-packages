"use client";

import { ChevronUp, LogOut, User as UserIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../../components/ui/sidebar";
import { Spinner } from "../../components/ui/spinner";
import { getAvatarGradient } from "../../utils/avatar-gradient";
import { KeyboardShortcut } from "../keyboard/KeyboardShortcut";
import {
  UserAvatarMenu,
  type UserAvatarMenuItem,
} from "../user/UserAvatarMenu";

export interface NavItem {
  /** Display label */
  label: string;
  /** Navigation URL */
  href: string;
  /** Icon component */
  icon: ComponentType<{ className?: string }>;
  /** Whether this item is currently active */
  isActive?: boolean;
  /** Keyboard shortcut display (e.g., "⌃1") */
  shortcutDisplay?: string;
  /** Keyboard shortcut key (e.g., "1") - used with Ctrl modifier */
  shortcutKey?: string;
}

export interface AppSidebarUser {
  /** User ID */
  id: string;
  /** User email */
  email?: string | null;
  /** Display name */
  name?: string;
  /** User initials for avatar fallback */
  initials?: string;
  /** Avatar URL */
  avatarUrl?: string | null;
}

export interface AppSidebarProps {
  /** Navigation items */
  navItems: NavItem[];
  /** Current pathname for active state detection */
  pathname?: string;
  /** User information (null if not logged in) */
  user?: AppSidebarUser | null;
  /** User menu items */
  userMenuItems?: UserAvatarMenuItem[];
  /** Loading state for user */
  userLoading?: boolean;
  /** Header content (e.g., team switcher) */
  header?: ReactNode;
  /** Sign out handler */
  onSignOut?: () => void | Promise<void>;
  /** Sign in URL (shown when no user) */
  signInHref?: string;
  /** Profile page path for active state detection */
  profilePath?: string;
  /** Sidebar collapsible mode */
  collapsible?: "icon" | "offcanvas" | "none";
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
  /** Whether keyboard shortcuts are enabled */
  enableKeyboardShortcuts?: boolean;
  /** Whether shortcuts are visible based on user preference */
  shortcutsVisible?: boolean;
}

/**
 * AppSidebar - A complete sidebar with navigation and user menu
 *
 * @example
 * ```tsx
 * <AppSidebar
 *   navItems={[
 *     { label: "Dashboard", href: "/dashboard", icon: Home },
 *     { label: "Settings", href: "/settings", icon: Settings },
 *   ]}
 *   pathname={pathname}
 *   user={{ id: "1", email: "user@example.com", name: "John Doe" }}
 *   userMenuItems={[
 *     { label: "Profile", href: "/profile", icon: User },
 *     { label: "Sign Out", onClick: signOut, icon: LogOut, destructive: true },
 *   ]}
 *   header={<TeamSwitcher />}
 * />
 * ```
 */
export function AppSidebar({
  navItems,
  pathname = "",
  user,
  userMenuItems = [],
  userLoading = false,
  header,
  onSignOut,
  signInHref = "/auth/signin",
  profilePath = "/profile",
  collapsible = "icon",
  LinkComponent = "a" as unknown as ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>,
  ShortcutComponent,
  userMenuShortcut,
  onNavigate,
  enableKeyboardShortcuts = true,
  shortcutsVisible,
}: AppSidebarProps) {
  const Link = LinkComponent;
  const [menuOpen, setMenuOpen] = useState(false);

  // Check if current path is the profile page
  const isOnProfilePage =
    pathname === profilePath || pathname.startsWith(`${profilePath}/`);

  // Build complete menu items with sign out
  const allMenuItems = useMemo(() => {
    const items = [...userMenuItems];
    if (onSignOut && !items.some((item) => item.label === "Sign Out")) {
      items.push({
        label: "Sign Out",
        icon: LogOut,
        onClick: onSignOut,
        destructive: true,
        separatorBefore: items.length > 0,
      });
    }
    return items;
  }, [userMenuItems, onSignOut]);

  // Keyboard shortcuts for navigation (Ctrl+1, Ctrl+2, etc.)
  useEffect(() => {
    if (!enableKeyboardShortcuts || !onNavigate) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Ctrl+number shortcuts
      if (!e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;

      // Check if the key matches any nav item shortcut
      const matchingItem = navItems.find((item) => item.shortcutKey === e.key);

      if (matchingItem) {
        e.preventDefault();
        onNavigate(matchingItem.href);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboardShortcuts, navItems, onNavigate]);

  // Determine active state for nav items
  const getIsActive = (item: NavItem) => {
    if (item.isActive !== undefined) return item.isActive;
    if (!pathname) return false;
    // Exact match for home/dashboard, prefix match for child paths only
    if (item.href === "/" || item.href === "/dashboard") {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  // Render nav item with optional keyboard shortcut indicator
  const renderNavItem = (item: NavItem) => {
    const isActive = getIsActive(item);
    const Icon = item.icon;
    const Shortcut = ShortcutComponent || KeyboardShortcut;

    return (
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.href}>
          <Icon />
          <span>{item.label}</span>
          {shortcutsVisible && item.shortcutDisplay && (
            <Shortcut className="ml-auto text-[10px] text-muted-foreground">
              {item.shortcutDisplay}
            </Shortcut>
          )}
        </Link>
      </SidebarMenuButton>
    );
  };

  return (
    <Sidebar collapsible={collapsible}>
      {header && <SidebarHeader>{header}</SidebarHeader>}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  {renderNavItem(item)}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {userLoading ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Spinner size="sm" />
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : user ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <UserAvatarMenu
                user={{
                  id: user.id,
                  email: user.email ?? undefined,
                  avatarUrl: user.avatarUrl ?? undefined,
                  name: user.name || user.email || "User",
                  initials:
                    user.initials || user.name?.[0]?.toUpperCase() || "U",
                }}
                items={allMenuItems}
                open={menuOpen}
                onOpenChange={setMenuOpen}
                side="top"
                align="start"
                menuWidth="w-[calc(var(--sidebar-width)-1rem)]"
                LinkComponent={LinkComponent}
                ShortcutComponent={ShortcutComponent}
                trigger={
                  <SidebarMenuButton
                    size="lg"
                    className={`rounded-xl focus-visible:ring-0 ${
                      menuOpen || isOnProfilePage
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8 rounded-full">
                      {user.avatarUrl && (
                        <AvatarImage
                          src={user.avatarUrl}
                          alt={user.name || ""}
                        />
                      )}
                      <AvatarFallback
                        className="rounded-full text-xs font-medium text-white"
                        style={getAvatarGradient(user.id).style}
                      >
                        {user.initials || user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user.name || "User"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                    {ShortcutComponent && userMenuShortcut && (
                      <ShortcutComponent className="ml-auto hidden text-xs text-muted-foreground md:inline-flex">
                        {userMenuShortcut}
                      </ShortcutComponent>
                    )}
                    <ChevronUp className="ml-1 size-4" />
                  </SidebarMenuButton>
                }
              />
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={signInHref}>
                  <UserIcon />
                  <span>Sign In</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
