import { api, User } from "~/utils/api";

export const state = () => ({
  user: null as User | null,
  isAuthenticated: false,
  loading: false,
});

export type AuthState = ReturnType<typeof state>;

export const mutations = {
  setUser(state: AuthState, user: User | null) {
    state.user = user;
    state.isAuthenticated = !!user;
  },
  setLoading(state: AuthState, loading: boolean) {
    state.loading = loading;
  },
};

export const actions = {
  async login({ commit, dispatch }: any, { email, password }: { email: string; password: string }) {
    commit("setLoading", true);
    try {
      const response = await api.login(email, password);
      commit("setUser", response.user);
      // Load bookmarks after successful login
      try {
        await dispatch("social/loadBookmarks", null, { root: true });
      } catch (err) {
        // Bookmarks loading failed - not critical
        console.log("Could not load bookmarks after login:", err);
      }
      return response.user;
    } catch (error: any) {
      // Re-throw with better error message
      const errorMessage = error.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
      throw new Error(errorMessage);
    } finally {
      commit("setLoading", false);
    }
  },
  async logout({ commit }: any) {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      commit("setUser", null);
      // Clear bookmarks on logout (commit directly to social module)
      commit("social/clearBookmarks", null, { root: true });
    }
  },
  async fetchCurrentUser({ commit }: any) {
    commit("setLoading", true);
    try {
      console.log("[AUTH DEBUG] fetchCurrentUser action - calling api.getCurrentUser()");
      const response = await api.getCurrentUser();
      console.log("[AUTH DEBUG] getCurrentUser response:", response);
      commit("setUser", response.user);
      console.log("[AUTH DEBUG] User committed to store:", response.user);
      return response.user;
    } catch (error: any) {
      // On failure, clear user state
      console.error("[AUTH DEBUG] fetchCurrentUser action error:", error);
      console.error("[AUTH DEBUG] Error status:", error.status);
      console.error("[AUTH DEBUG] Error message:", error.message);
      // The plugin will handle the state clearing, but we throw to indicate failure
      throw error;
    } finally {
      commit("setLoading", false);
    }
  },
};

export const getters = {
  isAuthenticated(state: AuthState): boolean {
    return !!state.user;
  },
  isAdmin(state: AuthState): boolean {
    return !!state.user && state.user.role === "Admin";
  },
  isEditor(state: AuthState): boolean {
    return !!state.user && (state.user.role === "Editor" || state.user.role === "Admin");
  },
};

