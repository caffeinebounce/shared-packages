"use client";

import type { NotificationBadgeProps } from "../types";

/**
 * Badge component showing unread notification count
 */
export function NotificationBadge({
  count,
  max = 9,
  className = "",
}: NotificationBadgeProps) {
  if (count <= 0) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count;

  return (
    <span
      className={`absolute -top-0.5 -right-0.5 flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-red-500 rounded-full ${className}`}
    >
      {displayCount}
    </span>
  );
}
