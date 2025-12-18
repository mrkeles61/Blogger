<template>
  <div class="min-h-screen bg-gray-50 font-inter">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <nuxt-link
          to="/"
          class="text-gray-600 hover:text-accent-orange transition-soft inline-flex items-center gap-2 mb-4"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Ana Sayfaya Dön
        </nuxt-link>
        <h1 class="text-3xl font-playfair font-bold text-gray-900">Yeni Makale Oluştur</h1>
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
                  Başlık (8-120 karakter)
                </label>
                <input
                  id="title"
                  v-model="form.title"
                  type="text"
                  required
                  minlength="8"
                  maxlength="120"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-soft text-lg font-medium"
                  placeholder="Makale başlığını girin"
                />
                <p class="mt-1 text-sm text-gray-500">{{ form.title.length }}/120 karakter</p>
              </div>

              <!-- Summary -->
              <div>
                <label for="summary" class="block text-sm font-semibold text-gray-700 mb-2">
                  Özet (20-280 karakter)
                </label>
                <textarea
                  id="summary"
                  v-model="form.summary"
                  rows="3"
                  required
                  minlength="20"
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

            <!-- Status Toggle -->
            <div class="mb-6">
              <label class="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-soft">
                <div>
                  <span class="block font-semibold text-gray-900">Yayınla</span>
                  <span class="text-sm text-gray-600">Makaleyi hemen yayınla</span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="publishNow"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-orange peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-orange"></div>
                </label>
              </label>
            </div>

            <!-- Publish Date Preview -->
            <div v-if="publishNow" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-sm text-green-800">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Makale yayınlanacak: {{ formatPublishDate() }}
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <button
                @click="handleSubmit"
                :disabled="submitting"
                class="w-full px-6 py-3 bg-gradient-to-r from-accent-orange to-accent-blue text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {{ submitting ? "Kaydediliyor..." : publishNow ? "Yayınla" : "Taslak Olarak Kaydet" }}
              </button>
              <nuxt-link
                to="/"
                class="block w-full text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-soft font-medium"
              >
                İptal
              </nuxt-link>
            </div>

            <!-- Draft Info -->
            <div v-if="!publishNow" class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p class="text-sm text-yellow-800">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Makale taslak olarak kaydedilecek ve yayınlanmayacak.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import { api } from "~/utils/api";
import FloatingToolbar from "~/components/FloatingToolbar.vue";

@Component({
  components: {
    FloatingToolbar,
  },
  middleware: "auth",
})
export default class NewArticlePage extends Vue {
  form = {
    title: "",
    summary: "",
    content: "",
  };
  publishNow = false;
  submitting = false;
  validationErrors: string[] = [];

  $refs!: {
    contentTextarea: HTMLTextAreaElement;
  };

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

  async handleSubmit() {
    this.validationErrors = [];
    this.submitting = true;

    try {
      const payload = {
        title: this.form.title,
        summary: this.form.summary,
        content: this.form.content,
        publishedAt: this.publishNow ? new Date().toISOString() : null,
      };

      const article = await api.createArticle(payload);
      alert("Makale başarıyla oluşturuldu!");
      this.$router.push(`/articles/${article.id}`);
    } catch (err: any) {
      if (err.details && Array.isArray(err.details)) {
        this.validationErrors = err.details.map((d: any) => `${d.path}: ${d.message}`);
      } else {
        this.validationErrors = [err.message || "Makale oluşturulamadı"];
      }
      console.error("Error creating article:", err);
    } finally {
      this.submitting = false;
    }
  }

  formatPublishDate(): string {
    return new Date().toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
</script>
