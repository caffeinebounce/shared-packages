// @caffeinebounce/notifications - Generic notification UI components

// Subcomponents (for custom composition)
export { NotificationBadge } from "./components/NotificationBadge";
// Main component
export { NotificationBell } from "./components/NotificationBell";
export { NotificationDropdown } from "./components/NotificationDropdown";
export { NotificationItem } from "./components/NotificationItem";
export { NotificationList } from "./components/NotificationList";

// Hook
export { useNotifications } from "./hooks/useNotifications";

// Types
export type {
  Notification,
  NotificationBadgeProps,
  NotificationBellProps,
  NotificationDropdownProps,
  NotificationItemProps,
  NotificationListProps,
  NotificationsResponse,
} from "./types";
