import { Plugin } from "@nuxt/types";
import { api } from "~/utils/api";

const authPlugin: Plugin = async ({ store, app }) => {
  // Try to restore session on app init
  // Note: We can't check httpOnly cookies from JS, so we always call /api/auth/me
  if (process.client) {
    console.log("[AUTH DEBUG] Plugin starting - attempting to restore session");
    console.log("[AUTH DEBUG] Cookies available:", document.cookie);
    
    // Catch ALL errors including runtime errors that might crash the app
    try {
      // Always attempt to restore session via backend
      // Backend will check the httpOnly cookie and return user if valid
      console.log("[AUTH DEBUG] Calling fetchCurrentUser...");
      const user = await store.dispatch("auth/fetchCurrentUser");
      console.log("[AUTH DEBUG] fetchCurrentUser succeeded, user:", user);
      console.log("[AUTH DEBUG] Auth state after restore:", store.getters["auth/isAuthenticated"]);
      
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
      // fetchCurrentUser failed - either not authenticated or backend unavailable
      console.error("[AUTH DEBUG] fetchCurrentUser failed:", error);
      console.error("[AUTH DEBUG] Error message:", error.message);
      console.error("[AUTH DEBUG] Error status:", error.status);
      console.error("[AUTH DEBUG] Error details:", error);
      console.error("[AUTH DEBUG] Error stack:", error.stack);
      // Clear auth state on any failure
      store.commit("auth/setUser", null);
      console.log("[AUTH DEBUG] Auth state cleared");
    }
  }
};

// Global error handler to catch any unhandled errors
if (process.client) {
  window.addEventListener('error', (event) => {
    console.error("[GLOBAL ERROR]", event.error);
    console.error("[GLOBAL ERROR] Message:", event.message);
    console.error("[GLOBAL ERROR] Filename:", event.filename);
    console.error("[GLOBAL ERROR] Line:", event.lineno);
    console.error("[GLOBAL ERROR] Column:", event.colno);
    console.error("[GLOBAL ERROR] Stack:", event.error?.stack);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error("[UNHANDLED PROMISE REJECTION]", event.reason);
    console.error("[UNHANDLED PROMISE REJECTION] Stack:", event.reason?.stack);
  });
}

export default authPlugin;

