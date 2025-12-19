<template>
  <div class="relative overflow-hidden rounded-2xl bg-gradient-shift p-8 text-white">
    <div class="relative z-10">
      <h1 class="text-4xl md:text-5xl font-playfair font-bold mb-4">
        {{ title }}
      </h1>
      <p class="text-lg md:text-xl mb-6 opacity-90">
        {{ subtitle }}
      </p>
      <div class="flex flex-wrap gap-4">
        <slot name="actions" />
      </div>
    </div>
    
    <!-- Featured Articles Carousel -->
    <div v-if="articles.length > 0" class="mt-8 relative z-10">
      <div class="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div class="flex gap-4 pb-4">
          <article
            v-for="article in articles.slice(0, 5)"
            :key="article.id"
            class="flex-shrink-0 w-64 bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-4 hover:bg-opacity-30 transition-soft cursor-pointer"
            @click="$emit('article-click', article)"
          >
            <h3 class="font-playfair font-semibold text-lg mb-2 line-clamp-2">
              {{ article.title }}
            </h3>
            <p class="text-sm opacity-90 line-clamp-2 mb-2">
              {{ article.summary }}
            </p>
            <div class="flex items-center gap-2 text-xs opacity-75">
              <span v-if="article.author?.displayName">
                {{ article.author.displayName }}
              </span>
              <span v-if="article.publishedAt">
                • {{ formatDate(article.publishedAt) }}
              </span>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { Article } from "~/utils/api";

export default Vue.extend({
  name: "HeroCarousel",
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    articles: {
      type: Array as PropType<Article[]>,
      default: () => [],
    },
  },
  methods: {
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString("tr-TR", { month: "short", day: "numeric" });
    },
  },
});
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
