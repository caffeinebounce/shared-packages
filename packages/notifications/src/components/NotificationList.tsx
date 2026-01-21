"use client";

import { Bell } from "lucide-react";
import type { NotificationListProps } from "../types";
import { NotificationItem } from "./NotificationItem";

/**
 * List of notifications with loading and error states
 */
export function NotificationList({
  notifications,
  isLoading,
  error,
  renderIcon,
  getLink,
  onMarkAsRead,
  onRetry,
  onItemClick,
  markingAsRead,
}: NotificationListProps) {
  if (isLoading && notifications.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <ul>
      {notifications.map((notification) => {
        const link = getLink?.(notification) ?? null;
        return (
          <li key={notification.id} className="border-b last:border-0">
            <NotificationItem
              notification={notification}
              renderIcon={renderIcon}
              link={link}
              onClick={() => {
                if (!notification.isRead) {
                  onMarkAsRead(notification.id);
                }
                onItemClick?.(notification);
              }}
              onMarkAsRead={() => onMarkAsRead(notification.id)}
              isMarkingAsRead={markingAsRead.has(notification.id)}
            />
          </li>
        );
      })}
    </ul>
  );
}
