<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="relative bg-gradient-shift text-white py-16 md:py-24 mb-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroCarousel
          title="Kendi yazılarını keşfet"
          subtitle="Bilfen Blog topluluğunda ilham verici içerikler keşfedin ve kendi hikayenizi paylaşın"
          :articles="featuredArticles"
          @article-click="(article) => $router.push(`/articles/${article.id}`)"
        >
          <template #actions>
            <PillButton
              v-if="isAuthenticated"
              variant="outline"
              class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white"
              @click="$router.push('/articles/new')"
            >
              Yeni Makale Yaz
            </PillButton>
            <PillButton
              variant="outline"
              class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white"
              @click="$router.push('/feed')"
            >
              Topluluğa Katıl
            </PillButton>
          </template>
        </HeroCarousel>
      </div>
    </section>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <!-- Search Bar -->
      <div class="mb-8">
        <form @submit.prevent="handleSearch" class="max-w-2xl mx-auto">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Makalelerde ara..."
              class="w-full px-6 py-4 pl-12 rounded-full border-2 border-gray-200 focus:border-accent-orange focus:ring-4 focus:ring-accent-orange focus:ring-opacity-20 transition-all duration-300 text-lg"
            />
            <svg
              class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button
              v-if="searchQuery"
              type="button"
              @click="clearSearch"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="bg-white rounded-xl shadow-md p-6">
          <ShimmerPlaceholder width="100%" height="200px" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Content Sections -->
      <div v-else class="space-y-12">
        <!-- All Articles Grid -->
        <section>
          <SectionHeading
            title="Tüm Makaleler"
            :show-more-link="false"
          />
          <div v-if="articles && articles.items.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ArticleCard
              v-for="article in articles.items"
              :key="article.id"
              :article="article"
              :show-bookmark="isAuthenticated"
              :is-bookmarked="isBookmarked(article.id)"
              @click="$router.push(`/articles/${article.id}`)"
              @bookmark="handleBookmark(article.id)"
            />
          </div>
          <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
            <p class="text-gray-500 text-lg mb-4">Henüz makale bulunmuyor</p>
            <PillButton
              v-if="isAuthenticated"
              @click="$router.push('/articles/new')"
            >
              İlk Makalenizi Yazın
            </PillButton>
          </div>
        </section>

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
import { Component, Vue } from "nuxt-property-decorator";
import { api, ArticlesResponse, ActivityLog } from "~/utils/api";

@Component
export default class IndexPage extends Vue {
  articles: ArticlesResponse | null = null;
  recentActivities: ActivityLog[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = "";

  async fetch() {
    await Promise.all([this.loadArticles(), this.loadRecentActivities()]);
  }

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
  }

  async loadRecentActivities() {
    if (!this.isAuthenticated) return;
    
    try {
      this.recentActivities = await api.getFeed(10);
    } catch (err: any) {
      console.error("Error loading activities:", err);
    }
  }

  async handleSearch() {
    await this.loadArticles(this.searchQuery || undefined);
  }

  async clearSearch() {
    this.searchQuery = "";
    await this.loadArticles();
  }

  async handleBookmark(articleId: string) {
    try {
      await this.$store.dispatch("social/toggleBookmark", articleId);
    } catch (err: any) {
      alert(`Failed to bookmark: ${err.message}`);
    }
  }

  isBookmarked(articleId: string): boolean {
    return this.$store.getters["social/isBookmarked"](articleId);
  }

  get featuredArticles() {
    return this.articles?.items.slice(0, 5) || [];
  }

  get isAuthenticated() {
    return this.$store.getters["auth/isAuthenticated"];
  }
}
</script>
