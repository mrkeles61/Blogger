<template>
  <div class="min-h-screen bg-gray-900 font-inter">
    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ShimmerPlaceholder class="h-96 rounded-xl mb-6" />
      <ShimmerPlaceholder class="h-64 rounded-xl" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-red-900 bg-opacity-20 border border-red-500 rounded-xl p-6 text-center">
        <p class="text-red-300 font-medium mb-4">{{ error }}</p>
        <nuxt-link
          to="/"
          class="inline-block px-6 py-3 bg-accent-purple text-white rounded-full font-semibold hover:bg-opacity-90 transition-soft"
        >
          Ana Sayfaya Dön
        </nuxt-link>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profile" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Profile Header -->
      <div class="bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 mb-6">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <img
              v-if="profile.avatarUrl"
              :src="profile.avatarUrl"
              :alt="profile.displayName || profile.username"
              class="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
            />
            <div
              v-else
              class="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-accent-purple to-accent-blue flex items-center justify-center text-3xl md:text-4xl font-bold text-white"
            >
              {{ (profile.displayName || profile.username || "U")[0].toUpperCase() }}
            </div>
          </div>

          <!-- Profile Info -->
          <div class="flex-1 min-w-0 w-full">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <h1 class="text-2xl md:text-3xl font-playfair font-bold text-white">
                    {{ profile.displayName || profile.username || "User" }}
                  </h1>
                  <span
                    v-if="profile.isVerified"
                    class="text-accent-blue"
                    title="Doğrulanmış"
                  >
                    <svg class="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
                </div>

                <p v-if="profile.username" class="text-lg text-gray-400 mb-3">@{{ profile.username }}</p>

                <!-- Role Tags -->
                <div v-if="profile.role" class="flex flex-wrap gap-2 mb-4">
                  <span
                    v-if="profile.role === 'Admin'"
                    class="px-3 py-1 bg-blue-900 bg-opacity-30 text-blue-300 rounded-lg text-sm font-medium border border-blue-700"
                  >
                    Blog Administrator
                  </span>
                  <span
                    v-if="profile.role === 'Admin'"
                    class="px-3 py-1 bg-purple-900 bg-opacity-30 text-purple-300 rounded-lg text-sm font-medium border border-purple-700"
                  >
                    System Administrator
                  </span>
                  <span
                    v-if="profile.role === 'Editor'"
                    class="px-3 py-1 bg-green-900 bg-opacity-30 text-green-300 rounded-lg text-sm font-medium border border-green-700"
                  >
                    Editor
                  </span>
                  <span
                    v-if="profile.role === 'Viewer'"
                    class="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium border border-gray-600"
                  >
                    Viewer
                  </span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-3">
                <FollowButton
                  v-if="!isOwnProfile && isAuthenticated"
                  :user-id="profile.id"
                  :is-own-profile="false"
                />
                <nuxt-link
                  v-if="isOwnProfile"
                  :to="`/users/${profile.id}/edit`"
                  class="px-6 py-3 bg-accent-purple text-white rounded-lg hover:bg-purple-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-semibold whitespace-nowrap"
                >
                  Profil Düzenle
                </nuxt-link>
              </div>
            </div>

            <!-- Stats Row -->
            <div class="flex items-center gap-6 mb-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-white">{{ profile.followersCount || 0 }}</div>
                <div class="text-sm text-gray-400">Takipçi</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-white">{{ profile.followingCount || 0 }}</div>
                <div class="text-sm text-gray-400">Takip Edilen</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-white">{{ profile.articlesCount || 0 }}</div>
                <div class="text-sm text-gray-400">Makale</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-white">{{ profile.commentsCount || 0 }}</div>
                <div class="text-sm text-gray-400">Yorum</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-gray-800 rounded-xl shadow-sm">
        <div class="border-b border-gray-700">
          <nav class="flex -mb-px">
            <button
              @click="activeTab = 'posts'"
              :class="[
                'px-6 py-4 text-sm font-medium border-b-2 transition-soft',
                activeTab === 'posts'
                  ? 'border-accent-purple text-accent-purple'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              ]"
            >
              Gönderiler
            </button>
            <button
              @click="activeTab = 'activity'"
              :class="[
                'px-6 py-4 text-sm font-medium border-b-2 transition-soft',
                activeTab === 'activity'
                  ? 'border-accent-purple text-accent-purple'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              ]"
            >
              Etkinlik
            </button>
            <button
              v-if="isOwnProfile"
              @click="activeTab = 'bookmarks'"
              :class="[
                'px-6 py-4 text-sm font-medium border-b-2 transition-soft',
                activeTab === 'bookmarks'
                  ? 'border-accent-purple text-accent-purple'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              ]"
            >
              Kaydedilenler
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Posts Tab -->
          <div v-if="activeTab === 'posts'">
            <div v-if="articlesLoading" class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <ShimmerPlaceholder v-for="n in 6" :key="n" class="h-64" />
            </div>
            <div v-else-if="articles.length === 0" class="text-center py-12">
              <p class="text-gray-400 text-lg mb-2">Henüz makale yok</p>
              <p class="text-gray-500">İlk makalenizi yazmaya başlayın!</p>
            </div>
            <div v-else class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <ArticleCard
                v-for="article in articles"
                :key="article.id"
                :article="article"
                :show-bookmark="isAuthenticated"
                :is-bookmarked="isBookmarked(article.id)"
                @click="$router.push(`/articles/${article.id}`)"
                @bookmark="handleBookmark(article.id)"
              />
            </div>
          </div>

          <!-- Activity Tab -->
          <div v-if="activeTab === 'activity'">
            <div v-if="activityLoading" class="space-y-4">
              <ShimmerPlaceholder v-for="n in 5" :key="n" class="h-24" />
            </div>
            <div v-else-if="activities.length === 0" class="text-center py-12">
              <p class="text-gray-400 text-lg">Henüz etkinlik yok</p>
            </div>
            <div v-else class="space-y-6">
              <ActivityItem
                v-for="activity in activities"
                :key="activity.id"
                :activity="activity"
                :show-article-link="true"
              />
            </div>
          </div>

          <!-- Bookmarks Tab -->
          <div v-if="activeTab === 'bookmarks' && isOwnProfile">
            <div v-if="bookmarksLoading" class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <ShimmerPlaceholder v-for="n in 6" :key="n" class="h-64" />
            </div>
            <div v-else-if="bookmarks.length === 0" class="text-center py-12">
              <p class="text-gray-400 text-lg mb-2">Henüz kayıtlı makale yok</p>
              <p class="text-gray-500">Beğendiğiniz makaleleri kaydedin!</p>
            </div>
            <div v-else class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <ArticleCard
                v-for="bookmark in bookmarks"
                :key="bookmark.id"
                :article="bookmark.article"
                :show-bookmark="isAuthenticated"
                :is-bookmarked="true"
                @click="$router.push(`/articles/${bookmark.article.id}`)"
                @bookmark="handleBookmark(bookmark.article.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "nuxt-property-decorator";
