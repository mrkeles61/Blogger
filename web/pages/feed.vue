<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-playfair font-bold text-gray-900 mb-2">Etkinlik Akışı</h1>
        <p class="text-gray-600">Takip ettiğiniz yazarların son aktiviteleri</p>
      </div>

      <!-- Filter Chips -->
      <div class="mb-6 flex flex-wrap gap-2">
        <button
          v-for="filter in filters"
          :key="filter.type"
          @click="selectedFilter = filter.type"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
          :class="
            selectedFilter === filter.type
              ? 'bg-accent-orange text-white shadow-md scale-105'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          "
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <div v-for="i in 5" :key="i" class="bg-white rounded-xl shadow-md p-6">
          <ShimmerPlaceholder width="100%" height="100px" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredActivities.length === 0" class="bg-white rounded-xl shadow-md p-12 text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p class="text-gray-500 text-lg mb-2">Henüz aktivite yok</p>
        <p class="text-gray-400 text-sm mb-4">Yazarları takip ederek onların aktivitelerini görebilirsiniz</p>
        <nuxt-link
          to="/"
          class="inline-block px-4 py-2 bg-accent-orange text-white rounded-full hover:bg-orange-700 transition-soft"
        >
          Yazarları Keşfet
        </nuxt-link>
      </div>

      <!-- Timeline -->
      <div v-else class="space-y-0">
        <div
          v-for="activity in filteredActivities"
          :key="activity.id"
          class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden mb-4 animate-fade-up"
        >
          <ActivityItem :activity="activity" />
        </div>
      </div>

      <!-- Load More -->
      <div v-if="!loading && filteredActivities.length > 0" class="mt-8 text-center">
        <button
          @click="loadMore"
          :disabled="loadingMore"
          class="px-6 py-3 bg-white border-2 border-accent-orange text-accent-orange rounded-full hover:bg-accent-orange hover:text-white transition-all duration-300 font-medium disabled:opacity-50"
        >
          <span v-if="loadingMore">Yükleniyor...</span>
          <span v-else>Daha Fazla Yükle</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { ActivityLog } from "~/utils/api";
import { api } from "~/utils/api";

export default Vue.extend({
  name: "FeedPage",
  middleware: "auth",
  data() {
    return {
      activities: [] as ActivityLog[],
      loading: true,
      loadingMore: false,
      error: null as string | null,
      selectedFilter: "all",
      limit: 20,
      filters: [
        { type: "all", label: "Tümü" },
        { type: "article_created", label: "Makale" },
        { type: "comment_added", label: "Yorum" },
        { type: "article_liked", label: "Beğeni" },
      ],
    };
  },
  computed: {
    filteredActivities(): ActivityLog[] {
      if (this.selectedFilter === "all") {
        return this.activities;
      }
      return this.activities.filter((a) => a.type === this.selectedFilter);
    },
  },
  async fetch() {
    await this.loadFeed();
  },
  methods: {
    async loadFeed() {
      this.loading = true;
      this.error = null;
      try {
        this.activities = await api.getFeed(this.limit);
      } catch (err: any) {
        console.error("Feed load error:", err);
        this.error = err.message || "Aktivite akışı yüklenemedi";
      } finally {
        this.loading = false;
      }
    },
    async loadMore() {
      this.loadingMore = true;
      try {
        const more = await api.getFeed(this.limit);
        this.activities = [...this.activities, ...more];
        this.limit += 20;
      } catch (err: any) {
        console.error("Failed to load more:", err);
      } finally {
        this.loadingMore = false;
      }
    },
  },
});
</script>
