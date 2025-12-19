<template>
  <div class="min-h-screen bg-gray-50 font-inter">
    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ShimmerPlaceholder class="h-96 rounded-xl mb-6" />
      <ShimmerPlaceholder class="h-64 rounded-xl" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-800 font-medium mb-4">{{ error }}</p>
        <nuxt-link
          to="/"
          class="inline-block px-6 py-3 bg-accent-orange text-white rounded-full font-semibold hover:bg-opacity-90 transition-soft"
        >
          Ana Sayfaya Dön
        </nuxt-link>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profile">
      <!-- Cover Image Section -->
      <div class="relative h-64 md:h-80 bg-gradient-to-r from-accent-orange to-accent-blue">
        <div class="absolute inset-0 bg-black bg-opacity-20"></div>
        <!-- Placeholder for cover image - can be extended later -->
      </div>

      <!-- Profile Header -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
            <!-- Avatar -->
            <div class="flex-shrink-0 -mt-24 md:-mt-20">
              <img
                v-if="profile.avatarUrl"
                :src="profile.avatarUrl"
                :alt="profile.displayName || profile.username"
                class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover ring-8 ring-white shadow-lg"
              />
              <div
                v-else
                class="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-accent-orange to-accent-blue flex items-center justify-center text-4xl md:text-5xl font-bold text-white ring-8 ring-white shadow-lg"
              >
                {{ (profile.displayName || profile.username || "U")[0].toUpperCase() }}
              </div>
            </div>

            <!-- Profile Info -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <h1 class="text-3xl md:text-4xl font-playfair font-bold text-gray-900">
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

              <p v-if="profile.username" class="text-lg text-gray-600 mb-2">@{{ profile.username }}</p>
              <p v-if="profile.headline" class="text-xl text-gray-700 mb-3 font-medium">
                {{ profile.headline }}
              </p>
              <p v-if="profile.bio" class="text-gray-600 mb-4">{{ profile.bio }}</p>

              <!-- Location & Website -->
              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <span v-if="profile.location" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {{ profile.location }}
                </span>
                <a
                  v-if="profile.website"
                  :href="profile.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1 text-accent-blue hover:text-accent-orange transition-soft"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Website
                </a>
              </div>

              <!-- Stats Row -->
              <div class="flex items-center gap-6 mb-6">
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">{{ profile.followersCount || 0 }}</div>
                  <div class="text-sm text-gray-600">Takipçi</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">{{ profile.followingCount || 0 }}</div>
                  <div class="text-sm text-gray-600">Takip Edilen</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">{{ profile.articlesCount || 0 }}</div>
                  <div class="text-sm text-gray-600">Makale</div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-wrap items-center gap-3">
                <FollowButton
                  v-if="!isOwnProfile"
                  :user-id="profile.id"
                  :is-own-profile="false"
                />
                <button
                  v-if="!isOwnProfile"
                  class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-soft font-medium"
                  disabled
                >
                  Mesaj
                </button>
                <button
                  v-if="!isOwnProfile"
                  class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-soft font-medium"
                  disabled
                >
                  Bildir
                </button>
                <nuxt-link
                  v-if="isOwnProfile"
                  :to="`/users/${profile.id}/edit`"
                  class="px-6 py-3 bg-gradient-to-r from-accent-orange to-accent-blue text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-semibold"
                >
                  Profili Düzenle
                </nuxt-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="mt-6 bg-white rounded-xl shadow-sm">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px">
              <button
                @click="activeTab = 'posts'"
                :class="[
                  'px-6 py-4 text-sm font-medium border-b-2 transition-soft',
                  activeTab === 'posts'
                    ? 'border-accent-orange text-accent-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                Gönderiler
              </button>
              <button
                @click="activeTab = 'activity'"
                :class="[
                  'px-6 py-4 text-sm font-medium border-b-2 transition-soft',
                  activeTab === 'activity'
                    ? 'border-accent-orange text-accent-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                    ? 'border-accent-orange text-accent-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
              <div v-if="articlesLoading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ShimmerPlaceholder v-for="n in 6" :key="n" class="h-64" />
              </div>
              <div v-else-if="articles.length === 0" class="text-center py-12">
                <p class="text-gray-500 text-lg mb-2">Henüz makale yok</p>
                <p class="text-gray-400">İlk makalenizi yazmaya başlayın!</p>
              </div>
              <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ArticleCard
                  v-for="article in articles"
                  :key="article.id"
                  :article="article"
                  @click="$router.push(`/articles/${article.id}`)"
                />
              </div>
            </div>

            <!-- Activity Tab -->
            <div v-if="activeTab === 'activity'">
              <div v-if="activityLoading" class="space-y-4">
                <ShimmerPlaceholder v-for="n in 5" :key="n" class="h-24" />
              </div>
              <div v-else-if="activities.length === 0" class="text-center py-12">
                <p class="text-gray-500 text-lg">Henüz etkinlik yok</p>
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
              <div v-if="bookmarksLoading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ShimmerPlaceholder v-for="n in 6" :key="n" class="h-64" />
              </div>
              <div v-else-if="bookmarks.length === 0" class="text-center py-12">
                <p class="text-gray-500 text-lg mb-2">Henüz kayıtlı makale yok</p>
                <p class="text-gray-400">Beğendiğiniz makaleleri kaydedin!</p>
              </div>
              <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ArticleCard
                  v-for="bookmark in bookmarks"
                  :key="bookmark.id"
                  :article="bookmark.article"
                  @click="$router.push(`/articles/${bookmark.article.id}`)"
                />
              </div>
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
    const id = this.$route.params.id;
    await this.loadProfile(id);
    await this.loadArticles(id);
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
      // Include drafts if viewing own profile
      const includeDrafts = this.isOwnProfile;
      this.articles = await api.getUserArticles(idOrUsername, includeDrafts);
    } catch (err: any) {
      console.error("Failed to load articles:", err);
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
}
</script>
