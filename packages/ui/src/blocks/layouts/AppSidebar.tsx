"use client";

import { ChevronDown, ChevronUp, LogOut, User as UserIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "../../components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Spinner } from "../../components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
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
  /** Whether the item is disabled (e.g., coming soon) */
  disabled?: boolean;
  /** Tooltip text when disabled */
  disabledTooltip?: string;
  /** Icon animation on hover */
  iconAnimation?: "scale" | "rotate" | "bounce" | "none";
}

/** Section header with grouped nav items */
export interface NavSection {
  type: "section";
  /** Section label (displayed as uppercase header) */
  label: string;
  /** Optional icon used when sidebar is collapsed */
  icon?: ComponentType<{ className?: string }>;
  /** Items within this section */
  items: NavItem[];
  /** Whether section is visible (for conditional rendering) */
  visible?: boolean;
  /** Whether section is collapsible (click header to expand/collapse) */
  collapsible?: boolean;
  /** Whether section starts open (default: true) */
  defaultOpen?: boolean;
}

/** Simple visual divider */
export interface NavDivider {
  type: "divider";
}

/** Union type for all navigation elements */
export type NavElement = NavItem | NavSection | NavDivider;

/** Type guard for NavItem - checks for required NavItem properties */
export function isNavItem(element: NavElement): element is NavItem {
  return (
    "label" in element &&
    "href" in element &&
    "icon" in element &&
    !("type" in element)
  );
}

/** Type guard for NavSection */
export function isNavSection(element: NavElement): element is NavSection {
  return "type" in element && element.type === "section";
}

