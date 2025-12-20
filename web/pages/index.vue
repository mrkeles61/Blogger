<template>
  <div>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-12">
        <!-- Hero Section -->
        <HeroCarousel
          title="Kendi yazılarını keşfet"
          subtitle="Bilfen Blog topluluğuna katıl, yazılarını paylaş ve ilham al"
          :articles="featuredArticles"
          @article-click="(article) => $router.push(`/articles/${article.id}`)"
        >
          <template #actions>
            <PillButton
              v-if="!isAuthenticated"
              @click="$router.push('/login')"
            >
              Topluluğa Katıl
            </PillButton>
            <PillButton
              v-if="isAuthenticated"
              @click="$router.push('/articles/new')"
            >
              İlk Makalenizi Yazın
            </PillButton>
          </template>
        </HeroCarousel>

        <!-- Activity Feed Preview -->
        <section v-if="isAuthenticated && recentActivities.length > 0">
          <SectionHeading
            title="Etkinlik Akışı"
            :show-more-link="true"
            more-link="/feed"
            more-text="Tümünü Gör"
          />
          <div class="bg-white rounded-xl shadow-md p-6 space-y-4">
            <ActivityItem
              v-for="activity in recentActivities.slice(0, 5)"
              :key="activity.id"
              :activity="activity"
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

export default Vue.extend({
  name: "IndexPage",
  data() {
    return {
      articles: null as ArticlesResponse | null,
      recentActivities: [] as ActivityLog[],
      loading: true,
      error: null as string | null,
      searchQuery: "",
      isMounted: false, // Flag to prevent hydration mismatch
    };
  },
  computed: {
    featuredArticles() {
      return this.articles?.items.slice(0, 5) || [];
    },
    isAuthenticated(): boolean {
      // During SSR and initial render, return false to match SSR output
      if (!this.isMounted) return false;
      return this.$store.getters["auth/isAuthenticated"];
    },
  },
  mounted() {
    // Set mounted flag after hydration to allow auth-dependent rendering
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
