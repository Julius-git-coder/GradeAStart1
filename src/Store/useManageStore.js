import { create } from "zustand";

const useManageStore = create((set) => ({
  // Notifications state
  notifications: [],

  // Mark notification as read
  markNotificationAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ),
    }));
  },

  // Optional: Add a notification (for completeness)
  addNotification: (
    userId,
    type,
    message,
    fromUserId = null,
    sessionId = null
  ) => {
    const newNotification = {
      id: Date.now().toString(),
      userId,
      type,
      message,
      fromUserId,
      sessionId,
      read: false,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));
  },

  // Optional: Clear all notifications (for completeness)
  clearNotifications: () => {
    set({ notifications: [] });
  },
}));

export default useManageStore;
