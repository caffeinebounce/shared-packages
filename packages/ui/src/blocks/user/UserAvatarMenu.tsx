"use client";

import { ChevronUp } from "lucide-react";
import { type ComponentType, Fragment, type ReactNode } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Spinner } from "../../components/ui/spinner";
import { getAvatarGradient } from "../../utils/avatar-gradient";
import { KeyboardShortcut } from "../keyboard/KeyboardShortcut";

export interface UserAvatarMenuUser {
  /** User ID for gradient generation */
  id: string;
  /** User email */
  email?: string;
  /** Avatar image URL */
  avatarUrl?: string;
  /** Display name */
  name?: string;
  /** Initials for fallback */
  initials?: string;
}

export interface UserAvatarMenuItem {
  /** Menu item label */
  label: string;
  /** Icon component */
  icon?: ComponentType<{ className?: string }>;
  /** Link href (renders as link) */
  href?: string;
  /** Click handler (renders as button) */
  onClick?: () => void;
  /** Whether link opens in new tab */
  external?: boolean;
  /** Keyboard shortcut display string */
  shortcut?: string;
  /** Whether to show keyboard shortcut */
  showShortcut?: boolean;
  /** Destructive styling (for sign out, delete, etc.) */
  destructive?: boolean;
  /** Add separator before this item */
  separatorBefore?: boolean;
}

export interface UserAvatarMenuProps {
  /** User data */
  user: UserAvatarMenuUser;
  /** Whether data is loading */
  loading?: boolean;
  /** Menu items */
  items: UserAvatarMenuItem[];
  /** Avatar size */
  size?: "sm" | "md" | "lg";
  /** Position of dropdown */
  side?: "top" | "bottom" | "left" | "right";
  /** Dropdown alignment */
  align?: "start" | "center" | "end";
  /** Whether menu is controlled */
  open?: boolean;
  /** Callback when menu open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether to show chevron indicator */
  showChevron?: boolean;
  /** Whether this menu is currently active/highlighted */
  isActive?: boolean;
  /** Custom trigger content (replaces default avatar button) */
  trigger?: ReactNode;
  /** Header content shown above menu items */
  header?: ReactNode;
  /** Show user name and email in header */
  showUserInfo?: boolean;
  /** Menu trigger shortcut display */
  menuShortcut?: string;
  /** Custom menu content width */
  menuWidth?: string;
  /** Class name for trigger button */
  className?: string;
  /** Class name for avatar */
  avatarClassName?: string;
  /** Link component for routing */
  LinkComponent?: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
  /** Custom keyboard shortcut component (for user preference integration) */
  ShortcutComponent?: ComponentType<{
    className?: string;
    children: ReactNode;
  }>;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

const avatarTextSizes = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

/**
 * User avatar with dropdown menu for profile actions.
 * Fully configurable menu items, supports loading state and keyboard shortcuts.
 */
export function UserAvatarMenu({
  user,
  loading = false,
  items,
  size = "md",
  side = "bottom",
  align = "end",
  open,
  onOpenChange,
  showChevron = false,
  isActive = false,
  trigger,
  header,
  showUserInfo = false,
  menuShortcut,
  menuWidth,
  className = "",
  avatarClassName = "",
  LinkComponent,
  ShortcutComponent,
}: UserAvatarMenuProps) {
  // Use custom ShortcutComponent if provided, otherwise use default
  const Shortcut = ShortcutComponent || KeyboardShortcut;
  const sizeClass = sizeClasses[size];
  const textSize = avatarTextSizes[size];

  // Loading state
  if (loading) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-md ${sizeClass} ${className}`}
      >
        <Spinner size="sm" />
      </div>
    );
  }

  const { id, email, avatarUrl, name, initials } = user;
  const displayInitials = initials || name?.[0]?.toUpperCase() || "U";
  const gradient = getAvatarGradient(id);

  const avatarContent = (
    <Avatar className={`${sizeClass} rounded-full ${avatarClassName}`}>
      {avatarUrl && (
        <AvatarImage src={avatarUrl} alt={name || email || "User"} />
      )}
      <AvatarFallback
        className={`rounded-full font-medium text-white ${textSize}`}
        style={gradient.style}
      >
        {displayInitials}
      </AvatarFallback>
    </Avatar>
  );

  const defaultTrigger = (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all hover:scale-105 ${
        isActive ? "ring-2 ring-primary" : ""
      } ${className}`}
    >
      {avatarContent}
      {showChevron && <ChevronUp className="ml-1 size-4" />}
      {menuShortcut && (
        <Shortcut className="ml-auto hidden text-xs text-muted-foreground md:inline-flex">
          {menuShortcut}
        </Shortcut>
      )}
      <span className="sr-only">User menu</span>
    </button>
  );

  const renderMenuItem = (item: UserAvatarMenuItem) => {
    const Icon = item.icon;
    const content = (
      <>
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        <span className="flex-1">{item.label}</span>
        {item.showShortcut !== false && item.shortcut && (
          <Shortcut className="text-xs text-muted-foreground">
            {item.shortcut}
          </Shortcut>
        )}
      </>
    );

    const menuItemProps = {
      variant: item.destructive ? ("destructive" as const) : undefined,
      className: "cursor-pointer",
    };

    if (item.href) {
      if (item.external) {
        return (
          <DropdownMenuItem asChild {...menuItemProps}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`cursor-pointer${item.destructive ? "" : " text-muted-foreground"}`}
            >
              {content}
            </a>
          </DropdownMenuItem>
        );
      }

      if (LinkComponent) {
        return (
          <DropdownMenuItem asChild {...menuItemProps}>
            <LinkComponent href={item.href} className="cursor-pointer">
              {content}
            </LinkComponent>
          </DropdownMenuItem>
        );
      }

      return (
        <DropdownMenuItem asChild {...menuItemProps}>
          <a
            href={item.href}
            className={`cursor-pointer${item.destructive ? "" : ""}`}
          >
            {content}
          </a>
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuItem onClick={item.onClick} {...menuItemProps}>
        {content}
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={`rounded-lg ${menuWidth || "w-56"}`}
        side={side}
        align={align}
        sideOffset={4}
      >
        {showUserInfo && (
          <>
            <div className="px-2 py-1.5 text-sm">
              <div className="font-semibold">{name || "User"}</div>
              {email && (
                <div className="text-xs text-muted-foreground">{email}</div>
              )}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        {header}
        {items.map((item, index) => (
          <Fragment key={item.label || index}>
            {item.separatorBefore && <DropdownMenuSeparator />}
            {renderMenuItem(item)}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
