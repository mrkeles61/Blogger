<template>
  <article
    class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
    @click="$emit('click')"
  >
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          <img
            v-if="article.author?.avatarUrl"
            :src="article.author.avatarUrl"
            :alt="article.author.displayName || article.author.username"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div
            v-else
            class="w-10 h-10 rounded-full bg-gradient-shift flex items-center justify-center text-white text-sm font-semibold"
          >
            {{ (article.author?.displayName || article.author?.username || "A")[0].toUpperCase() }}
          </div>
          <div>
            <p class="font-semibold text-gray-900 text-sm">
              {{ article.author?.displayName || article.author?.username || "Author" }}
            </p>
            <div class="flex items-center gap-2 mt-1">
              <span
                v-if="showStatusBadges && article.status === 'Draft'"
                class="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full"
              >
                Taslak
              </span>
              <span
                v-if="showStatusBadges && article.status === 'Scheduled'"
                class="text-xs px-2 py-0.5 bg-blue-200 text-blue-700 rounded-full"
              >
                Zamanlanmış
              </span>
              <span
                v-if="showStatusBadges && article.isFeatured"
                class="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-700 rounded-full"
              >
                Öne Çıkan
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Title -->
      <h3 class="text-xl font-playfair font-bold text-gray-900 mb-2 group-hover:text-accent-orange transition-soft">
        {{ article.title }}
      </h3>

      <!-- Summary -->
      <p class="text-gray-600 text-sm line-clamp-2 mb-4">
        {{ article.summary }}
      </p>

      <!-- Stats Row -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-100">
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {{ article._count?.likes || 0 }}
          </span>
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {{ article._count?.comments || 0 }}
          </span>
          <span v-if="article.publishedAt" class="text-xs">
            {{ formatDate(article.publishedAt) }}
          </span>
        </div>
        <button
          v-if="showBookmark && $store.getters['auth/isAuthenticated']"
          @click.stop="handleBookmark"
          class="text-gray-400 hover:text-accent-orange transition-soft"
          :class="{ 'text-accent-orange': bookmarkStatus }"
        >
          <svg class="w-5 h-5" :fill="bookmarkStatus ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { Article } from "~/utils/api";

export default Vue.extend({
  name: "ArticleCard",
  props: {
    article: {
      type: Object as PropType<Article>,
      required: true,
    },
    showBookmark: {
      type: Boolean,
      default: true,
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    showStatusBadges: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    bookmarkStatus(): boolean {
      // If isBookmarked prop is explicitly provided, use it
      // Otherwise, check from store if authenticated
      if (this.isBookmarked !== false || !this.$store.getters["auth/isAuthenticated"]) {
        return this.isBookmarked;
      }
      return this.$store.getters["social/isBookmarked"](this.article.id);
    },
  },
  methods: {
    async handleBookmark() {
      try {
        await this.$store.dispatch("social/toggleBookmark", this.article.id);
        this.$emit("bookmark", this.article.id);
      } catch (err: any) {
        console.error("Failed to toggle bookmark:", err);
      }
    },
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffDays < 1) return "Today";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    },
  },
});
</script>
