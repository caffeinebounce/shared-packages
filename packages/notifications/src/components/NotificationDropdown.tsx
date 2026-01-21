"use client";

import { X } from "lucide-react";
import type { NotificationDropdownProps } from "../types";
import { NotificationList } from "./NotificationList";

/**
 * Dropdown panel containing the notification list and controls
 */
export function NotificationDropdown({
  isOpen,
  notifications,
  unreadCount,
  isLoading,
  error,
  renderIcon,
  getLink,
  viewAllHref = "/notifications",
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onRetry,
  onItemClick,
  markingAsRead,
  bellButtonId,
}: NotificationDropdownProps) {
  if (!isOpen) {
    return null;
  }

  // Dynamic import to make Next.js Link optional
  let LinkComponent: React.ComponentType<{
    href: string;
    onClick?: () => void;
    className?: string;
    children: React.ReactNode;
  }>;

  try {
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic import for optional Next.js
    LinkComponent = require("next/link").default as any;
  } catch {
    // Fall back to anchor tag if Next.js is not available
    LinkComponent = ({
      href,
      onClick,
      className,
      children,
    }: {
      href: string;
      onClick?: () => void;
      className?: string;
      children: React.ReactNode;
    }) => (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    );
  }

  return (
    <div
      role="dialog"
      aria-labelledby={bellButtonId}
      aria-modal="false"
      className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-background border rounded-lg shadow-lg overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold">Notifications</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-accent/50 rounded"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto max-h-72">
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          error={error}
          renderIcon={renderIcon}
          getLink={getLink}
          onMarkAsRead={onMarkAsRead}
          onRetry={onRetry}
          onItemClick={(notification) => {
            onItemClick?.(notification);
            onClose();
          }}
          markingAsRead={markingAsRead}
        />
      </div>

      {/* Footer */}
      {notifications.length > 0 && viewAllHref && (
        <div className="border-t p-2">
          <LinkComponent
            href={viewAllHref}
            onClick={onClose}
            className="block text-center text-sm text-primary hover:underline py-1"
          >
            View all notifications
          </LinkComponent>
        </div>
      )}
    </div>
  );
}
