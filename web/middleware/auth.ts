import { Middleware } from "@nuxt/types";

const authMiddleware: Middleware = ({ store, redirect, route }) => {
  const isAuthenticated = store.getters["auth/isAuthenticated"];

  if (!isAuthenticated) {
    return redirect(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
  }
};

export default authMiddleware;

