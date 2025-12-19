<template>
  <div class="min-h-screen bg-gray-50 font-inter">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-playfair font-bold text-gray-900 mb-4">Makale Ara</h1>
        
        <!-- Main Search Input -->
        <div class="relative mb-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Makale başlığı, özet veya içerikte ara..."
            class="w-full px-6 py-4 pl-12 rounded-full border-2 border-gray-200 focus:border-accent-orange focus:ring-4 focus:ring-accent-orange focus:ring-opacity-20 transition-all duration-300 text-lg"
            @input="handleSearchInput"
            @focus="showSuggestions = true"
          />
          <svg
            class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          <!-- Suggestions Dropdown -->
          <div
            v-if="showSuggestions && suggestions.length > 0"
            class="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto"
          >
            <div v-if="suggestions.articles.length > 0" class="p-2">
              <p class="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Makaleler</p>
              <button
                v-for="article in suggestions.articles"
                :key="article.id"
                @click="selectSuggestion(article.title)"
                class="w-full text-left px-3 py-2 hover:bg-gray-50 rounded transition-soft"
              >
                <p class="font-medium text-gray-900">{{ article.title }}</p>
              </button>
            </div>
            <div v-if="suggestions.authors.length > 0" class="p-2 border-t border-gray-100">
              <p class="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Yazarlar</p>
              <button
                v-for="author in suggestions.authors"
                :key="author.id"
                @click="selectAuthorSuggestion(author)"
                class="w-full text-left px-3 py-2 hover:bg-gray-50 rounded transition-soft flex items-center gap-3"
              >
                <img
                  v-if="author.avatarUrl"
                  :src="author.avatarUrl"
                  :alt="author.displayName || author.username"
                  class="w-8 h-8 rounded-full"
                />
                <div>
                  <p class="font-medium text-gray-900">{{ author.displayName || author.username }}</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Advanced Filters Toggle -->
        <button
          @click="showFilters = !showFilters"
          class="text-sm text-accent-blue hover:text-accent-orange transition-soft flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Gelişmiş Filtreler
        </button>
      </div>

      <!-- Advanced Filters Panel -->
      <div v-if="showFilters" class="bg-white rounded-xl shadow-md p-6 mb-8">
        <div class="grid gap-6 md:grid-cols-3">
          <!-- Author Filter -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Yazar</label>
            <input
              v-model="filters.authorId"
              type="text"
              placeholder="Yazar ID"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          <!-- Date Range -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Başlangıç Tarihi</label>
            <input
              v-model="filters.dateFrom"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Bitiş Tarihi</label>
            <input
              v-model="filters.dateTo"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          <!-- Sort -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Sıralama</label>
            <select
              v-model="filters.sort"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            >
              <option value="recent">En Yeni</option>
              <option value="popular">En Popüler</option>
            </select>
          </div>
        </div>

        <div class="mt-4 flex gap-3">
          <PillButton @click="applyFilters">Filtreleri Uygula</PillButton>
          <button
            @click="clearFilters"
            class="px-4 py-2 text-gray-600 hover:text-gray-900 transition-soft"
          >
            Temizle
          </button>
        </div>
      </div>

      <!-- Active Filters Summary -->
      <div v-if="hasActiveFilters" class="mb-6 flex flex-wrap gap-2">
        <span
          v-if="searchQuery"
          class="px-3 py-1 bg-accent-orange bg-opacity-10 text-accent-orange rounded-full text-sm flex items-center gap-2"
        >
          "{{ searchQuery }}"
          <button @click="searchQuery = ''" class="hover:bg-accent-orange hover:bg-opacity-20 rounded-full p-0.5">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
        <span
          v-if="filters.authorId"
          class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
        >
          Yazar: {{ filters.authorId }}
        </span>
      </div>

      <!-- Results -->
      <div v-if="loading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i">
          <ShimmerPlaceholder width="100%" height="300px" />
        </div>
      </div>

      <div v-else-if="results && results.items.length > 0">
        <div class="mb-4 text-sm text-gray-600">
          {{ results.total }} sonuç bulundu
        </div>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ArticleCard
            v-for="article in results.items"
            :key="article.id"
            :article="article"
            :show-bookmark="isAuthenticated"
            :is-bookmarked="isBookmarked(article.id)"
            @click="$router.push(`/articles/${article.id}`)"
            @bookmark="handleBookmark(article.id)"
          />
        </div>

        <!-- Pagination -->
        <div v-if="results.totalPages && results.totalPages > 1" class="mt-8 flex justify-center gap-2">
          <button
            v-for="page in results.totalPages"
            :key="page"
            @click="filters.page = page; search()"
            :class="[
              'px-4 py-2 rounded-lg transition-soft',
              filters.page === page
                ? 'bg-accent-orange text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            ]"
          >
            {{ page }}
          </button>
        </div>
      </div>

      <div v-else-if="searched" class="bg-white rounded-xl shadow-md p-12 text-center">
        <p class="text-gray-500 text-lg">Sonuç bulunamadı</p>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "nuxt-property-decorator";
