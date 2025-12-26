<template>
  <div v-cloak>
    <!-- Sticky Header -->
    <header
      v-if="!isLoginPage"
      class="sticky top-0 z-40 bg-gray-900 bg-opacity-95 backdrop-blur-lg border-b border-gray-700 shadow-sm"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <nuxt-link to="/" class="text-2xl font-playfair font-bold text-white hover:text-accent-purple transition-soft">
            Bilfen Blog
          </nuxt-link>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-6">
            <nuxt-link
              to="/"
              class="text-sm font-medium text-gray-300 hover:text-white transition-soft"
              :class="{ 'text-accent-purple': $route.path === '/' }"
            >
              Ana Sayfa
            </nuxt-link>
            <nuxt-link
              v-if="isAuthenticated"
              to="/feed"
              class="text-sm font-medium text-gray-300 hover:text-white transition-soft"
              :class="{ 'text-accent-purple': $route.path === '/feed' }"
            >
              Akış
            </nuxt-link>
            <nuxt-link
              v-if="isAuthenticated"
              to="/bookmarks"
              class="text-sm font-medium text-gray-300 hover:text-white transition-soft"
              :class="{ 'text-accent-purple': $route.path === '/bookmarks' }"
            >
              Kaydedilenler
            </nuxt-link>
          </nav>

          <!-- Right Actions -->
          <div class="flex items-center gap-4">
            <!-- Search (Desktop) with Dropdown -->
            <div class="hidden lg:block relative" v-click-outside="closeSearchDropdown">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Ara..."
                class="w-64 px-4 py-2 pl-10 text-sm bg-gray-800 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent"
                @input="handleSearchInput"
                @keyup.enter="handleSearch"
                @focus="showSearchDropdown = searchQuery.length >= 2"
              />
              <svg
                v-if="!searchLoading"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <svg
                v-else
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              
              <!-- Search Dropdown -->
              <div
                v-if="showSearchDropdown && searchResults.length > 0"
                class="absolute z-50 w-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-h-96 overflow-y-auto"
              >
                <div class="p-2">
                  <div
                    v-for="article in searchResults"
                    :key="article.id"
                    @click="selectSearchResult(article.id)"
                    class="w-full text-left px-3 py-3 hover:bg-gray-700 rounded transition-soft cursor-pointer border-b border-gray-700 last:border-b-0"
                  >
                    <p class="font-medium text-white mb-1">{{ article.title }}</p>
                    <p class="text-sm text-gray-400 line-clamp-2">{{ article.summary }}</p>
                  </div>
                </div>
              </div>
            </div>

            <template v-if="isAuthenticated && user">
              <!-- Notifications -->
              <button
                @click="showNotifications = !showNotifications"
                class="relative p-2 text-gray-300 hover:text-white transition-soft"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span
                  v-if="unreadNotifications > 0"
                  class="absolute top-0 right-0 w-4 h-4 bg-accent-purple rounded-full text-white text-xs flex items-center justify-center font-bold"
                >
                  {{ unreadNotifications > 9 ? "9+" : unreadNotifications }}
                </span>
              </button>

              <!-- User Menu -->
              <div v-if="user && user.id" class="relative" v-click-outside="closeUserMenu">
                <button
                  @click="showUserMenu = !showUserMenu"
                  class="flex items-center gap-2 hover:opacity-80 transition-soft focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-2 focus:ring-offset-gray-900 rounded-full"
                >
                  <img
                    v-if="user.avatarUrl"
                    :src="user.avatarUrl"
                    :alt="user.displayName || user.username || 'User'"
                    class="w-8 h-8 rounded-full object-cover ring-2 ring-gray-600"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-gradient-shift flex items-center justify-center text-white text-xs font-semibold ring-2 ring-gray-600"
                  >
                    {{ (user.displayName || user.username || "U")[0].toUpperCase() }}
                  </div>
                </button>

                <!-- Dropdown Menu -->
                <div
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-50"
                >
                  <nuxt-link
                    :to="`/users/${user.id}`"
                    @click.native="closeUserMenu"
                    class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-soft"
                  >
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profil</span>
                    </div>
                  </nuxt-link>
                  <button
                    @click="handleLogout"
                    class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-soft flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </div>

              <!-- New Article Button -->
              <nuxt-link
                to="/articles/new"
                class="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-blue text-white rounded-full hover:shadow-lg transition-all duration-300 font-medium text-sm"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Yaz</span>
              </nuxt-link>
            </template>

            <nuxt-link
              v-else
              to="/login"
              class="px-4 py-2 bg-accent-purple text-white rounded-full hover:bg-purple-700 transition-soft font-medium text-sm"
            >
              Giriş Yap
            </nuxt-link>
          </div>
        </div>
      </div>

      <!-- Notification Panel -->
      <NotificationPanel
        :is-open="showNotifications"
        :notifications="notifications"
        :loading="notificationsLoading"
        @close="showNotifications = false"
        @notification-click="handleNotificationClick"
        @mark-all-read="handleMarkAllRead"
      />
    </header>

    <!-- Main Content -->
    <Nuxt />

    <!-- Mobile Bottom Navigation -->
    <nav
      v-if="isAuthenticated && !isLoginPage"
      class="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white bg-opacity-90 backdrop-blur-lg border-t border-gray-200"
    >
      <div class="flex items-center justify-around h-16">
        <nuxt-link
          to="/"
          class="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-white transition-soft"
          :class="{ 'text-accent-purple': $route.path === '/' }"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="text-xs mt-1">Ana Sayfa</span>
        </nuxt-link>

        <nuxt-link
          to="/feed"
          class="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-white transition-soft"
          :class="{ 'text-accent-purple': $route.path === '/feed' }"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span class="text-xs mt-1">Akış</span>
        </nuxt-link>

        <nuxt-link
          to="/articles/new"
          class="flex flex-col items-center justify-center flex-1 text-accent-purple"
        >
          <div class="w-12 h-12 rounded-full bg-gradient-to-r from-accent-purple to-accent-blue flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span class="text-xs mt-1">Yaz</span>
        </nuxt-link>

        <nuxt-link
          to="/bookmarks"
          class="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-white transition-soft"
          :class="{ 'text-accent-purple': $route.path === '/bookmarks' }"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span class="text-xs mt-1">Kaydedilenler</span>
        </nuxt-link>

        <nuxt-link
          v-if="user && user.id"
          :to="`/users/${user.id}`"
          class="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-white transition-soft"
          :class="{ 'text-accent-purple': $route.path && $route.path.startsWith('/users/') }"
        >
          <img
            v-if="user.avatarUrl"
            :src="user.avatarUrl"
            :alt="user.displayName || user.username || 'User'"
            class="w-6 h-6 rounded-full object-cover"
          />
          <div
            v-else
            class="w-6 h-6 rounded-full bg-gradient-shift flex items-center justify-center text-white text-xs font-semibold"
          >
            {{ (user.displayName || user.username || "U")[0].toUpperCase() }}
          </div>
          <span class="text-xs mt-1">Profil</span>
        </nuxt-link>
      </div>
    </nav>

    <!-- Padding for mobile nav -->
    <div v-if="isAuthenticated && !isLoginPage" class="h-16 md:hidden"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Notification, api } from "~/utils/api";

