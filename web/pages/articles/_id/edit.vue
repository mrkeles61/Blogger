<template>
  <div class="min-h-screen bg-gray-50 font-inter">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <ShimmerPlaceholder class="h-96 rounded-xl" />
      </div>

      <div v-else-if="error || !canEdit" class="max-w-4xl mx-auto">
        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p class="text-yellow-800 mb-4">{{ error || "Bu makaleyi düzenleme yetkiniz yok." }}</p>
          <nuxt-link
            :to="`/articles/${$route.params.id}`"
            class="inline-block px-6 py-3 bg-accent-orange text-white rounded-full font-semibold hover:bg-opacity-90 transition-soft"
          >
            Makaleye Dön
          </nuxt-link>
        </div>
      </div>

      <div v-else>
        <div class="mb-6">
          <nuxt-link
            :to="`/articles/${$route.params.id}`"
            class="text-gray-600 hover:text-accent-orange transition-soft inline-flex items-center gap-2 mb-4"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Makaleye Dön
          </nuxt-link>
          <h1 class="text-3xl font-playfair font-bold text-gray-900">Makale Düzenle</h1>
        </div>

        <!-- Validation Errors -->
        <div v-if="validationErrors.length > 0" class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 class="font-semibold text-red-800 mb-2">Doğrulama Hataları:</h3>
          <ul class="list-disc list-inside text-red-700 space-y-1">
            <li v-for="error in validationErrors" :key="error">{{ error }}</li>
          </ul>
        </div>

        <div class="grid gap-8 lg:grid-cols-3">
          <!-- Main Editor Column -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-6 md:p-8">
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Title -->
                <div>
                  <label for="title" class="block text-sm font-semibold text-gray-700 mb-2">
                    Başlık (max 120 karakter)
                  </label>
                  <input
                    id="title"
                    v-model="form.title"
                    type="text"
                    required
                    maxlength="120"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-soft text-lg font-medium"
                    placeholder="Makale başlığını girin"
                  />
                  <p class="mt-1 text-sm text-gray-500">{{ form.title.length }}/120 karakter</p>
                </div>

                <!-- Summary -->
                <div>
                  <label for="summary" class="block text-sm font-semibold text-gray-700 mb-2">
                    Özet (max 280 karakter)
                  </label>
                  <textarea
                    id="summary"
                    v-model="form.summary"
                    rows="3"
                    required
                    maxlength="280"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-soft resize-none"
                    placeholder="Makale özetini girin"
                  />
                  <p class="mt-1 text-sm text-gray-500">{{ form.summary.length }}/280 karakter</p>
                </div>

                <!-- Content with Floating Toolbar -->
                <div>
                  <label for="content" class="block text-sm font-semibold text-gray-700 mb-2">
                    İçerik
                  </label>
                  <div class="relative">
                    <FloatingToolbar @format="handleFormat" />
                    <textarea
                      id="content"
                      ref="contentTextarea"
                      v-model="form.content"
                      rows="15"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-soft resize-none font-mono text-sm"
                      placeholder="Makale içeriğinizi buraya yazın..."
                    />
                  </div>
                  <p class="mt-2 text-sm text-gray-500">
                    İpucu: Markdown formatı desteklenir. Başlık için #, kalın için **text**, liste için - kullanabilirsiniz.
                  </p>
                </div>
              </form>
            </div>
          </div>

          <!-- Sticky Publish Panel -->
          <div class="lg:col-span-1">
            <div class="lg:sticky lg:top-24 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 class="text-xl font-playfair font-bold mb-6 text-gray-900">Yayın Bilgileri</h2>

              <!-- Status Dropdown -->
              <div class="mb-6">
                <label for="status" class="block text-sm font-semibold text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  id="status"
                  v-model="form.status"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-soft"
                  :disabled="!canPublish"
                >
                  <option value="Draft">Taslak</option>
                  <option v-if="canPublish" value="Published">Yayınla</option>
                  <option v-if="canPublish" value="Scheduled">Zamanlanmış</option>
                </select>
                <p v-if="!canPublish" class="mt-1 text-sm text-yellow-600">
                  ⚠️ Sadece Admin ve Editor rolü makale yayınlayabilir veya zamanlayabilir
                </p>
              </div>

              <!-- Scheduled Date Picker -->
              <div v-if="form.status === 'Scheduled'" class="mb-6">
                <label for="scheduledFor" class="block text-sm font-semibold text-gray-700 mb-2">
                  Zamanlanmış Tarih
                </label>
                <input
                  id="scheduledFor"
                  v-model="form.scheduledFor"
                  type="datetime-local"
                  :min="minScheduledDate"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-soft"
                />
              </div>

              <!-- Status Preview -->
              <div v-if="form.status === 'Published'" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p class="text-sm text-green-800">
                  <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Makale hemen yayınlanacak
                </p>
              </div>
              <div v-else-if="form.status === 'Scheduled' && form.scheduledFor" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-sm text-blue-800">
                  <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Makale yayınlanacak: {{ formatScheduledDate(form.scheduledFor) }}
                </p>
              </div>

              <!-- Publish Date Info -->
              <div v-if="article?.publishedAt" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p class="text-sm text-green-800 mb-1">
                  <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  İlk yayın: {{ formatDate(article.publishedAt) }}
                </p>
              </div>

              <!-- Updated Date -->
              <div v-if="article" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-sm text-blue-800">
                  <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Son güncelleme: {{ formatDate(article.updatedAt) }}
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <button
                  @click="handleSubmit"
                  :disabled="submitting"
                  class="w-full px-6 py-3 bg-accent-purple text-white rounded-lg hover:bg-purple-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {{ submitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet" }}
                </button>
                <nuxt-link
                  :to="`/articles/${$route.params.id}`"
                  class="block w-full text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-soft font-medium"
                >
                  İptal
                </nuxt-link>
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
import { api, Article } from "~/utils/api";
import FloatingToolbar from "~/components/FloatingToolbar.vue";
import ShimmerPlaceholder from "~/components/ShimmerPlaceholder.vue";

