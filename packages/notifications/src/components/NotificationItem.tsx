"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell, Check } from "lucide-react";
import type { ReactNode } from "react";
import type { NotificationItemProps } from "../types";

/**
 * Default icon renderer - returns a Bell icon
 */
function defaultRenderIcon(): ReactNode {
  return <Bell className="h-4 w-4" />;
}

/**
 * Single notification item component
 */
export function NotificationItem({
  notification,
  renderIcon = defaultRenderIcon,
  link,
  onClick,
  onMarkAsRead,
  isMarkingAsRead,
}: NotificationItemProps) {
  const content = (
    <div
      className={`flex gap-3 p-3 ${
        !notification.isRead ? "bg-primary/5" : "hover:bg-accent/30"
      } transition-colors`}
    >
      <div
        className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
          !notification.isRead
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {renderIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!notification.isRead ? "font-medium" : ""}`}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
      {!notification.isRead && onMarkAsRead && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMarkAsRead();
          }}
          className="flex-shrink-0 p-1 hover:bg-accent rounded"
          aria-label="Mark as read"
          disabled={isMarkingAsRead}
        >
          <Check className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );

  // If there's a link, try to use Next.js Link if available
  if (link) {
    // Dynamic import to make Next.js optional
    try {
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic import for optional Next.js
      const NextLink = require("next/link").default as any;
      return (
        <NextLink href={link} onClick={onClick} className="block">
          {content}
        </NextLink>
      );
    } catch {
      // Fall back to regular anchor tag if Next.js is not available
      return (
        <a href={link} onClick={onClick} className="block">
          {content}
        </a>
      );
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left cursor-pointer"
    >
      {content}
    </button>
  );
}
