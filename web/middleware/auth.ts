import { Middleware } from "@nuxt/types";

const authMiddleware: Middleware = async ({ store, redirect, route }) => {
  // Only check auth if we're not already on login page
  if (route.path === "/login") {
    return;
  }
  
  // Guard against undefined route.path during SSR
  if (!route.path) {
    return;
  }

  // Skip auth check during SSR - only check on client-side
  // This allows the auth plugin to restore session before middleware runs
  if (!process.client) {
    return;
  }

  // On client-side, wait for auth plugin to restore session if needed
  // Auth plugin runs before middleware, but we wait a bit to ensure it completes
  if (!store.getters["auth/isAuthenticated"]) {
    // Wait for auth plugin to finish (max 3 seconds)
    let waited = 0;
    while (waited < 3000 && !store.getters["auth/isAuthenticated"]) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      waited += 100;
    }
    
    // If still not authenticated after waiting, try fetching user one more time
    // This handles cases where plugin might have failed due to network issues
    if (!store.getters["auth/isAuthenticated"]) {
      try {
        // Increased timeout to 5 seconds for slow backends
        await Promise.race([
          store.dispatch("auth/fetchCurrentUser"),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
        ]);
      } catch (error) {
        // Not authenticated or timeout - proceed to redirect
        // Log for debugging
        if (process.env.NODE_ENV === "development") {
          console.log("[Auth Middleware] fetchCurrentUser failed:", error);
        }
      }
    }
  }

  const isAuthenticated = store.getters["auth/isAuthenticated"];

  if (!isAuthenticated) {
    // Only redirect if not already going to login
    if (route.path && route.path !== "/login") {
      return redirect(`/login?redirect=${encodeURIComponent(route.fullPath || route.path)}`);
    }
  }
};

export default authMiddleware;

