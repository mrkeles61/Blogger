import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import { api, User } from "~/utils/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

@Module({
  name: "auth",
  stateFactory: true,
  namespaced: true,
})
export default class AuthModule extends VuexModule implements AuthState {
  user: User | null = null;
  isAuthenticated = false;
  loading = false;

  @Mutation
  setUser(user: User | null) {
    this.user = user;
    this.isAuthenticated = !!user;
  }

  @Mutation
  setLoading(loading: boolean) {
    this.loading = loading;
  }

  @Action
  async login({ email, password }: { email: string; password: string }) {
    this.context.commit("setLoading", true);
    try {
      const response = await api.login(email, password);
      this.context.commit("setUser", response.user);
      return response.user;
    } finally {
      this.context.commit("setLoading", false);
    }
  }

  @Action
  async logout() {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.context.commit("setUser", null);
    }
  }

  @Action
  async fetchCurrentUser() {
    try {
      const response = await api.getCurrentUser();
      this.context.commit("setUser", response.user);
      return response.user;
    } catch (error) {
      this.context.commit("setUser", null);
      throw error;
    }
  }

  get isAdmin(): boolean {
    return this.isAuthenticated && this.user?.role === "Admin";
  }

  get isEditor(): boolean {
    return this.isAuthenticated && (this.user?.role === "Editor" || this.user?.role === "Admin");
  }
}

