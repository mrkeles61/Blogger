<template>
  <div class="min-h-screen bg-gray-50 font-inter">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <nuxt-link
          to="/dashboard"
          class="text-gray-600 hover:text-accent-orange transition-soft inline-flex items-center gap-2 mb-4"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Dashboard'a Dön
        </nuxt-link>
        <h1 class="text-3xl font-playfair font-bold text-gray-900">Makalelerim</h1>
        <p class="text-gray-600 mt-2">Taslaklarınızı, zamanlanmış ve yayınlanmış makalelerinizi yönetin</p>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <div class="flex gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'px-4 py-2 font-medium text-sm transition-soft border-b-2',
              activeTab === tab.key
                ? 'border-accent-orange text-accent-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            {{ tab.label }}
            <span v-if="tab.count !== undefined" class="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
              {{ tab.count }}
            </span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i">
          <ShimmerPlaceholder width="100%" height="300px" />
        </div>
      </div>

      <!-- Articles Grid -->
      <div v-else-if="filteredArticles.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ArticleCard
          v-for="article in filteredArticles"
          :key="article.id"
          :article="article"
          :show-status-badges="true"
          @click="$router.push(`/articles/${article.id}`)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-500 text-lg mb-4">{{ getEmptyStateMessage() }}</p>
        <PillButton @click="$router.push('/articles/new')">
          Yeni Makale Oluştur
        </PillButton>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import { api, Article } from "~/utils/api";
import ArticleCard from "~/components/ArticleCard.vue";
import ShimmerPlaceholder from "~/components/ShimmerPlaceholder.vue";
import PillButton from "~/components/PillButton.vue";

@Component({
  components: {
    ArticleCard,
    ShimmerPlaceholder,
    PillButton,
  },
  middleware: "auth",
})
export default class DashboardArticlesPage extends Vue {
  articles: Article[] = [];
  loading = true;
  error: string | null = null;
  activeTab = "all";

  tabs = [
    { key: "all", label: "Tümü", count: undefined },
    { key: "draft", label: "Taslaklar", count: 0 },
    { key: "scheduled", label: "Zamanlanmış", count: 0 },
    { key: "published", label: "Yayınlanmış", count: 0 },
  ];

  async fetch() {
    await this.loadArticles();
  }

  async loadArticles() {
    this.loading = true;
    this.error = null;

    try {
      const response = await api.getMyArticles();
      this.articles = response.items || [];
      
      // Update tab counts
      this.tabs[1].count = this.articles.filter(a => a.status === "Draft").length;
      this.tabs[2].count = this.articles.filter(a => a.status === "Scheduled").length;
      this.tabs[3].count = this.articles.filter(a => a.status === "Published").length;
    } catch (err: any) {
      this.error = err.message || "Makaleler yüklenemedi";
      console.error("Error loading articles:", err);
    } finally {
      this.loading = false;
    }
  }

  get filteredArticles(): Article[] {
    if (this.activeTab === "all") {
      return this.articles;
    }
    return this.articles.filter(article => article.status === this.getStatusForTab(this.activeTab));
  }

  getStatusForTab(tab: string): string {
    const statusMap: Record<string, string> = {
      draft: "Draft",
      scheduled: "Scheduled",
      published: "Published",
    };
    return statusMap[tab] || "";
  }

  getEmptyStateMessage(): string {
    const messages: Record<string, string> = {
      all: "Henüz makale oluşturmadınız",
      draft: "Taslak makaleniz bulunmuyor",
      scheduled: "Zamanlanmış makaleniz bulunmuyor",
      published: "Yayınlanmış makaleniz bulunmuyor",
    };
    return messages[this.activeTab] || "Makale bulunamadı";
  }
}
</script>