import { api, ArticlesResponse } from "~/utils/api";
import ArticleCard from "~/components/ArticleCard.vue";
import ShimmerPlaceholder from "~/components/ShimmerPlaceholder.vue";
import PillButton from "~/components/PillButton.vue";

@Component({
  components: {
    ArticleCard,
    ShimmerPlaceholder,
    PillButton,
  },
})
export default class SearchPage extends Vue {
  searchQuery = "";
  showSuggestions = false;
  showFilters = false;
  suggestions = { articles: [], authors: [] };
  results: ArticlesResponse | null = null;
  loading = false;
  searched = false;
  suggestionTimeout: any = null;

  filters = {
    authorId: "",
    dateFrom: "",
    dateTo: "",
    sort: "recent" as "recent" | "popular",
    page: 1,
  };

  async mounted() {
    // Load query params
    const query = this.$route.query;
    if (query.q) {
      this.searchQuery = query.q as string;
    }
    if (query.authorId) {
      this.filters.authorId = query.authorId as string;
    }
    if (query.sort) {
      this.filters.sort = query.sort as "recent" | "popular";
    }
    
    if (this.searchQuery || this.hasActiveFilters) {
      await this.search();
    }
  }

  handleSearchInput() {
    if (this.suggestionTimeout) {
      clearTimeout(this.suggestionTimeout);
    }
    
    if (this.searchQuery.length >= 2) {
      this.suggestionTimeout = setTimeout(() => {
        this.loadSuggestions();
      }, 300);
    } else {
      this.suggestions = { articles: [], authors: [] };
    }
  }

  async loadSuggestions() {
    try {
      const response = await fetch(
        `${process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000"}/api/search/suggestions?q=${encodeURIComponent(this.searchQuery)}`,
        { credentials: "include" }
      );
      this.suggestions = await response.json();
    } catch (err) {
      console.error("Error loading suggestions:", err);
    }
  }

  selectSuggestion(title: string) {
    this.searchQuery = title;
    this.showSuggestions = false;
    this.search();
  }

  selectAuthorSuggestion(author: any) {
    this.filters.authorId = author.id;
    this.showSuggestions = false;
    this.search();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.filters.authorId || this.filters.dateFrom || this.filters.dateTo);
  }

  applyFilters() {
    this.search();
  }

  clearFilters() {
    this.searchQuery = "";
    this.filters = {
      authorId: "",
      dateFrom: "",
      dateTo: "",
      sort: "recent",
      page: 1,
    };
    this.results = null;
    this.searched = false;
  }

  async search() {
    if (!this.searchQuery && !this.hasActiveFilters) return;

    this.loading = true;
    this.searched = true;
    this.showSuggestions = false;

    try {
      const params = new URLSearchParams();
      if (this.searchQuery) params.append("query", this.searchQuery);
      if (this.filters.authorId) params.append("authorId", this.filters.authorId);
      if (this.filters.dateFrom) params.append("dateFrom", this.filters.dateFrom);
      if (this.filters.dateTo) params.append("dateTo", this.filters.dateTo);
      if (this.filters.sort) params.append("sort", this.filters.sort);
      if (this.filters.page) params.append("page", this.filters.page.toString());

      const url = `${process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000"}/api/articles?${params.toString()}`;
      const response = await fetch(url, { credentials: "include" });
      this.results = await response.json();

      // Update URL
      this.$router.replace({ query: Object.fromEntries(params) });
    } catch (err: any) {
      console.error("Error searching:", err);
    } finally {
      this.loading = false;
    }
  }

  get isAuthenticated() {
    return this.$store.getters["auth/isAuthenticated"];
  }

  isBookmarked(articleId: string): boolean {
    return (this.$store.state as any).social?.bookmarks?.[articleId] || false;
  }

  async handleBookmark(articleId: string) {
    // Bookmark handling will be done via store
  }
}
</script>

