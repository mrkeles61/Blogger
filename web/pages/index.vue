<template>
  <div class="min-h-screen bg-gray-900">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-16">
        <!-- Hero Section -->
        <section class="text-center py-12">
          <h1 class="text-5xl md:text-6xl font-playfair font-bold text-white mb-4">
            Kendi yazılarını keşfet
          </h1>
          <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Bilfen Blog topluluğuna katıl, yazılarını paylaş ve ilham al. Yaratıcılığını serbest bırak.
          </p>
          <nuxt-link
            v-if="isAuthenticated"
            to="/articles/new"
            class="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            İlk Makalenizi Yazın
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </nuxt-link>
          <nuxt-link
            v-else
            to="/login"
            class="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Topluluğa Katıl
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </nuxt-link>
        </section>

        <!-- Featured Articles Section -->
        <section v-if="featuredArticles.length > 0">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ArticleCard
              v-for="article in featuredArticles.slice(0, 4)"
              :key="article.id"
              :article="article"
              :show-bookmark="isAuthenticated"
              @click="$router.push(`/articles/${article.id}`)"
            />
          </div>
        </section>

        <!-- Latest Additions Section -->
        <section v-if="latestArticles.length > 0">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-3xl font-playfair font-bold text-white">Son Eklenenler</h2>
            <nuxt-link
              to="/articles"
              class="text-purple-400 hover:text-purple-300 transition-soft flex items-center gap-2"
            >
              Tümünü gör
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </nuxt-link>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <LatestArticleCard
              v-for="article in latestArticles.slice(0, 3)"
              :key="article.id"
              :article="article"
              :is-authenticated="isAuthenticated"
              @click="$router.push(`/articles/${article.id}`)"
              @bookmark="handleBookmark"
            />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { api, ArticlesResponse, ActivityLog } from "~/utils/api";
import ArticleCard from "~/components/ArticleCard.vue";
import LatestArticleCard from "~/components/LatestArticleCard.vue";

export default Vue.extend({
  name: "IndexPage",
  components: {
    ArticleCard,
    LatestArticleCard,
  },
  data() {
    return {
      articles: null as ArticlesResponse | null,
      recentActivities: [] as ActivityLog[],
      loading: true,
      error: null as string | null,
      searchQuery: "",
      isMounted: false,
    };
  },
  computed: {
    featuredArticles() {
      return this.articles?.items.slice(0, 4) || [];
    },
    latestArticles() {
      return this.articles?.items.slice(4, 10) || [];
    },
    isAuthenticated(): boolean {
      if (!this.isMounted) return false;
      return this.$store.getters["auth/isAuthenticated"];
    },
  },
  mounted() {
    this.isMounted = true;
  },
  async fetch() {
    await Promise.all([this.loadArticles(), this.loadRecentActivities()]);
  },
  methods: {
    async loadArticles(search?: string) {
      this.loading = true;
      this.error = null;
      try {
        this.articles = await api.getArticles(search);
      } catch (err: any) {
        this.error = err.message || "Failed to load articles";
        console.error("Error loading articles:", err);
      } finally {
        this.loading = false;
      }
    },
    async loadRecentActivities() {
      if (!this.isAuthenticated) return;
      
      try {
        this.recentActivities = await api.getFeed(10);
      } catch (err: any) {
        console.error("Error loading activities:", err);
      }
    },
    async handleSearch() {
      await this.loadArticles(this.searchQuery || undefined);
    },
    async clearSearch() {
      this.searchQuery = "";
      await this.loadArticles();
    },
    async handleBookmark(articleId: string) {
      try {
        await this.$store.dispatch("social/toggleBookmark", articleId);
      } catch (err: any) {
        alert(`Failed to bookmark: ${err.message}`);
      }
    },
    isBookmarked(articleId: string): boolean {
      return this.$store.getters["social/isBookmarked"](articleId);
    },
  },
});
</script>