import { api, User, Article, ActivityLog, Bookmark } from "~/utils/api";
import FollowButton from "~/components/FollowButton.vue";
import ArticleCard from "~/components/ArticleCard.vue";
import ActivityItem from "~/components/ActivityItem.vue";
import ShimmerPlaceholder from "~/components/ShimmerPlaceholder.vue";

type Tab = "posts" | "activity" | "bookmarks";

@Component({
  components: {
    FollowButton,
    ArticleCard,
    ActivityItem,
    ShimmerPlaceholder,
  },
})
export default class UserProfilePage extends Vue {
  profile: User | null = null;
  articles: Article[] = [];
  activities: ActivityLog[] = [];
  bookmarks: Bookmark[] = [];
  loading = true;
  articlesLoading = false;
  activityLoading = false;
  bookmarksLoading = false;
  error: string | null = null;
  activeTab: Tab = "posts";

  async fetch() {
    // Only fetch on client-side to ensure auth state is restored
    if (process.client) {
      const id = this.$route.params.id;
      await this.loadProfile(id);
      await this.loadArticles(id);
    }
  }

  async mounted() {
    // Ensure data is loaded on client-side even if fetch didn't run
    if (process.client && !this.profile) {
      const id = this.$route.params.id;
      await this.loadProfile(id);
      await this.loadArticles(id);
    }
  }

