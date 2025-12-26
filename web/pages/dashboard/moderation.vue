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
        <h1 class="text-3xl font-playfair font-bold text-gray-900">Moderasyon Paneli</h1>
        <p class="text-gray-600 mt-2">Raporları inceleyin ve yönetin</p>
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
      <div v-if="loading" class="bg-white rounded-xl shadow-md p-12 text-center">
        <ShimmerPlaceholder width="100%" height="200px" />
      </div>

      <!-- Reports List -->
      <div v-else-if="filteredReports.length > 0" class="space-y-4">
        <div
          v-for="report in filteredReports"
          :key="report.id"
          class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span
                  :class="[
                    'px-3 py-1 text-xs font-semibold rounded-full',
                    getStatusClass(report.status)
                  ]"
                >
                  {{ getStatusLabel(report.status) }}
                </span>
                <span class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ report.type }}
                </span>
              </div>
              <p class="text-gray-900 font-medium mb-2">{{ report.reason }}</p>
              <p class="text-sm text-gray-600">
                Raporlayan: {{ report.reporter?.displayName || report.reporter?.username || "Anonim" }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ formatDate(report.createdAt) }}
              </p>
            </div>
            <div class="flex gap-2">
              <button
                @click="viewReportContext(report)"
                class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-soft"
              >
                Detay
              </button>
              <button
                v-if="report.status === 'Open'"
                @click="updateReportStatus(report.id, 'InReview')"
                class="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-soft"
              >
                İncele
              </button>
            </div>
          </div>

          <!-- Resolution Notes -->
          <div v-if="report.resolutionNotes" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-700">
              <strong>Çözüm Notu:</strong> {{ report.resolutionNotes }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
        <p class="text-gray-500 text-lg">Rapor bulunamadı</p>
      </div>

      <!-- Report Context Modal -->
      <div
        v-if="selectedReport"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="selectedReport = null"
      >
        <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-playfair font-bold text-gray-900">Rapor Detayları</h2>
              <button
                @click="selectedReport = null"
                class="text-gray-400 hover:text-gray-600 transition-soft"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div v-if="reportContext" class="space-y-4">
              <div class="p-4 bg-gray-50 rounded-lg">
                <p class="font-semibold text-gray-900 mb-2">Raporlanan İçerik:</p>
                <div v-if="reportContext.type === 'Article' && reportContext.context">
                  <h3 class="font-bold text-lg mb-2">{{ reportContext.context.title }}</h3>
                  <p class="text-gray-700">{{ reportContext.context.summary }}</p>
                </div>
                <div v-else-if="reportContext.type === 'Comment' && reportContext.context">
                  <p class="text-gray-700">{{ reportContext.context.content }}</p>
                  <p class="text-sm text-gray-500 mt-2">
                    Makale: {{ reportContext.context.article?.title }}
                  </p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Durum</label>
                <select
                  v-model="resolutionStatus"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue"
                >
                  <option value="Open">Açık</option>
                  <option value="InReview">İncelemede</option>
                  <option value="Resolved">Çözüldü</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Çözüm Notu</label>
                <textarea
                  v-model="resolutionNotes"
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue"
                  placeholder="Çözüm notu ekleyin..."
                />
              </div>

              <div class="flex gap-3">
                <PillButton
                  @click="saveReportResolution"
                  :loading="saving"
                >
                  Kaydet
                </PillButton>
                <button
                  @click="selectedReport = null"
                  class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-soft"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import ShimmerPlaceholder from "~/components/ShimmerPlaceholder.vue";
import PillButton from "~/components/PillButton.vue";
import { getApiBase } from "~/utils/api";

@Component({
  components: {
    ShimmerPlaceholder,
    PillButton,
  },
  middleware: ["auth", "admin"],
})
export default class DashboardModerationPage extends Vue {
  reports: any[] = [];
  loading = true;
  activeTab = "open";
  selectedReport: any = null;
  reportContext: any = null;
  resolutionStatus = "Open";
  resolutionNotes = "";
  saving = false;

  tabs = [
    { key: "open", label: "Açık", count: 0 },
    { key: "inreview", label: "İncelemede", count: 0 },
    { key: "resolved", label: "Çözüldü", count: 0 },
  ];

  async fetch() {
    await this.loadReports();
  }

  async loadReports() {
    this.loading = true;
    try {
      const response = await fetch(
        `${getApiBase()}/api/moderation/reports`,
        { credentials: "include" }
      );
      const data = await response.json();
      this.reports = data.items || [];
      this.updateTabCounts();
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      this.loading = false;
    }
  }

  updateTabCounts() {
    this.tabs[0].count = this.reports.filter(r => r.status === "Open").length;
    this.tabs[1].count = this.reports.filter(r => r.status === "InReview").length;
    this.tabs[2].count = this.reports.filter(r => r.status === "Resolved").length;
  }

  get filteredReports(): any[] {
    const statusMap: Record<string, string> = {
      open: "Open",
      inreview: "InReview",
      resolved: "Resolved",
    };
    const status = statusMap[this.activeTab];
    return this.reports.filter(r => r.status === status);
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      Open: "bg-yellow-100 text-yellow-800",
      InReview: "bg-blue-100 text-blue-800",
      Resolved: "bg-green-100 text-green-800",
    };
    return classes[status] || "bg-gray-100 text-gray-800";
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Open: "Açık",
      InReview: "İncelemede",
      Resolved: "Çözüldü",
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async viewReportContext(report: any) {
    this.selectedReport = report;
    this.resolutionStatus = report.status;
    this.resolutionNotes = report.resolutionNotes || "";

    try {
      const response = await fetch(
        `${getApiBase()}/api/moderation/reports/${report.id}`,
        { credentials: "include" }
      );
      this.reportContext = await response.json();
    } catch (err) {
      console.error("Error loading report context:", err);
    }
  }

  async updateReportStatus(reportId: string, status: string) {
    try {
      const response = await fetch(
        `${getApiBase()}/api/moderation/reports/${reportId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status, resolutionNotes: null }),
        }
      );
      if (response.ok) {
        await this.loadReports();
      }
    } catch (err) {
      console.error("Error updating report:", err);
    }
  }

  async saveReportResolution() {
    if (!this.selectedReport) return;

    this.saving = true;
    try {
      const response = await fetch(
        `${getApiBase()}/api/moderation/reports/${this.selectedReport.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            status: this.resolutionStatus,
            resolutionNotes: this.resolutionNotes || null,
          }),
        }
      );
      if (response.ok) {
        this.selectedReport = null;
        await this.loadReports();
      }
    } catch (err) {
      console.error("Error saving resolution:", err);
    } finally {
      this.saving = false;
    }
  }
}
</script>

