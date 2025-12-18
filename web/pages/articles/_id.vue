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
        <h1 class="text-3xl font-bold text-gray-900">Article Detail</h1>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500">Loading article...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <p class="text-red-800">{{ error }}</p>
        <nuxt-link
          to="/"
          class="inline-block mt-4 text-blue-600 hover:text-blue-700"
        >
          ← Back to articles
        </nuxt-link>
      </div>

      <div v-else-if="article" class="space-y-6">
        <!-- Article Content -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="mb-4">
            <span
              v-if="article.publishedAt"
              class="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              Published {{ formatDate(article.publishedAt) }}
            </span>
            <span
              v-else
              class="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
            >
              Draft
            </span>
          </div>

          <h2 class="text-3xl font-bold mb-4">{{ article.title }}</h2>
          <p class="text-xl text-gray-600 mb-6">{{ article.summary }}</p>

          <div class="prose max-w-none mb-8 whitespace-pre-wrap">
            {{ article.content }}
          </div>

          <!-- Author Card -->
          <div v-if="article.author" class="border-t pt-6 mt-6">
            <div class="flex items-center gap-4">
              <img
                v-if="article.author.avatarUrl"
                :src="article.author.avatarUrl"
                :alt="article.author.displayName || article.author.username"
                class="w-16 h-16 rounded-full object-cover"
              />
              <div
                v-else
                class="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600"
              >
                {{ (article.author.displayName || article.author.username || "U")[0].toUpperCase() }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <nuxt-link
                    :to="`/users/${article.author.id}`"
                    class="font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {{ article.author.displayName || article.author.username || "User" }}
                  </nuxt-link>
                  <span
                    v-if="article.author.isVerified"
                    class="text-blue-600"
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
                <p v-if="article.author.headline" class="text-sm text-gray-600">
                  {{ article.author.headline }}
                </p>
                <FollowButton
                  :user-id="article.author.id"
                  :is-own-profile="article.author.id === currentUserId"
                  class="mt-2"
                />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="border-t pt-6 mt-6 flex justify-between items-center">
            <div class="text-sm text-gray-500">
              <p>Created: {{ formatDateTime(article.createdAt) }}</p>
              <p>Updated: {{ formatDateTime(article.updatedAt) }}</p>
            </div>
            <div v-if="canEdit" class="flex gap-4">
              <nuxt-link
                :to="`/articles/${article.id}/edit`"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Edit
              </nuxt-link>
              <button
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                @click="handleDelete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Social Actions -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center gap-4 mb-6">
            <LikeButton
              :article-id="article.id"
              :like-count="article._count?.likes || 0"
            />
            <button
              @click="handleBookmark"
              :disabled="bookmarkLoading"
              class="flex items-center gap-2 px-4 py-2 rounded-lg transition"
              :class="
                isBookmarked
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
            >
              <svg
                class="w-5 h-5"
                :fill="isBookmarked ? 'currentColor' : 'none'"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              <span>Bookmark</span>
            </button>
            <div class="text-sm text-gray-600">
              {{ article._count?.comments || 0 }} comments
            </div>
          </div>

          <!-- Comments Section -->
          <div>
            <h3 class="text-xl font-semibold mb-4">Comments</h3>
            <CommentList :article-id="article.id" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import { api, Article } from "~/utils/api";
import LikeButton from "~/components/LikeButton.vue";
import FollowButton from "~/components/FollowButton.vue";
import CommentList from "~/components/CommentList.vue";

@Component({
  components: {
    LikeButton,
    FollowButton,
    CommentList,
  },
})
export default class ArticleDetailPage extends Vue {
  article: Article | null = null;
  loading = true;
  error: string | null = null;
  bookmarkLoading = false;

  async fetch() {
    const id = this.$route.params.id;
    await this.loadArticle(id);
  }

  async loadArticle(id: string) {
    this.loading = true;
    this.error = null;
    try {
      this.article = await api.getArticle(id);
      if (this.isAuthenticated) {
        await this.$store.dispatch("social/checkBookmarkStatus", id);
      }
    } catch (err: any) {
      this.error = err.message || "Failed to load article";
      if (err.status === 404) {
        this.error = "Article not found";
      }
      console.error("Error loading article:", err);
    } finally {
      this.loading = false;
    }
  }

  async handleDelete() {
    if (!this.article) return;

    if (!confirm("Are you sure you want to delete this article?")) {
      return;
    }

    try {
      await api.deleteArticle(this.article.id);
      alert("Article deleted successfully");
      this.$router.push("/");
    } catch (err: any) {
      alert(`Failed to delete article: ${err.message}`);
      console.error("Error deleting article:", err);
    }
  }

  async handleBookmark() {
    if (!this.article || !this.isAuthenticated) {
      this.$router.push("/login");
      return;
    }

    this.bookmarkLoading = true;
    try {
      await this.$store.dispatch("social/toggleBookmark", this.article.id);
    } catch (err: any) {
      alert(`Failed to ${this.isBookmarked ? "unbookmark" : "bookmark"}: ${err.message}`);
    } finally {
      this.bookmarkLoading = false;
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

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  get isAuthenticated() {
    return this.$store.getters["auth/isAuthenticated"];
  }

  get currentUserId() {
    return this.$store.state.auth.user?.id;
  }

  get canEdit() {
    if (!this.article || !this.isAuthenticated) return false;
    const isAdmin = this.$store.getters["auth/isAdmin"];
    return this.article.authorId === this.currentUserId || isAdmin;
  }

  get isBookmarked() {
    return this.article
      ? this.$store.getters["social/isBookmarked"](this.article.id)
      : false;
  }
}
</script>