  async loadProfile(idOrUsername: string) {
    this.loading = true;
    this.error = null;
    try {
      this.profile = await api.getUser(idOrUsername);
      if (this.isAuthenticated && this.profile.id !== this.currentUserId) {
        await this.$store.dispatch("social/checkFollowStatus", this.profile.id);
      }
    } catch (err: any) {
      this.error = err.message || "Profil yüklenemedi";
      if (err.status === 404) {
        this.error = "Kullanıcı bulunamadı";
      }
    } finally {
      this.loading = false;
    }
  }

  async loadArticles(idOrUsername: string) {
    this.articlesLoading = true;
    try {
      // Check if viewing own profile by comparing profile ID with current user ID
      // Wait for auth state to be restored if needed
      let includeDrafts = false;
      if (process.client) {
        // Wait for auth plugin to restore session (max 2 seconds)
        let attempts = 0;
        while (attempts < 20 && !this.$store.state.auth.user && this.$store.state.auth.loading) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        // Check if the profile we're viewing belongs to the current user
        const currentUser = this.$store.state.auth.user;
        if (currentUser && this.profile && currentUser.id === this.profile.id) {
          includeDrafts = true;
        }
      }
      this.articles = await api.getUserArticles(idOrUsername, includeDrafts);
    } catch (err: any) {
      console.error("Failed to load articles:", err);
      // Don't clear articles on error, just log it
      // If it's an auth error, it might be because session expired
      if (err.status === 401 || err.status === 403) {
        console.warn("Auth error loading articles - session may have expired");
      }
    } finally {
      this.articlesLoading = false;
    }
  }

  async loadActivity() {
    if (this.activityLoading) return;
    this.activityLoading = true;
    try {
      // Load user's activity feed - would need API endpoint
      // For now, using placeholder
      this.activities = [];
    } catch (err: any) {
      console.error("Failed to load activity:", err);
    } finally {
      this.activityLoading = false;
    }
  }

  async loadBookmarks() {
    if (this.bookmarksLoading || !this.isOwnProfile) return;
    this.bookmarksLoading = true;
    try {
      this.bookmarks = await api.getBookmarks();
    } catch (err: any) {
      console.error("Failed to load bookmarks:", err);
    } finally {
      this.bookmarksLoading = false;
    }
  }

  @Watch("activeTab")
  onActiveTabChange(newTab: Tab) {
    if (newTab === "activity" && this.activities.length === 0) {
      this.loadActivity();
    } else if (newTab === "bookmarks" && this.bookmarks.length === 0) {
      this.loadBookmarks();
    }
  }

  get isAuthenticated() {
    return this.$store.getters["auth/isAuthenticated"];
  }

  get currentUserId() {
    return this.$store.state.auth.user?.id;
  }

  get isOwnProfile() {
    return this.isAuthenticated && this.profile?.id === this.currentUserId;
  }

  isBookmarked(articleId: string): boolean {
    return (this.$store.state as any).social?.bookmarks?.[articleId] || false;
  }

  async handleBookmark(articleId: string) {
    try {
      await this.$store.dispatch("social/toggleBookmark", articleId);
    } catch (err: any) {
      console.error("Failed to toggle bookmark:", err);
    }
  }
}
</script>
