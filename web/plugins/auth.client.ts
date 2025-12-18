import { Plugin } from "@nuxt/types";

const authPlugin: Plugin = async ({ store }) => {
  // Try to restore session on app init
  if (process.client) {
    try {
      await store.dispatch("auth/fetchCurrentUser");
    } catch (error) {
      // Not authenticated, that's fine
      console.log("No active session");
    }
  }
};

export default authPlugin;