@Component({
  components: {
    FloatingToolbar,
    ShimmerPlaceholder,
  },
  middleware: "auth",
})
export default class EditArticlePage extends Vue {
  article: Article | null = null;
  loading = true;
  error: string | null = null;
  submitting = false;
  validationErrors: string[] = [];

  form = {
    title: "",
    summary: "",
    content: "",
    status: "Draft" as "Draft" | "Published" | "Scheduled",
    scheduledFor: "",
  };

  $refs!: {
    contentTextarea: HTMLTextAreaElement;
  };

  async fetch() {
    const id = this.$route.params.id;
    await this.loadArticle(id);
  }

  async loadArticle(id: string) {
    this.loading = true;
    this.error = null;
    try {
      this.article = await api.getArticle(id);

      // Check authorization
      if (!this.canEdit) {
        this.error = "Bu makaleyi düzenleme yetkiniz yok";
        return;
      }

      this.form = {
        title: this.article.title,
        summary: this.article.summary,
        content: this.article.content,
        status: (this.article.status as "Draft" | "Published" | "Scheduled") || "Draft",
        scheduledFor: this.article.scheduledFor
          ? new Date(this.article.scheduledFor).toISOString().slice(0, 16)
          : "",
      };
    } catch (err: any) {
      this.error = err.message || "Makale yüklenemedi";
      if (err.status === 404) {
        this.error = "Makale bulunamadı";
      }
      console.error("Error loading article:", err);
    } finally {
      this.loading = false;
    }
  }

  handleFormat(formatType: string) {
    const textarea = this.$refs.contentTextarea;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = this.form.content.substring(start, end);
    let replacement = "";

    switch (formatType) {
      case "bold":
        replacement = `**${selectedText || "bold text"}**`;
        break;
      case "italic":
        replacement = `*${selectedText || "italic text"}*`;
        break;
      case "list":
        replacement = selectedText
          ? selectedText
              .split("\n")
              .map((line) => `- ${line}`)
              .join("\n")
          : "- List item";
        break;
      case "link":
        replacement = `[${selectedText || "link text"}](url)`;
        break;
    }

    this.form.content =
      this.form.content.substring(0, start) + replacement + this.form.content.substring(end);
    this.$nextTick(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  }

  get canPublish(): boolean {
    const user = (this.$store.state as any).auth?.user;
    return user?.role === "Admin" || user?.role === "Editor";
  }

  get minScheduledDate(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  }

  formatScheduledDate(dateStr: string): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async handleSubmit() {
    this.validationErrors = [];
    
    // Validate scheduled date
    if (this.form.status === "Scheduled") {
      if (!this.form.scheduledFor) {
        this.validationErrors.push("Zamanlanmış makale için tarih seçmelisiniz");
        return;
      }
      const scheduledDate = new Date(this.form.scheduledFor);
      if (scheduledDate <= new Date()) {
        this.validationErrors.push("Zamanlanmış tarih gelecekte olmalıdır");
        return;
      }
    }

    this.submitting = true;

    try {
      const payload: any = {
        status: this.form.status,
      };
      if (this.form.title !== this.article?.title) payload.title = this.form.title;
      if (this.form.summary !== this.article?.summary) payload.summary = this.form.summary;
      if (this.form.content !== this.article?.content) payload.content = this.form.content;
      if (this.form.status === "Scheduled" && this.form.scheduledFor) {
        payload.scheduledFor = new Date(this.form.scheduledFor).toISOString();
      }

      await api.updateArticle(this.$route.params.id, payload);
      alert("Makale başarıyla güncellendi!");
      this.$router.push(`/articles/${this.$route.params.id}`);
    } catch (err: any) {
      if (err.details && Array.isArray(err.details)) {
        this.validationErrors = err.details.map((d: any) => `${d.path}: ${d.message}`);
      } else {
        this.validationErrors = [err.message || "Makale güncellenemedi"];
      }
      console.error("Error updating article:", err);
    } finally {
      this.submitting = false;
    }
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

  get canEdit() {
    if (!this.article || !this.isAuthenticated) return false;
    const isAdmin = this.$store.getters["auth/isAdmin"];
    return this.article.authorId === this.currentUserId || isAdmin;
  }

  get isAuthenticated() {
    return this.$store.getters["auth/isAuthenticated"];
  }

  get currentUserId() {
    return this.$store.state.auth.user?.id;
  }
}
</script>