export default Vue.extend({
  name: "DefaultLayout",
  data() {
    return {
      showNotifications: false,
      showUserMenu: false,
      searchQuery: "",
      showSearchDropdown: false,
      searchResults: [] as any[],
      searchLoading: false,
      searchDebounceTimer: null as any,
      notifications: [] as Notification[],
      notificationsLoading: false,
      isMounted: false, // Flag to prevent hydration mismatch
    };
  },
  computed: {
    isAuthenticated(): boolean {
      // During SSR and initial render, return false to match SSR output
      if (!this.isMounted) return false;
      return this.$store.getters["auth/isAuthenticated"];
    },
    user() {
      // During SSR and initial render, return null to match SSR output
      if (!this.isMounted) return null;
      return this.$store.state.auth.user;
    },
    isLoginPage(): boolean {
      // Guard against undefined route.path during SSR
      if (!this.$route || !this.$route.path) return false;
      return this.$route.path === "/login";
    },
    unreadNotifications(): number {
      return this.notifications.filter((n) => !n.readAt).length;
    },
  },
  watch: {
    showNotifications(newVal: boolean) {
      if (newVal && this.isAuthenticated) {
        this.loadNotifications();
      }
    },
  },
  async mounted() {
    // Set mounted flag after hydration to allow user-dependent rendering
    this.isMounted = true;
    if (this.isAuthenticated) {
      await this.loadNotifications();
    }
  },
  methods: {
    closeUserMenu() {
      this.showUserMenu = false;
    },
    closeSearchDropdown() {
      this.showSearchDropdown = false;
    },
    handleSearchInput() {
      // Clear dropdown if query is too short
      if (this.searchQuery.length < 2) {
        this.showSearchDropdown = false;
        this.searchResults = [];
        if (this.searchDebounceTimer) {
          clearTimeout(this.searchDebounceTimer);
          this.searchDebounceTimer = null;
        }
        return;
      }

      // Debounce search requests (300ms)
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }

      this.searchDebounceTimer = setTimeout(async () => {
        await this.loadSearchSuggestions();
      }, 300);
    },
    async loadSearchSuggestions() {
      if (this.searchQuery.length < 2) {
        this.searchResults = [];
        this.showSearchDropdown = false;
        return;
      }

      this.searchLoading = true;
      try {
        const response = await api.getArticles(this.searchQuery, 1, 5);
        this.searchResults = response.items || [];
        this.showSearchDropdown = this.searchResults.length > 0;
      } catch (err: any) {
        console.error("Error loading search suggestions:", err);
        this.searchResults = [];
        this.showSearchDropdown = false;
      } finally {
        this.searchLoading = false;
      }
    },
    selectSearchResult(articleId: string) {
      this.$router.push(`/articles/${articleId}`);
      this.closeSearchDropdown();
      this.searchQuery = "";
    },
    handleSearch() {
      if (this.searchQuery.trim()) {
        this.$router.push(`/search?q=${encodeURIComponent(this.searchQuery.trim())}`);
        this.closeSearchDropdown();
        this.searchQuery = "";
      }
    },
    async handleNotificationClick(notification: Notification) {
      try {
        const payload = JSON.parse(notification.payload);
        if (payload.articleId) {
          this.$router.push(`/articles/${payload.articleId}`);
        }
        this.showNotifications = false;
      } catch {
        // Ignore
      }
    },
    async handleMarkAllRead() {
      try {
        await this.$store.dispatch("feed/markAllAsRead");
        await this.loadNotifications();
      } catch (err) {
        console.error("Failed to mark all as read:", err);
      }
    },
    async loadNotifications() {
      if (!this.isAuthenticated) return;
      this.notificationsLoading = true;
      try {
        const loaded = await api.getNotifications(false);
        this.notifications = loaded;
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        this.notificationsLoading = false;
      }
    },
    async handleLogout() {
      this.closeUserMenu();
      try {
        await this.$store.dispatch("auth/logout");
        this.$router.push("/login");
      } catch (error) {
        console.error("Logout failed:", error);
        // Still redirect to login even if logout API call fails
        this.$router.push("/login");
      }
    },
  },
  directives: {
    "click-outside": {
      bind(el: any, binding: any, vnode: any) {
        el.clickOutsideEvent = (event: Event) => {
          if (!(el === event.target || el.contains(event.target))) {
            vnode.context[binding.expression](event);
          }
        };
        document.addEventListener("click", el.clickOutsideEvent);
      },
      unbind(el: any) {
        document.removeEventListener("click", el.clickOutsideEvent);
      },
    },
  },
});
</script>
