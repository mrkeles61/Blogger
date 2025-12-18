<template>
  <article
    class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer hover-scale-sm border border-transparent hover:border-accent-orange"
    @click="$emit('click')"
  >
    <div class="p-6">
      <!-- Author Header -->
      <div class="flex items-center gap-3 mb-4">
        <img
          v-if="article.author?.avatarUrl"
          :src="article.author.avatarUrl"
          :alt="article.author.displayName || article.author.username"
          class="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-accent-orange transition-soft"
        />
        <div
          v-else
          class="w-10 h-10 rounded-full bg-gradient-shift flex items-center justify-center text-white font-semibold ring-2 ring-gray-200 group-hover:ring-accent-orange transition-soft"
        >
          {{ (article.author?.displayName || article.author?.username || 'U')[0].toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="font-semibold text-gray-900 truncate">
              {{ article.author?.displayName || article.author?.username || 'User' }}
            </p>
            <span
              v-if="article.author?.isVerified"
              class="text-accent-blue"
              title="Verified"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </div>
          <p v-if="article.author?.headline" class="text-xs text-gray-500 truncate">
            {{ article.author.headline }}
          </p>
        </div>
      </div>

      <!-- Title & Summary -->
      <h3 class="text-xl font-playfair font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-accent-orange transition-soft">
        {{ article.title }}
      </h3>
      <p class="text-gray-600 text-sm mb-4 line-clamp-3">
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
          v-if="showBookmark"
          @click.stop="$emit('bookmark')"
          class="text-gray-400 hover:text-accent-orange transition-soft"
          :class="{ 'text-accent-orange': isBookmarked }"
        >
          <svg class="w-5 h-5" :fill="isBookmarked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "nuxt-property-decorator";
import { Article } from "~/utils/api";

@Component
export default class ArticleCard extends Vue {
  @Prop({ required: true }) article!: Article;
  @Prop({ default: false }) showBookmark!: boolean;
  @Prop({ default: false }) isBookmarked!: boolean;

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays < 1) return "Today";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}
</script>

