import { Plugin } from "@nuxt/types";
import { api } from "~/utils/api";

const authPlugin: Plugin = async ({ store, app }) => {
  // Try to restore session on app init
  // Note: We can't check httpOnly cookies from JS, so we always try to fetch user
  if (process.client) {
    try {
      // Increase timeout to allow backend to respond
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 10000)
      );
      
      // Always attempt to restore session via backend
      // Backend will check the httpOnly cookie and return user if valid
      await Promise.race([
        store.dispatch("auth/fetchCurrentUser"),
        timeoutPromise,
      ]);
      
      // Session restored successfully - load bookmarks
      try {
        const bookmarks = await api.getBookmarks();
        // Update store with bookmark statuses
        for (const bookmark of bookmarks) {
          store.commit("social/setBookmarked", {
            articleId: bookmark.article.id,
            bookmarked: true,
          });
        }
      } catch (err) {
        // Bookmarks loading failed - not critical
        console.log("Could not load bookmarks:", err);
      }
    } catch (error: any) {
      // fetchCurrentUser failed - either not authenticated (401) or backend unavailable
      // Clear auth state only if backend confirms session is invalid (401)
      // For timeouts or network errors, keep existing state (backend might be temporarily unavailable)
      if (error?.status === 401 || (error?.message && error.message.includes("401"))) {
        // Backend confirmed: session is invalid
        store.commit("auth/setUser", null);
      } else if (error?.message !== "Timeout" && error?.message !== "Request timeout") {
        // Network error or other error (not timeout) - might be temporary, but clear state to be safe
        // Only clear if it's a clear authentication error
        if (error?.message?.includes("authentication") || error?.message?.includes("unauthorized")) {
          store.commit("auth/setUser", null);
        }
        // For other errors (network, etc.), keep state - might be temporary
      }
      // On timeout, keep existing state (backend might be temporarily unavailable)
    }
  }
};

export default authPlugin;

