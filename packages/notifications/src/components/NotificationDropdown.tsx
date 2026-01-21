"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const [LinkComponent, setLinkComponent] = useState<
    React.ComponentType<{
      href: string;
      onClick?: () => void;
      className?: string;
      children: React.ReactNode;
    }>
  >(() => {
    // Default fallback component
    return ({
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
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Try to dynamically import Next.js Link
    import("next/link")
      .then((module) => {
        setLinkComponent(() => module.default);
      })
      .catch(() => {
        // Ignore error - fallback is already set
      });
  }, []);

  // Focus management and keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    // Store the element that had focus before opening the dropdown
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the dropdown container
    dropdownRef.current?.focus();

    // Return focus to the bell button when closing
    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Tab key handling to trap focus within dropdown
      if (e.key === "Tab") {
        const focusableElements = dropdownRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift+Tab: move to previous focusable element
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: move to next focusable element
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      role="dialog"
      aria-labelledby={bellButtonId}
      aria-modal="false"
      tabIndex={-1}
      className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-background border rounded-lg shadow-lg overflow-hidden z-50 focus:outline-none"
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
