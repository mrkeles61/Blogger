<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nuxt-link
          to="/"
          class="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to articles
        </nuxt-link>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500">Loading profile...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-else-if="profile" class="space-y-6">
        <!-- Profile Header -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-start gap-6">
            <img
              v-if="profile.avatarUrl"
              :src="profile.avatarUrl"
              :alt="profile.displayName || profile.username"
              class="w-24 h-24 rounded-full object-cover"
            />
            <div
              v-else
              class="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600"
            >
              {{ (profile.displayName || profile.username || "U")[0].toUpperCase() }}
            </div>

            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h1 class="text-3xl font-bold text-gray-900">
                  {{ profile.displayName || profile.username || "User" }}
                </h1>
                <span
                  v-if="profile.isVerified"
                  class="inline-flex items-center text-blue-600"
                  title="Verified"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
              </div>

              <p v-if="profile.username" class="text-gray-600 mb-2">@{{ profile.username }}</p>
              <p v-if="profile.headline" class="text-lg text-gray-700 mb-2">
                {{ profile.headline }}
              </p>
              <p v-if="profile.bio" class="text-gray-600 mb-4">{{ profile.bio }}</p>

              <div class="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
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
                  class="flex items-center gap-1 text-blue-600 hover:text-blue-700"
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

              <div class="flex items-center gap-6 mb-4">
                <div>
                  <span class="font-semibold">{{ profile.followersCount || 0 }}</span>
                  <span class="text-gray-600 ml-1">Followers</span>
                </div>
                <div>
                  <span class="font-semibold">{{ profile.followingCount || 0 }}</span>
                  <span class="text-gray-600 ml-1">Following</span>
                </div>
                <div>
                  <span class="font-semibold">{{ profile.articlesCount || 0 }}</span>
                  <span class="text-gray-600 ml-1">Articles</span>
                </div>
              </div>

              <div v-if="isAuthenticated && profile.id !== currentUserId" class="flex gap-2">
                <button
                  @click="handleFollow"
                  :disabled="followLoading"
                  class="px-4 py-2 rounded-lg transition"
                  :class="
                    isFollowingUser
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  "
                >
                  {{ isFollowingUser ? "Following" : "Follow" }}
                </button>
                <button
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Message
                </button>
              </div>

              <nuxt-link
                v-if="isOwnProfile"
                :to="`/users/${profile.id}/edit`"
                class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Edit Profile
              </nuxt-link>
            </div>
          </div>
        </div>

        <!-- User Articles -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold mb-4">Articles</h2>
          <div v-if="articlesLoading" class="text-center py-8">
            <p class="text-gray-500">Loading articles...</p>
          </div>
          <div v-else-if="articles.length === 0" class="text-center py-8">
            <p class="text-gray-500">No articles yet</p>
          </div>
          <div v-else class="space-y-4">
            <article
              v-for="article in articles"
              :key="article.id"
              class="border-b border-gray-200 pb-4 last:border-0"
            >
              <h3 class="text-xl font-semibold mb-2">
                <nuxt-link
                  :to="`/articles/${article.id}`"
                  class="text-gray-900 hover:text-blue-600"
                >
                  {{ article.title }}
                </nuxt-link>
              </h3>
              <p class="text-gray-600 mb-2">{{ article.summary }}</p>
              <div class="flex items-center gap-4 text-sm text-gray-500">
                <span v-if="article.publishedAt">
                  {{ formatDate(article.publishedAt) }}
                </span>
                <span v-else class="text-gray-400">Draft</span>
                <span v-if="article._count">
                  {{ article._count.likes || 0 }} likes
                </span>
                <span v-if="article._count">
                  {{ article._count.comments || 0 }} comments
                </span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import { api, User, Article } from "~/utils/api";

@Component
export default class UserProfilePage extends Vue {
  profile: User | null = null;
  articles: Article[] = [];
  loading = true;
  articlesLoading = false;
  error: string | null = null;
  followLoading = false;

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
      this.error = err.message || "Failed to load profile";
      if (err.status === 404) {
        this.error = "User not found";
      }
    } finally {
      this.loading = false;
    }
  }

  async loadArticles(idOrUsername: string) {
    this.articlesLoading = true;
    try {
      this.articles = await api.getUserArticles(idOrUsername);
    } catch (err: any) {
      console.error("Failed to load articles:", err);
    } finally {
      this.articlesLoading = false;
    }
  }

  async handleFollow() {
    if (!this.profile || !this.isAuthenticated) return;

    this.followLoading = true;
    try {
      await this.$store.dispatch("social/toggleFollow", this.profile.id);
      // Reload profile to update counts
      await this.loadProfile(this.$route.params.id);
    } catch (err: any) {
      alert(`Failed to ${this.isFollowingUser ? "unfollow" : "follow"}: ${err.message}`);
    } finally {
      this.followLoading = false;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  get isFollowingUser() {
    return this.profile
      ? this.$store.getters["social/isFollowingUser"](this.profile.id)
      : false;
  }
}
</script>

