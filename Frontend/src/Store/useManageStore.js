import { create } from "zustand";
import { auth } from "../../Service/FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { getUserData } from "../../Service/FirebaseConfig";

const useManageStore = create((set, get) => ({
  currentUser: null,
  userData: null,
  loading: true,
  isAdmin: false,
  isStudent: false,

  initializeAuth: () => {
    // Prevent multiple initializations
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

  // Optional: action to manually unsubscribe (e.g., on unmount)
  destroyAuth: () => {
    const unsubscribe = get().unsubscribe;
    if (unsubscribe && typeof unsubscribe === "function") {
      unsubscribe();
      set({ unsubscribe: null, initialized: false });
    }
  },
}));
