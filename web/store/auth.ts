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
  async login({ commit }: any, { email, password }: { email: string; password: string }) {
    commit("setLoading", true);
    try {
      const response = await api.login(email, password);
      commit("setUser", response.user);
      return response.user;
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
    }
  },
  async fetchCurrentUser({ commit }: any) {
    try {
      const response = await api.getCurrentUser();
      commit("setUser", response.user);
      return response.user;
    } catch (error) {
      commit("setUser", null);
      throw error;
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

