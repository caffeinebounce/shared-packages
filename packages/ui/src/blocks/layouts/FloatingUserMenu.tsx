"use client";

import { LogOut } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { useSidebar } from "../../components/ui/sidebar";
import { Spinner } from "../../components/ui/spinner";
import { getAvatarGradient } from "../../utils/avatar-gradient";
import {
  UserAvatarMenu,
  type UserAvatarMenuItem,
} from "../user/UserAvatarMenu";

export interface FloatingUserMenuUser {
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

export interface FloatingUserMenuProps {
  /** User information (null if not logged in or loading) */
  user?: FloatingUserMenuUser | null;
  /** User menu items */
  menuItems?: UserAvatarMenuItem[];
  /** Loading state */
  loading?: boolean;
  /** Sign out handler */
  onSignOut?: () => void | Promise<void>;
  /** Current pathname for active state detection */
  pathname?: string;
  /** Profile page path pattern */
  profilePath?: string;
  /** Link component (for Next.js) */
  LinkComponent?: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
}

/**
 * FloatingUserMenu - A floating user avatar menu that appears when sidebar is collapsed
 *
 * Only renders when sidebar is in mobile/collapsed mode.
 *
 * @example
 * ```tsx
 * <FloatingUserMenu
 *   user={{ id: "1", email: "user@example.com", name: "John Doe" }}
 *   menuItems={[
 *     { label: "Profile", href: "/profile", icon: User },
 *   ]}
 *   onSignOut={handleSignOut}
 * />
 * ```
 */
export function FloatingUserMenu({
  user,
  menuItems = [],
  loading = false,
  onSignOut,
  pathname = "",
  profilePath = "/profile",
  LinkComponent = "a" as unknown as ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>,
}: FloatingUserMenuProps) {
  const { isMobile } = useSidebar();
  const [open, setOpen] = useState(false);

  const isOnProfilePage =
    pathname === profilePath || pathname.startsWith(`${profilePath}/`);

  // Build complete menu items with sign out
  const allMenuItems = useMemo(() => {
    const items = [...menuItems];
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
  }, [menuItems, onSignOut]);

  // Only render when sidebar is hidden (mobile mode)
  if (!isMobile) return null;

  // Show loading spinner while fetching user
  if (loading) {
    return (
      <div className="fixed bottom-2 left-2 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-md border">
        <Spinner size="sm" />
      </div>
    );
  }

  // Don't render if no user (not logged in)
  if (!user) return null;

  const displayName = user.name || user.email || "User";
  const initials = user.initials || user.name?.[0]?.toUpperCase() || "U";

  return (
    <div className="fixed bottom-2 left-2 z-50">
      <UserAvatarMenu
        user={{
          id: user.id,
          email: user.email ?? undefined,
          avatarUrl: user.avatarUrl ?? undefined,
          name: displayName,
          initials,
        }}
        items={allMenuItems}
        open={open}
        onOpenChange={setOpen}
        side="top"
        align="start"
        isActive={isOnProfilePage}
        showUserInfo
        LinkComponent={LinkComponent}
        trigger={
          <button
            type="button"
            className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md border bg-background transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              open || isOnProfilePage ? "ring-2 ring-primary" : ""
            }`}
          >
            <Avatar className="h-8 w-8 rounded-full">
              {user.avatarUrl && (
                <AvatarImage src={user.avatarUrl} alt={displayName} />
              )}
              <AvatarFallback
                className="rounded-full text-xs font-medium text-white"
                style={getAvatarGradient(user.id).style}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="sr-only">User menu</span>
          </button>
        }
      />
    </div>
  );
}
