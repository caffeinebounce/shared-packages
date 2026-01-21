"use client";

import { Bell } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import type { NotificationBellProps } from "../types";
import { NotificationBadge } from "./NotificationBadge";
import { NotificationDropdown } from "./NotificationDropdown";

/**
 * Default icon renderer - returns a Bell icon for all types
 */
function defaultRenderIcon(): React.ReactNode {
  return <Bell className="h-4 w-4" />;
}

/**
 * Notification bell component with dropdown panel
 */
export function NotificationBell({
  fetchEndpoint = "/api/notifications",
  markReadEndpoint = (id: string) => `/api/notifications/${id}/read`,
  markAllReadEndpoint = "/api/notifications/read-all",
  renderIcon = defaultRenderIcon,
  getLink,
  viewAllHref = "/notifications",
  className = "",
  limit = 10,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellButtonId = useId();

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markingAsRead,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications({
    fetchEndpoint,
    markReadEndpoint,
    markAllReadEndpoint,
    limit,
  });

  // Fetch on mount and when dropdown opens
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Bell button */}
      <button
        id={bellButtonId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md hover:bg-accent/50 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell className="h-5 w-5" />
        <NotificationBadge count={unreadCount} />
      </button>

      {/* Dropdown panel */}
      <NotificationDropdown
        isOpen={isOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        isLoading={isLoading}
        error={error}
        renderIcon={renderIcon}
        getLink={getLink}
        viewAllHref={viewAllHref}
        onClose={() => setIsOpen(false)}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onRetry={fetchNotifications}
        markingAsRead={markingAsRead}
        bellButtonId={bellButtonId}
      />
    </div>
  );
}
