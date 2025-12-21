<template>
  <article
    class="bg-slate-900/60 border border-white/10 rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden cursor-pointer"
    @click="$emit('click')"
  >
    <!-- Category Tag -->
    <div class="px-6 pt-6">
      <span class="inline-block px-3 py-1 bg-gray-700 text-gray-300 text-xs font-semibold rounded-full uppercase">
        <!-- PLACEHOLDER: Category feature not yet implemented -->
        {{ articleCategory || "GENEL" }}
      </span>
    </div>

    <!-- Article Image (Placeholder) -->
    <div class="relative h-48 bg-gradient-to-br from-teal-500 to-blue-600 mt-4">
      <!-- PLACEHOLDER: Article image feature not yet implemented -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-white text-4xl opacity-20">
          <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Author and Read Time -->
      <div class="flex items-center gap-3 mb-4">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
          :class="getAuthorColor(article.author?.displayName || article.author?.username || 'U')"
        >
          {{ (article.author?.displayName || article.author?.username || "U")[0].toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-white font-medium text-sm">
            {{ article.author?.displayName || article.author?.username || "Author" }}
          </p>
          <p class="text-gray-400 text-xs">
            <!-- PLACEHOLDER: Read time calculation not yet implemented -->
            {{ estimatedReadTime }} dk okuma
          </p>
        </div>
      </div>

      <!-- Title -->
      <h3 class="text-xl font-playfair font-bold text-white mb-2 line-clamp-2 leading-snug">
        {{ article.title }}
      </h3>

      <!-- Summary -->
      <p class="text-white/70 text-sm mb-4 line-clamp-3 leading-snug">
        {{ article.summary }}
      </p>

      <!-- Footer: Date, Comments, Actions -->
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <div class="flex items-center gap-4 text-sm text-gray-400">
          <span v-if="article.publishedAt" class="text-xs">
            {{ formatDate(article.publishedAt) }}
          </span>
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {{ article._count?.comments || 0 }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="isAuthenticated"
            @click.stop="handleBookmark"
            class="p-2 text-gray-400 transition-soft"
            :class="{ 'text-purple-400': bookmarkStatus }"
          >
            <svg class="w-5 h-5" :fill="bookmarkStatus ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button
            @click.stop="handleShare"
            class="p-2 text-gray-400 transition-soft"
          >
            <!-- PLACEHOLDER: Share functionality not yet implemented -->
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { Article } from "~/utils/api";

export default Vue.extend({
  name: "LatestArticleCard",
  props: {
    article: {
      type: Object as PropType<Article>,
      required: true,
    },
    isAuthenticated: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    bookmarkStatus(): boolean {
      if (!this.isAuthenticated) return false;
      return this.$store.getters["social/isBookmarked"](this.article.id);
    },
    // PLACEHOLDER: Category feature not yet implemented
    articleCategory(): string {
      // This would come from article.category or article.tags in the future
      return "GENEL";
    },
    // PLACEHOLDER: Read time calculation not yet implemented
    estimatedReadTime(): number {
      // Simple estimation: ~200 words per minute
      const wordCount = (this.article.content || "").split(/\s+/).length;
      const minutes = Math.ceil(wordCount / 200);
      return minutes || 1;
    },
  },
  methods: {
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    getAuthorColor(name: string): string {
      // Generate consistent color based on name
      const colors = [
        "bg-purple-600",
        "bg-red-600",
        "bg-green-600",
        "bg-blue-600",
        "bg-yellow-600",
        "bg-pink-600",
      ];
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
    },
    async handleBookmark() {
      this.$emit("bookmark", this.article.id);
    },
    handleShare() {
      // PLACEHOLDER: Share functionality not yet implemented
      if (navigator.share) {
        navigator.share({
          title: this.article.title,
          text: this.article.summary,
          url: `${window.location.origin}/articles/${this.article.id}`,
        }).catch(() => {
          // User cancelled or error
        });
      } else {
        // Fallback: copy to clipboard
        const url = `${window.location.origin}/articles/${this.article.id}`;
        navigator.clipboard.writeText(url).then(() => {
          alert("Link kopyalandı!");
        });
      }
    },
  },
});
</script>

