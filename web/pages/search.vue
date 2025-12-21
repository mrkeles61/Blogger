<template>
  <div class="min-h-screen bg-gray-900 font-inter">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-playfair font-bold text-white mb-4">Makale Ara</h1>
        
        <!-- Main Search Input -->
        <div class="relative mb-4" v-click-outside="closeSuggestions">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Makale başlığı, özet veya içerikte ara..."
            class="w-full px-6 py-4 pl-12 rounded-full bg-gray-800 border-2 border-gray-700 focus:border-accent-purple focus:ring-4 focus:ring-accent-purple focus:ring-opacity-20 transition-all duration-300 text-lg text-white placeholder-gray-400"
            @input="handleSearchInput"
            @keyup.enter="handleEnterKey"
            @focus="showSuggestions = searchQuery.length >= 2 && searchSuggestions.length > 0"
          />
          <svg
            v-if="!searchSuggestionsLoading"
            class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <svg
            v-else
            class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          
          <!-- Search Suggestions Dropdown -->
          <div
            v-if="showSuggestions && searchSuggestions.length > 0"
            class="absolute z-50 w-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-h-96 overflow-y-auto"
          >
            <div class="p-2">
              <div
                v-for="article in searchSuggestions"
                :key="article.id"
                @click="selectSuggestion(article)"
                class="w-full text-left px-3 py-3 hover:bg-gray-700 rounded transition-soft cursor-pointer border-b border-gray-700 last:border-b-0"
              >
                <p class="font-medium text-white mb-1">{{ article.title }}</p>
                <p class="text-sm text-gray-400 line-clamp-2">{{ article.summary }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Filters Toggle -->
        <button
          @click="showFilters = !showFilters"
          class="px-4 py-2 bg-accent-purple text-white rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-purple-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Gelişmiş Filtreler
        </button>
      </div>

      <!-- Advanced Filters Panel -->
      <div v-if="showFilters" class="bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-700">
        <div class="grid gap-6 md:grid-cols-3">
          <!-- Author Filter -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Yazar</label>
            <input
              v-model="filters.authorId"
              type="text"
              placeholder="Yazar ID"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-purple focus:border-transparent text-white placeholder-gray-400"
              @keyup.enter="handleEnterKey"
            />
          </div>

          <!-- Date Range Picker -->
          <div class="md:col-span-2">
            <DateRangePicker
              label="Tarih Aralığı"
              :start-date="filters.dateFrom"
              :end-date="filters.dateTo"
              @update:startDate="updateStartDate"
              @update:endDate="updateEndDate"
            />
          </div>

          <!-- Sort -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Sıralama</label>
            <select
              v-model="filters.sort"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-purple focus:border-transparent text-white"
              @change="handleFilterChange"
            >
              <option value="recent">En Yeni</option>
              <option value="popular">En Popüler</option>
            </select>
          </div>
        </div>

        <div class="mt-4 flex gap-3">
          <button
            @click="applyFilters"
            class="px-6 py-3 bg-accent-purple text-white rounded-full font-semibold hover:bg-purple-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
          >
            Filtreleri Uygula
          </button>
          <button
            @click="clearFilters"
            class="px-4 py-2 text-gray-400 hover:text-white transition-soft"
          >
            Temizle
          </button>
        </div>
      </div>

      <!-- Active Filters Summary -->
      <div v-if="hasActiveFilters" class="mb-6 flex flex-wrap gap-2">
        <span
          v-if="searchQuery"
          class="px-4 py-2 bg-accent-purple text-white rounded-full text-sm font-semibold flex items-center gap-2 shadow-md hover:bg-purple-700 transition-soft"
        >
          "{{ searchQuery }}"
          <button @click="searchQuery = ''; applyFilters()" class="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-soft">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
        <span
          v-if="filters.authorId"
          class="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold flex items-center gap-2 shadow-md border border-blue-400 border-opacity-30"
        >
          Yazar: {{ filters.authorId }}
          <button @click="filters.authorId = ''; applyFilters()" class="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-soft">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
        <span
          v-if="filters.dateFrom"
          class="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold flex items-center gap-2 shadow-md border border-green-400 border-opacity-30"
        >
          Başlangıç: {{ filters.dateFrom }}
          <button @click="filters.dateFrom = ''; applyFilters()" class="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-soft">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
        <span
          v-if="filters.dateTo"
          class="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold flex items-center gap-2 shadow-md border border-green-400 border-opacity-30"
        >
          Bitiş: {{ filters.dateTo }}
          <button @click="filters.dateTo = ''; applyFilters()" class="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-soft">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      </div>

      <!-- Results -->
      <div v-if="loading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i">
          <ShimmerPlaceholder width="100%" height="300px" />
        </div>
      </div>

      <div v-else-if="results && results.items.length > 0">
        <div class="mb-4 text-sm text-gray-400">
          {{ results.total }} sonuç bulundu
        </div>
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                ? 'bg-accent-purple text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            {{ page }}
          </button>
        </div>
      </div>

      <div v-else-if="searched" class="bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-700">
        <p class="text-gray-400 text-lg">Sonuç bulunamadı</p>
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
import DateRangePicker from "~/components/DateRangePicker.vue";

@Component({
  components: {
    ArticleCard,
    ShimmerPlaceholder,
    PillButton,
    DateRangePicker,
  },
  directives: {
    "click-outside": {
      bind(el: any, binding: any, vnode: any) {
        el.clickOutsideEvent = (event: Event) => {
          if (!(el === event.target || el.contains(event.target))) {
            vnode.context[binding.expression](event);
          }
        };
        document.addEventListener("click", el.clickOutsideEvent);
      },
      unbind(el: any) {
        document.removeEventListener("click", el.clickOutsideEvent);
      },
    },
  },
})
export default class SearchPage extends Vue {
  searchQuery = "";
  showSuggestions = false;
  showFilters = false;
  searchSuggestions: any[] = [];
  searchSuggestionsLoading = false;
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
    if (query.dateFrom) {
      this.filters.dateFrom = query.dateFrom as string;
    }
    if (query.dateTo) {
      this.filters.dateTo = query.dateTo as string;
    }
    if (query.sort) {
      this.filters.sort = query.sort as "recent" | "popular";
    }
    if (query.page) {
      this.filters.page = parseInt(query.page as string);
    }
    
    if (this.searchQuery || this.hasActiveFilters) {
      await this.search();
    }
  }

  handleSearchInput() {
    // Clear dropdown if query is too short
    if (this.searchQuery.length < 2) {
      this.showSuggestions = false;
      this.searchSuggestions = [];
      if (this.suggestionTimeout) {
        clearTimeout(this.suggestionTimeout);
        this.suggestionTimeout = null;
      }
      return;
    }

    // Debounce search requests (300ms)
    if (this.suggestionTimeout) {
      clearTimeout(this.suggestionTimeout);
    }

    this.suggestionTimeout = setTimeout(async () => {
      await this.loadSearchSuggestions();
    }, 300);
  }

  async loadSearchSuggestions() {
    if (this.searchQuery.length < 2) {
      this.searchSuggestions = [];
      this.showSuggestions = false;
      return;
    }

    this.searchSuggestionsLoading = true;
    try {
      const response = await api.getArticles(this.searchQuery, 1, 5);
      this.searchSuggestions = response.items || [];
      this.showSuggestions = this.searchSuggestions.length > 0;
    } catch (err: any) {
      console.error("Error loading search suggestions:", err);
      this.searchSuggestions = [];
      this.showSuggestions = false;
    } finally {
      this.searchSuggestionsLoading = false;
    }
  }

  selectSuggestion(article: any) {
    this.$router.push(`/articles/${article.id}`);
    this.closeSuggestions();
    this.searchQuery = "";
  }

  closeSuggestions() {
    this.showSuggestions = false;
  }

  handleEnterKey() {
    // Close suggestions dropdown
    this.closeSuggestions();
    // Automatically apply filters and search
    this.search();
  }

  handleFilterChange() {
    // Auto-apply filters when date or sort changes
    // Only search if we have a query or other active filters
    if (this.searchQuery || this.hasActiveFilters) {
      this.filters.page = 1; // Reset to first page when filters change
      this.search();
    }
  }

  updateStartDate(dateStr: string) {
    this.filters.dateFrom = dateStr;
    this.handleFilterChange();
  }

  updateEndDate(dateStr: string) {
    this.filters.dateTo = dateStr;
    this.handleFilterChange();
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

      // Use FTS search via API (query length >= 2 will trigger FTS)
      this.results = await api.getArticles(
        this.searchQuery || undefined,
        this.filters.page,
        20,
        this.filters.authorId || undefined
      );

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


