"use client";

import type { LucideIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useMemo } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Spinner } from "../../components/ui/spinner";
import { getAvatarGradient } from "../../utils/avatar-gradient";
import {
  UserAvatarMenu,
  type UserAvatarMenuItem,
} from "../user/UserAvatarMenu";

/**
 * User data for the navbar menu
 */
export interface NavbarUser {
  /** User ID (used for avatar gradient) */
  id: string;
  /** User email */
  email?: string | null;
  /** User metadata from OAuth provider */
  metadata?: {
    full_name?: string;
    name?: string;
    picture?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
}

/**
 * Profile data that overrides OAuth metadata
 */
export interface NavbarUserProfile {
  firstName?: string | null;
  lastName?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatarUrl?: string | null;
  avatar_url?: string | null;
}

/**
 * Menu item for the user dropdown
 */
export interface NavbarUserMenuItem {
  /** Display label */
  label: string;
  /** Icon component */
  icon?: LucideIcon;
  /** Link destination (mutually exclusive with onClick) */
  href?: string;
  /** Click handler (mutually exclusive with href) */
  onClick?: () => void;
  /** Whether this is a destructive action (shown in red) */
  destructive?: boolean;
  /** Whether to show a separator before this item */
  separatorBefore?: boolean;
}

export interface NavbarUserMenuProps {
  /** User data */
  user: NavbarUser;
  /** Profile data (overrides OAuth metadata) */
  profile?: NavbarUserProfile | null;
  /** Whether profile is loading */
  loading?: boolean;
  /** Sign out handler */
  onSignOut: () => void | Promise<void>;
  /** Additional menu items (sign out is always added at the end) */
  additionalItems?: NavbarUserMenuItem[];
  /** Avatar size */
  size?: "sm" | "md" | "lg";
  /** Menu alignment */
  align?: "start" | "center" | "end";
  /** Link component for client-side navigation */
  LinkComponent?: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
}

/**
 * Navbar user menu with avatar, loading state, and OAuth metadata handling.
 * Automatically parses user metadata from various OAuth providers (Google, GitHub, etc.)
 * and shows a dropdown menu with configurable items.
 *
 * @example
 * ```tsx
 * <NavbarUserMenu
 *   user={{ id: user.id, email: user.email, metadata: user.user_metadata }}
 *   profile={profile}
 *   loading={profileLoading}
 *   onSignOut={handleSignOut}
 *   additionalItems={[
 *     { label: "Settings", icon: Settings, href: "/settings" },
 *   ]}
 *   LinkComponent={Link}
 * />
 * ```
 */
export function NavbarUserMenu({
  user,
  profile,
  loading = false,
  onSignOut,
  additionalItems = [],
  size = "sm",
  align = "end",
  LinkComponent,
}: NavbarUserMenuProps) {
  // Build menu items with sign out at the end
  const menuItems: UserAvatarMenuItem[] = useMemo(() => {
    const items: UserAvatarMenuItem[] = additionalItems.map((item) => ({
      label: item.label,
      icon: item.icon,
      href: item.href,
      onClick: item.onClick,
      destructive: item.destructive,
      separatorBefore: item.separatorBefore,
    }));

    // Add sign out at the end
    items.push({
      label: "Sign Out",
      onClick: onSignOut,
      destructive: true,
      separatorBefore: items.length > 0,
    });

    return items;
  }, [additionalItems, onSignOut]);

  // Show loading spinner while fetching profile
  if (loading) {
    return (
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-md">
        <Spinner size="sm" />
      </div>
    );
  }

  // Get user metadata
  const metadata = user.metadata || {};

  // Get avatar URL (handle both camelCase and snake_case, plus OAuth provider fields)
  const avatarUrl =
    profile?.avatarUrl ||
    profile?.avatar_url ||
    metadata.picture ||
    metadata.avatar_url;

  // Get name from profile or user metadata (handle different provider formats)
  const fullName = metadata.full_name || metadata.name || "";
  const firstName =
    profile?.firstName ||
    profile?.first_name ||
    (typeof fullName === "string" ? fullName.split(" ")[0] : "") ||
    "";
  const lastName =
    profile?.lastName ||
    profile?.last_name ||
    (typeof fullName === "string"
      ? fullName.split(" ").slice(1).join(" ")
      : "") ||
    "";
  const displayName = `${firstName} ${lastName}`.trim() || user.email || "User";
  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";

  return (
    <UserAvatarMenu
      user={{
        id: user.id,
        email: user.email || undefined,
        avatarUrl,
        name: displayName,
        initials,
      }}
      items={menuItems}
      size={size}
      align={align}
      menuWidth="w-40"
      LinkComponent={LinkComponent}
      trigger={
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full focus:outline-none overflow-hidden *:hover:brightness-110 *:transition-all"
        >
          <Avatar className="h-7 w-7">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback
              className="text-xs font-medium text-white"
              style={getAvatarGradient(user.id).style}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">User menu</span>
        </button>
      }
    />
  );
}
