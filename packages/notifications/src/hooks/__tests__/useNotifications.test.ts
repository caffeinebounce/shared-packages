import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotifications } from "../useNotifications";

// Mock fetch
global.fetch = vi.fn();

describe("useNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchNotifications", () => {
    it("fetches notifications successfully", async () => {
      const mockData = {
        notifications: [
          {
            id: "1",
            title: "Test notification",
            message: "Test message",
            type: "info",
            isRead: false,
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
        unreadCount: 1,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useNotifications());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.notifications).toEqual([]);

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(global.fetch).toHaveBeenCalledWith("/api/notifications?limit=10");
      expect(result.current.notifications).toEqual(mockData.notifications);
      expect(result.current.unreadCount).toBe(1);
      expect(result.current.error).toBeNull();
    });

    it("handles fetch errors", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(result.current.error).toBe(
        "Unable to load notifications. Please try again.",
      );
      expect(result.current.notifications).toEqual([]);
    });

    it("handles network errors", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(result.current.error).toBe("Check your connection and try again.");
    });

    it("uses custom fetch endpoint", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notifications: [], unreadCount: 0 }),
      });

      const { result } = renderHook(() =>
        useNotifications({ fetchEndpoint: "/custom/endpoint", limit: 20 }),
      );

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(global.fetch).toHaveBeenCalledWith("/custom/endpoint?limit=20");
    });

    it("preserves existing query params on relative fetch endpoints", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notifications: [], unreadCount: 0 }),
      });

      const { result } = renderHook(() =>
        useNotifications({
          fetchEndpoint: "/api/notifications?teamId=team-1",
          limit: 20,
        }),
      );

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/notifications?teamId=team-1&limit=20",
      );
    });

    it("preserves existing query params on absolute fetch endpoints", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notifications: [], unreadCount: 0 }),
      });

      const { result } = renderHook(() =>
        useNotifications({
          fetchEndpoint: "https://example.test/api/notifications?teamId=team-1",
          limit: 5,
        }),
      );

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.test/api/notifications?teamId=team-1&limit=5",
      );
    });

    it("preserves path-relative fetch endpoints", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notifications: [], unreadCount: 0 }),
      });

      const { result } = renderHook(() =>
        useNotifications({
          fetchEndpoint: "api/notifications?teamId=team-1",
          limit: 20,
        }),
      );

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "api/notifications?teamId=team-1&limit=20",
      );
    });

    it("preserves protocol-relative fetch endpoints", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notifications: [], unreadCount: 0 }),
      });

      const { result } = renderHook(() =>
        useNotifications({
          fetchEndpoint: "//example.test/api/notifications?teamId=team-1",
          limit: 5,
        }),
      );

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "//example.test/api/notifications?teamId=team-1&limit=5",
      );
    });
  });

  describe("markAsRead", () => {
    it("marks a notification as read with optimistic update", async () => {
      const mockData = {
        notifications: [
          {
            id: "1",
            title: "Test",
            message: "Message",
            type: "info",
            isRead: false,
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
        unreadCount: 1,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
      });

      await act(async () => {
        await result.current.markAsRead("1");
      });

      // Should be marked as read optimistically
      expect(result.current.notifications[0].isRead).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });

    it("reverts optimistic update on failure", async () => {
      const mockData = {
        notifications: [
          {
            id: "1",
            title: "Test",
            message: "Message",
            type: "info",
            isRead: false,
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
        unreadCount: 1,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      await act(async () => {
        await result.current.markAsRead("1");
      });

      // Should be reverted to unread
      await waitFor(() => {
        expect(result.current.notifications[0].isRead).toBe(false);
        expect(result.current.unreadCount).toBe(1);
      });
    });

    it("skips already read notifications", async () => {
      const mockData = {
        notifications: [
          {
            id: "1",
            title: "Test",
            message: "Message",
            type: "info",
            isRead: true,
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
        unreadCount: 0,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      const fetchCallCount = (global.fetch as ReturnType<typeof vi.fn>).mock
        .calls.length;

      await act(async () => {
        await result.current.markAsRead("1");
      });

      // Should not make additional API call for already read notification
      expect((global.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
        fetchCallCount,
      );
    });

    it("skips unknown notification IDs", async () => {
      const mockData = {
        notifications: [
          {
            id: "1",
            title: "Test",
            message: "Message",
            type: "info",
            isRead: false,
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
        unreadCount: 1,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      const fetchCallCount = (global.fetch as ReturnType<typeof vi.fn>).mock
        .calls.length;

      await act(async () => {
        await result.current.markAsRead("missing-id");
      });

      expect(result.current.notifications).toEqual(mockData.notifications);
      expect(result.current.unreadCount).toBe(1);
      expect((global.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
        fetchCallCount,
      );
    });

    it("uses custom mark read endpoint", async () => {
      const mockData = {
        notifications: [
          {
            id: "1",
            title: "Test",
            message: "Message",
            type: "info",
            isRead: false,
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
        unreadCount: 1,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() =>
        useNotifications({
          markReadEndpoint: (id: string) => `/custom/read/${id}`,
        }),
      );

      await act(async () => {
        await result.current.fetchNotifications();
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
      });

      await act(async () => {
        await result.current.markAsRead("1");
      });

      expect(global.fetch).toHaveBeenCalledWith("/custom/read/1", {
        method: "PATCH",
      });
    });
  });

  describe("markAllAsRead", () => {
    it("marks all notifications as read", async () => {
      const mockData = {
        notifications: [
          {
            id: "1",
            title: "Test 1",
            message: "Message 1",
            type: "info",
            isRead: false,
            createdAt: "2024-01-01T00:00:00Z",
          },
          {
            id: "2",
            title: "Test 2",
            message: "Message 2",
            type: "info",
            isRead: false,
            createdAt: "2024-01-02T00:00:00Z",
          },
        ],
        unreadCount: 2,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
      });

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(result.current.notifications.every((n) => n.isRead)).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });

    it("reverts on failure", async () => {
      const mockData = {
        notifications: [
          {
            id: "1",
            title: "Test",
            message: "Message",
            type: "info",
            isRead: false,
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
        unreadCount: 1,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      await act(async () => {
        await result.current.markAllAsRead();
      });

      await waitFor(() => {
        expect(result.current.notifications[0].isRead).toBe(false);
        expect(result.current.unreadCount).toBe(1);
      });
    });

    it("uses custom mark all read endpoint", async () => {
      const mockData = {
        notifications: [
          {
            id: "1",
            title: "Test",
            message: "Message",
            type: "info",
            isRead: false,
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
        unreadCount: 1,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() =>
        useNotifications({
          markAllReadEndpoint: "/custom/read-all",
        }),
      );

      await act(async () => {
        await result.current.fetchNotifications();
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
      });

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(global.fetch).toHaveBeenCalledWith("/custom/read-all", {
        method: "PATCH",
      });
    });
  });
});
