<template>
  <article
    class="bg-slate-900/60 border border-white/10 rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden cursor-pointer"
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
            <p class="font-semibold text-white text-sm">
              {{ article.author?.displayName || article.author?.username || "Author" }}
            </p>
            <div class="flex items-center gap-2 mt-1">
              <span
                v-if="showStatusBadges && article.status === 'Draft'"
                class="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full"
              >
                Taslak
              </span>
              <span
                v-if="showStatusBadges && article.status === 'Scheduled'"
                class="text-xs px-2 py-0.5 bg-blue-700 text-blue-300 rounded-full"
              >
                Zamanlanmış
              </span>
              <span
                v-if="showStatusBadges && article.isFeatured"
                class="text-xs px-2 py-0.5 bg-yellow-700 text-yellow-300 rounded-full"
              >
                Öne Çıkan
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Title -->
      <h3 class="text-xl font-playfair font-bold text-white mb-2 line-clamp-2 leading-snug">
        {{ article.title }}
      </h3>

      <!-- Summary -->
      <p class="text-white/70 text-sm line-clamp-3 mb-4 leading-snug">
        {{ article.summary }}
      </p>

      <!-- Stats Row -->
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <div class="flex items-center gap-4 text-sm text-gray-400">
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
          class="text-gray-400 transition-soft"
          :class="{ 'text-purple-400': bookmarkStatus }"
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
      // If isBookmarked prop is explicitly provided (not undefined), use it
      // Otherwise, check from store (populated on auth restore)
      if (this.isBookmarked !== undefined) {
        return this.isBookmarked;
      }
      // Use store state (loaded on auth restore)
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
      return date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
      });
    },
  },
});
</script>
