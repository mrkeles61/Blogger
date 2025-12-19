<template>
  <div class="min-h-screen bg-gray-50 font-inter">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-playfair font-bold text-gray-900 mb-2">Kaydedilenler</h1>
        <p class="text-gray-600">Beğendiğiniz makaleleri buradan bulabilirsiniz</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ShimmerPlaceholder v-for="n in 6" :key="n" class="h-64 rounded-xl" />
      </div>

      <!-- Empty State -->
      <div v-else-if="bookmarks.length === 0" class="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <p class="text-gray-500 text-lg mb-2">Henüz kayıtlı makale yok</p>
        <p class="text-gray-400 mb-6">Beğendiğiniz makaleleri kaydetmek için makale detay sayfasındaki kaydet butonunu kullanın</p>
        <nuxt-link
          to="/"
          class="inline-block px-6 py-3 bg-gradient-to-r from-accent-orange to-accent-blue text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-semibold"
        >
          Makalelere Göz At
        </nuxt-link>
      </div>

      <!-- Bookmarks Grid -->
      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="bookmark in bookmarks"
          :key="bookmark.id"
          class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
        >
          <ArticleCard
            :article="bookmark.article"
            @click="$router.push(`/articles/${bookmark.article.id}`)"
          />
          <div class="p-4 border-t border-gray-100 flex items-center justify-between">
            <span class="text-sm text-gray-500">
              {{ formatDate(bookmark.createdAt) }} tarihinde kaydedildi
            </span>
            <button
              @click.stop="handleUnbookmark(bookmark.article.id)"
              class="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-soft"
              title="Kaydı kaldır"
              aria-label="Kaydı kaldır"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { api, Bookmark } from "~/utils/api";

export default Vue.extend({
  name: "BookmarksPage",
  middleware: "auth",
  data() {
    return {
      bookmarks: [] as Bookmark[],
      loading: true,
    };
  },
  async fetch() {
    await this.loadBookmarks();
  },
  methods: {
    async loadBookmarks() {
      this.loading = true;
      try {
        this.bookmarks = await api.getBookmarks();
        // Update store with bookmark statuses
        for (const bookmark of this.bookmarks) {
          this.$store.commit("social/setBookmarked", {
            articleId: bookmark.article.id,
            bookmarked: true,
          });
        }
      } catch (err: any) {
        console.error("Failed to load bookmarks:", err);
      } finally {
        this.loading = false;
      }
    },
    async handleUnbookmark(articleId: string) {
      if (!confirm("Bu makaleyi kayıtlılarınızdan kaldırmak istediğinizden emin misiniz?")) {
        return;
      }

      try {
        await api.unbookmarkArticle(articleId);
        await this.$store.dispatch("social/toggleBookmark", articleId);
        await this.loadBookmarks();
      } catch (err: any) {
        alert(`Kayıt kaldırılamadı: ${err.message}`);
      }
    },
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
});
</script>
