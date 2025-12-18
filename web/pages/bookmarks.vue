<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-3xl font-bold text-gray-900">My Bookmarks</h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500">Loading bookmarks...</p>
      </div>

      <div v-else-if="bookmarks.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
        <p class="text-gray-500 text-lg mb-4">No bookmarks yet</p>
        <p class="text-gray-400">Save articles you want to read later by clicking the bookmark button</p>
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="bookmark in bookmarks"
          :key="bookmark.id"
          class="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
        >
          <div class="p-6">
            <div class="flex justify-between items-start mb-2">
              <h2 class="text-xl font-semibold flex-1">
                <nuxt-link
                  :to="`/articles/${bookmark.article.id}`"
                  class="text-gray-900 hover:text-blue-600"
                >
                  {{ bookmark.article.title }}
                </nuxt-link>
              </h2>
              <button
                @click="handleUnbookmark(bookmark.article.id)"
                class="text-red-600 hover:text-red-700 ml-2"
                title="Remove bookmark"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <p class="text-gray-600 mb-4 line-clamp-3">{{ bookmark.article.summary }}</p>

            <div v-if="bookmark.article.author" class="flex items-center gap-2 mb-4">
              <img
                v-if="bookmark.article.author.avatarUrl"
                :src="bookmark.article.author.avatarUrl"
                :alt="bookmark.article.author.displayName || bookmark.article.author.username"
                class="w-6 h-6 rounded-full object-cover"
              />
              <nuxt-link
                :to="`/users/${bookmark.article.author.id}`"
                class="text-sm text-gray-600 hover:text-blue-600"
              >
                {{ bookmark.article.author.displayName || bookmark.article.author.username }}
              </nuxt-link>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500">
              <span v-if="bookmark.article.publishedAt">
                {{ formatDate(bookmark.article.publishedAt) }}
              </span>
              <span v-else class="text-gray-400">Draft</span>
              <div class="flex gap-3">
                <span v-if="bookmark.article._count">
                  {{ bookmark.article._count.likes || 0 }} likes
                </span>
                <span v-if="bookmark.article._count">
                  {{ bookmark.article._count.comments || 0 }} comments
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import { api, Bookmark } from "~/utils/api";

@Component({
  middleware: "auth",
})
export default class BookmarksPage extends Vue {
  bookmarks: Bookmark[] = [];
  loading = true;

  async fetch() {
    await this.loadBookmarks();
  }

  async loadBookmarks() {
    this.loading = true;
    try {
      this.bookmarks = await api.getBookmarks();
    } catch (err: any) {
      console.error("Failed to load bookmarks:", err);
    } finally {
      this.loading = false;
    }
  }

  async handleUnbookmark(articleId: string) {
    try {
      await api.unbookmarkArticle(articleId);
      await this.loadBookmarks();
    } catch (err: any) {
      alert(`Failed to remove bookmark: ${err.message}`);
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
}
</script>

