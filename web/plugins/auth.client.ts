import { Plugin } from "@nuxt/types";

const authPlugin: Plugin = async ({ store }) => {
  // Try to restore session on app init
  if (process.client) {
    try {
      // Add timeout to prevent hanging if backend is unavailable
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 3000)
      );
      await Promise.race([
        store.dispatch("auth/fetchCurrentUser"),
        timeoutPromise,
      ]);
    } catch (error: any) {
      // Not authenticated or backend unavailable - that's fine
      if (error?.message !== "Timeout") {
        console.log("No active session");
      } else {
        console.warn("Backend may be unavailable");
      }
    }
  }
};

export default authPlugin;

