<template>
  <div class="min-h-screen bg-gray-50 font-inter">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-playfair font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-2">Yazılarınızın performansını ve istatistiklerini görüntüleyin</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <div class="grid gap-6 md:grid-cols-4">
          <div v-for="i in 4" :key="i" class="bg-white rounded-xl shadow-md p-6">
            <ShimmerPlaceholder width="100%" height="100px" />
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-accent-orange">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Toplam Makale</p>
              <p class="text-3xl font-bold text-gray-900">{{ analytics?.totalArticles || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-accent-orange bg-opacity-10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div class="mt-4 flex gap-4 text-sm">
            <span class="text-gray-600">{{ analytics?.publishedArticles || 0 }} yayınlanmış</span>
            <span class="text-gray-600">{{ analytics?.draftArticles || 0 }} taslak</span>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Toplam Görüntülenme</p>
              <p class="text-3xl font-bold text-gray-900">{{ analytics?.totalViews || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Toplam Beğeni</p>
              <p class="text-3xl font-bold text-gray-900">{{ analytics?.totalLikes || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Takipçiler</p>
              <p class="text-3xl font-bold text-gray-900">{{ analytics?.followers || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-4 text-sm text-green-600">
            +{{ analytics?.followersGainedLast30Days || 0 }} son 30 günde
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid gap-6 md:grid-cols-3 mb-8">
        <nuxt-link
          to="/articles/new"
          class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all border-2 border-dashed border-gray-300 hover:border-accent-orange group"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-accent-orange bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-accent-orange transition-soft">
              <svg class="w-6 h-6 text-accent-orange group-hover:text-white transition-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900">Yeni Makale</p>
              <p class="text-sm text-gray-600">Yeni bir makale oluştur</p>
            </div>
          </div>
        </nuxt-link>

        <nuxt-link
          to="/dashboard/articles"
          class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all border-2 border-dashed border-gray-300 hover:border-blue-500 group"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-soft">
              <svg class="w-6 h-6 text-blue-500 group-hover:text-white transition-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900">Makalelerim</p>
              <p class="text-sm text-gray-600">Taslak ve yayınlanmış makaleler</p>
            </div>
          </div>
        </nuxt-link>

        <nuxt-link
          v-if="isAdmin"
          to="/dashboard/moderation"
          class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all border-2 border-dashed border-gray-300 hover:border-red-500 group"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-500 bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-red-500 transition-soft">
              <svg class="w-6 h-6 text-red-500 group-hover:text-white transition-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900">Moderasyon</p>
              <p class="text-sm text-gray-600">Raporları yönet</p>
            </div>
          </div>
        </nuxt-link>
      </div>

      <!-- Activity Chart (Simple Bar Chart) -->
      <div v-if="activityData.length > 0" class="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 class="text-xl font-playfair font-bold text-gray-900 mb-6">Son 30 Günlük Aktivite</h2>
        <div class="flex items-end gap-2 h-64">
          <div
            v-for="(day, index) in activityData"
            :key="index"
            class="flex-1 flex flex-col items-center group"
          >
            <div
              class="w-full bg-gradient-to-t from-accent-orange to-accent-blue rounded-t transition-all hover:opacity-80 cursor-pointer relative"
              :style="{ height: `${getBarHeight(day)}%`, minHeight: '4px' }"
              :title="`${day.date}: ${day.articles + day.comments + day.likes} aktivite`"
            />
            <span class="text-xs text-gray-500 mt-2 hidden md:block">{{ formatChartDate(day.date) }}</span>
          </div>
        </div>
        <div class="mt-6 flex gap-6 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-accent-orange rounded"></div>
            <span class="text-gray-600">Makaleler</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-blue-500 rounded"></div>
            <span class="text-gray-600">Yorumlar</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-green-500 rounded"></div>
            <span class="text-gray-600">Beğeniler</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import ShimmerPlaceholder from "~/components/ShimmerPlaceholder.vue";
import { getApiBase } from "~/utils/api";

@Component({
  components: {
    ShimmerPlaceholder,
  },
  middleware: "auth",
})
export default class DashboardPage extends Vue {
  loading = true;
  analytics: any = null;
  activityData: any[] = [];

  async fetch() {
    await this.loadAnalytics();
    if (this.isAdmin) {
      await this.loadActivityData();
    }
  }

  async loadAnalytics() {
    this.loading = true;
    try {
      const userId = (this.$store.state as any).auth?.user?.id;
      if (!userId) return;

      const response = await fetch(
        `${getApiBase()}/api/analytics/user/${userId}`,
        { credentials: "include" }
      );
      this.analytics = await response.json();
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      this.loading = false;
    }
  }

  async loadActivityData() {
    try {
      const response = await fetch(
        `${getApiBase()}/api/analytics/activity?days=30`,
        { credentials: "include" }
      );
      this.activityData = await response.json();
    } catch (err) {
      console.error("Error loading activity:", err);
    }
  }

  getBarHeight(day: any): number {
    const max = Math.max(...this.activityData.map(d => d.articles + d.comments + d.likes), 1);
    const total = day.articles + day.comments + day.likes;
    return (total / max) * 100;
  }

  formatChartDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  }

  get isAdmin(): boolean {
    return (this.$store.state as any).auth?.user?.role === "Admin";
  }
}
</script>

