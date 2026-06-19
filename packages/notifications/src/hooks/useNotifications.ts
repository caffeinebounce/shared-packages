"use client";

import { useCallback, useRef, useState } from "react";
import type { Notification, NotificationsResponse } from "../types";

interface UseNotificationsOptions {
  /** API endpoint to fetch notifications (default: "/api/notifications") */
  fetchEndpoint?: string;
  /** Function to generate mark-as-read endpoint for a notification ID */
  markReadEndpoint?: (id: string) => string;
  /** API endpoint to mark all notifications as read */
  markAllReadEndpoint?: string;
  /** Number of notifications to fetch */
  limit?: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markingAsRead: Set<string>;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

function buildNotificationsUrl(fetchEndpoint: string, limit: number): string {
  const hashIndex = fetchEndpoint.indexOf("#");
  const endpointWithoutHash =
    hashIndex === -1 ? fetchEndpoint : fetchEndpoint.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : fetchEndpoint.slice(hashIndex);

  const queryIndex = endpointWithoutHash.indexOf("?");
  const endpointPrefix =
    queryIndex === -1
      ? endpointWithoutHash
      : endpointWithoutHash.slice(0, queryIndex);
  const queryString =
    queryIndex === -1 ? "" : endpointWithoutHash.slice(queryIndex + 1);

  const query = new URLSearchParams(queryString);
  query.set("limit", String(limit));

  return `${endpointPrefix}?${query.toString()}${hash}`;
}

/**
 * Hook for fetching and managing notifications
 */
export function useNotifications({
  fetchEndpoint = "/api/notifications",
  markReadEndpoint = (id: string) => `/api/notifications/${id}/read`,
  markAllReadEndpoint = "/api/notifications/read-all",
  limit = 10,
}: UseNotificationsOptions = {}): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set());

  // Use refs to access latest values without adding to dependencies
  const notificationsRef = useRef(notifications);
  const markingAsReadRef = useRef(markingAsRead);

  // Keep refs in sync
  notificationsRef.current = notifications;
  markingAsReadRef.current = markingAsRead;

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(buildNotificationsUrl(fetchEndpoint, limit));
      if (res.ok) {
        const data: NotificationsResponse = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } else {
        setError("Unable to load notifications. Please try again.");
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchEndpoint, limit]);

  const markAsRead = useCallback(
    async (id: string) => {
      // Skip if already marking this notification or already read
      if (markingAsReadRef.current.has(id)) {
        return;
      }

      const notification = notificationsRef.current.find((n) => n.id === id);
      if (!notification || notification.isRead) {
        return;
      }

      // Optimistic update
      setMarkingAsRead((prev) => new Set(prev).add(id));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        const res = await fetch(markReadEndpoint(id), {
          method: "PATCH",
        });
        if (!res.ok) {
          // Revert optimistic update on failure
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
          );
          setUnreadCount((prev) => prev + 1);
          console.error("Failed to mark notification as read");
        }
      } catch (err) {
        // Revert optimistic update on error
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
        );
        setUnreadCount((prev) => prev + 1);
        console.error("Failed to mark notification as read:", err);
      } finally {
        setMarkingAsRead((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [markReadEndpoint],
  );

  const markAllAsRead = useCallback(async () => {
    // Capture current state for potential rollback
    const previousNotifications = notificationsRef.current;
    const previousUnreadCount = unreadCount;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      const res = await fetch(markAllReadEndpoint, {
        method: "PATCH",
      });
      if (!res.ok) {
        // Revert on failure
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
        console.error("Failed to mark all as read");
      }
    } catch (err) {
      // Revert on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      console.error("Failed to mark all as read:", err);
    }
  }, [markAllReadEndpoint, unreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markingAsRead,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
