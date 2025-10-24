// Frontend/src/Store/useManageStore.js
import { create } from "zustand";
import { auth, db } from "../../Service/FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { getUserData } from "../../Service/FirebaseConfig";
import React, { createContext, useContext, useEffect } from "react";

// Main store for state management
const useManageStore = create((set, get) => ({
  // Auth state (primitives for max stability)
  currentUser: null,
  userData: null,
  loading: true,
  isAdmin: false,
  isStudent: false,
  initialized: false,
  unsubscribe: null,

  // Notifications (stable empty array)
  notifications: [],

  initializeAuth: () => {
    if (get().initialized) {
      return get().unsubscribe;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      set({ currentUser: user });

      if (user) {
        try {
          const data = await getUserData(user.uid);
          set({
            userData: data,
            isAdmin: data?.role === "admin",
            isStudent: data?.role === "student",
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          set({
            userData: null,
            isAdmin: false,
            isStudent: false,
          });
        }
      } else {
        set({
          userData: null,
          isAdmin: false,
          isStudent: false,
        });
      }

      set({ loading: false });
    });

    set({ unsubscribe, initialized: true });
    return unsubscribe;
  },

  destroyAuth: () => {
    const unsubscribe = get().unsubscribe;
    if (unsubscribe && typeof unsubscribe === "function") {
      unsubscribe();
      set({ unsubscribe: null, initialized: false });
    }
  },

  // Notifications actions (stable updates)
  addNotification: (notification) => {
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: Date.now().toString(),
          ...notification,
          read: false,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  },

  markNotificationAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  getUnreadCount: () => get().notifications.filter((n) => !n.read).length,
}));

// FIXED: Convenience hook for auth (individual stable selectors)
export const useAuthStore = () => {
  const currentUser = useManageStore((state) => state.currentUser);
  const userData = useManageStore((state) => state.userData);
  const loading = useManageStore((state) => state.loading);
  const isAdmin = useManageStore((state) => state.isAdmin);
  const isStudent = useManageStore((state) => state.isStudent);
  const notifications = useManageStore((state) => state.notifications);

  return {
    currentUser,
    userData,
    loading,
    isAdmin,
    isStudent,
    notifications,
    markNotificationAsRead: useManageStore(
      (state) => state.markNotificationAsRead
    ),
    getUnreadCount: useManageStore((state) => state.getUnreadCount),
  };
};

// Legacy Auth Context (minimal; no unstable selector here)
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  useEffect(() => {
    const unsubscribe = useManageStore.getState().initializeAuth();
    return () => {
      if (unsubscribe) unsubscribe();
      useManageStore.getState().destroyAuth();
    };
  }, []);

  // FIXED: No object selector—use individual hooks for context value
  const currentUser = useManageStore((state) => state.currentUser);
  const userData = useManageStore((state) => state.userData);
  const loading = useManageStore((state) => state.loading);
  const isAdmin = useManageStore((state) => state.isAdmin);
  const isStudent = useManageStore((state) => state.isStudent);

  const authState = { currentUser, userData, loading, isAdmin, isStudent };

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { db };
export default useManageStore;