/** Type guard for NavDivider */
export function isNavDivider(element: NavElement): element is NavDivider {
  return "type" in element && element.type === "divider";
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
  /** Navigation elements (items, sections, dividers) */
  navItems: NavElement[];
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

  // Flatten all nav items from elements (including items inside sections)
  const allNavItems = useMemo(() => {
    const items: NavItem[] = [];
    for (const element of navItems) {
      if (isNavItem(element)) {
        items.push(element);
      } else if (isNavSection(element)) {
        items.push(...element.items);
      }
    }
    return items;
  }, [navItems]);

  // Preprocess navItems into renderable groups (O(n) instead of O(n²))
  const processedNavGroups = useMemo(() => {
    type NavGroup =
      | { type: "divider"; key: string }
      | { type: "section"; section: NavSection }
      | { type: "plain-group"; items: NavItem[]; key: string };

    const groups: NavGroup[] = [];
    let dividerCount = 0;

    let i = 0;
    while (i < navItems.length) {
      const element = navItems[i];

      if (isNavDivider(element)) {
        // Use divider count for stable key (dividers have no identity)
        groups.push({ type: "divider", key: `divider-${dividerCount++}` });
        i++;
      } else if (isNavSection(element)) {
        groups.push({ type: "section", section: element });
        i++;
      } else if (isNavItem(element)) {
        // Collect contiguous plain items in single pass
        const plainItems: NavItem[] = [element];
        const startHref = element.href;
        i++;
        while (i < navItems.length && isNavItem(navItems[i])) {
          plainItems.push(navItems[i] as NavItem);
          i++;
        }
        groups.push({
          type: "plain-group",
          items: plainItems,
          key: `plain-group-${startHref}`,
        });
      } else {
        i++;
      }
    }

    return groups;
  }, [navItems]);

  // Keyboard shortcuts for navigation (Ctrl+1, Ctrl+2, etc.)
  useEffect(() => {
    if (!enableKeyboardShortcuts || !onNavigate) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Ctrl+number shortcuts
      if (!e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;

      // Check if the key matches any nav item shortcut (skip disabled items)
      const matchingItem = allNavItems.find(
        (item) => item.shortcutKey === e.key && !item.disabled,
      );

      if (matchingItem) {
        e.preventDefault();
        onNavigate(matchingItem.href);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboardShortcuts, allNavItems, onNavigate]);

  const activeHref = useMemo(() => {
    if (!pathname || allNavItems.length === 0) return null;

    const matches = allNavItems
      .filter((item) => {
        if (item.href === "/" || item.href === "/dashboard" || item.href === "/finance") {
          return pathname === item.href;
        }
        return pathname === item.href || pathname.startsWith(`${item.href}/`);
      })
      .sort((a, b) => b.href.length - a.href.length);

    return matches[0]?.href ?? null;
  }, [pathname, allNavItems]);

  const [sectionOpenState, setSectionOpenState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSectionOpenState((prev) => {
      const nextState: Record<string, boolean> = {};
      for (const group of processedNavGroups) {
        if (group.type === "section" && group.section.collapsible) {
          nextState[group.section.label] =
            prev[group.section.label] ?? group.section.defaultOpen === true;
        }
      }

      const nextKeys = Object.keys(nextState);
      const prevKeys = Object.keys(prev);
      const hasChanged =
        nextKeys.length !== prevKeys.length ||
        nextKeys.some((key) => prev[key] !== nextState[key]);

      return hasChanged ? nextState : prev;
    });
  }, [processedNavGroups]);

  // Determine active state for nav items
  const getIsActive = (item: NavItem) => {
    if (item.isActive !== undefined) return item.isActive;
    if (!pathname) return false;
    return activeHref === item.href;
  };

  // Get icon animation class - returns complete Tailwind classes for purging
  // Uses motion-safe: prefix for accessibility (respects prefers-reduced-motion)
  const getIconAnimationClass = (animation?: NavItem["iconAnimation"]) => {
    switch (animation) {
      case "rotate":
        return "motion-safe:group-hover:rotate-90 motion-safe:transition-transform motion-safe:duration-150";
      case "bounce":
        // Use scale instead of animate-bounce (continuous animation is problematic)
        return "motion-safe:group-hover:scale-110 motion-safe:transition-transform motion-safe:duration-150";
      case "scale":
        return "motion-safe:group-hover:scale-110 motion-safe:transition-transform motion-safe:duration-150";
      case "none":
        return "";
      default:
        return "motion-safe:group-hover:scale-110 motion-safe:transition-transform motion-safe:duration-150";
    }
  };

  // Render nav item with optional keyboard shortcut indicator
  const renderNavItem = (item: NavItem) => {
    const isActive = getIsActive(item);
    const Icon = item.icon;
    const Shortcut = ShortcutComponent || KeyboardShortcut;
    const iconAnimationClass = item.disabled
      ? ""
      : getIconAnimationClass(item.iconAnimation);

    // Disabled item with tooltip - includes accessibility attributes
    if (item.disabled) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              className="cursor-not-allowed opacity-40"
              isActive={false}
              aria-disabled="true"
              tabIndex={0}
            >
              <Icon className="shrink-0" />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right">
            {item.disabledTooltip || "Coming soon"}
          </TooltipContent>
        </Tooltip>
      );
    }

    // Normal item
    return (
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className="group"
        tooltip={item.label}
      >
        <Link href={item.href}>
          <Icon className={`shrink-0 ${iconAnimationClass}`} />
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
        {processedNavGroups.map((group) => {
          // Divider
          if (group.type === "divider") {
            return <SidebarSeparator key={group.key} className="my-2" />;
          }

          // Section with header
          if (group.type === "section") {
            const section = group.section;
            // Skip hidden sections
            if (section.visible === false) return null;

            if (section.collapsible) {
              const SectionIcon = section.icon ?? section.items[0]?.icon;
              const sectionHref = section.items[0]?.href;

              return (
                <Collapsible
                  key={`section-${section.label}`}
                  open={sectionOpenState[section.label] ?? section.defaultOpen === true}
                  onOpenChange={(open) =>
                    setSectionOpenState((prev) => ({
                      ...prev,
                      [section.label]: open,
                    }))
                  }
                  className="group/collapsible"
                >
                  <SidebarGroup>
                    {SectionIcon && sectionHref && (
                      <SidebarGroupContent className="hidden group-data-[collapsible=icon]:block">
                        <SidebarMenu>
                          <SidebarMenuItem>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                  tooltip={section.label}
                                  className="hover:bg-transparent hover:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                  <SectionIcon className="shrink-0" />
                                  <span>{section.label}</span>
                                </SidebarMenuButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent side="right" align="start" className="w-64">
                                {section.items.map((item) => {
                                  const ItemIcon = item.icon;
                                  return (
                                    <DropdownMenuItem key={item.href} asChild>
                                      <Link href={item.href} className="flex items-center gap-2">
                                        <ItemIcon className="size-4" />
                                        <span>{item.label}</span>
                                      </Link>
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    )}

                    <div className="group-data-[collapsible=icon]:hidden">
                      <SidebarGroupLabel
                        asChild
                        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        <CollapsibleTrigger className="flex w-full items-center justify-between [&[data-state=open]>svg]:rotate-180">
                          {section.label}
                          <ChevronDown className="ml-auto size-4 transition-transform duration-200" />
                        </CollapsibleTrigger>
                      </SidebarGroupLabel>
                      <CollapsibleContent>
                        <SidebarGroupContent>
                          <SidebarMenu>
                            {section.items.map((item) => (
                              <SidebarMenuItem key={item.href}>
                                {renderNavItem(item)}
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </CollapsibleContent>
                    </div>
                  </SidebarGroup>
                </Collapsible>
              );
            }

            return (
              <SidebarGroup key={`section-${section.label}`}>
                <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {section.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        {renderNavItem(item)}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          // Plain group (contiguous NavItems not in a section)
          if (group.type === "plain-group") {
            return (
              <SidebarGroup key={group.key}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        {renderNavItem(item)}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          return null;
        })}
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
                    <div className="grid flex-1 min-w-0 text-left text-sm leading-tight">
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
