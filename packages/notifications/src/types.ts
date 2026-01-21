import type { ReactNode } from "react";

/**
 * Generic notification interface
 */
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean | null;
  createdAt: string;
}

/**
 * API response from notifications endpoint
 */
export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Props for the NotificationBell component
 */
export interface NotificationBellProps {
  /** API endpoint to fetch notifications (default: "/api/notifications") */
  fetchEndpoint?: string;
  /** Function to generate mark-as-read endpoint for a notification ID */
  markReadEndpoint?: (id: string) => string;
  /** API endpoint to mark all notifications as read */
  markAllReadEndpoint?: string;
  /** Custom icon renderer based on notification type */
  renderIcon?: (type: string) => ReactNode;
  /** Function to get link URL for a notification (return null for no link) */
  getLink?: (notification: Notification) => string | null;
  /** URL for "View all notifications" link */
  viewAllHref?: string;
  /** Additional CSS class names */
  className?: string;
  /** Limit of notifications to fetch */
  limit?: number;
}

/**
 * Props for NotificationBadge component
 */
export interface NotificationBadgeProps {
  /** Number of unread notifications */
  count: number;
  /** Maximum number to display (shows "9+" for values above max) */
  max?: number;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for NotificationItem component
 */
export interface NotificationItemProps {
  notification: Notification;
  /** Custom icon renderer */
  renderIcon?: (type: string) => ReactNode;
  /** Link URL for this notification */
  link?: string | null;
  /** Callback when notification is clicked */
  onClick?: () => void;
  /** Callback when mark-as-read button is clicked */
  onMarkAsRead?: () => void;
  /** Whether mark-as-read is in progress */
  isMarkingAsRead?: boolean;
}

/**
 * Props for NotificationList component
 */
export interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  renderIcon?: (type: string) => ReactNode;
  getLink?: (notification: Notification) => string | null;
  onMarkAsRead: (id: string) => void;
  onRetry: () => void;
  onItemClick?: (notification: Notification) => void;
  markingAsRead: Set<string>;
}

/**
 * Props for NotificationDropdown component
 */
export interface NotificationDropdownProps {
  isOpen: boolean;
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  renderIcon?: (type: string) => ReactNode;
  getLink?: (notification: Notification) => string | null;
  viewAllHref?: string;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRetry: () => void;
  onItemClick?: (notification: Notification) => void;
  markingAsRead: Set<string>;
  bellButtonId: string;
}
