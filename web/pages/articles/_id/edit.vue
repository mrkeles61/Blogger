<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nuxt-link
          :to="`/articles/${$route.params.id}`"
          class="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to article
        </nuxt-link>
        <h1 class="text-3xl font-bold text-gray-900">Edit Article</h1>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500">Loading article...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <p class="text-red-800">{{ error }}</p>
        <nuxt-link
          to="/"
          class="inline-block mt-4 text-blue-600 hover:text-blue-700"
        >
          ← Back to articles
        </nuxt-link>
      </div>

      <div v-else-if="!canEdit" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p class="text-yellow-800 mb-4">You are not authorized to edit this article.</p>
        <nuxt-link
          :to="`/articles/${$route.params.id}`"
          class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          View Article
        </nuxt-link>
      </div>

      <div v-else-if="canEdit" class="bg-white rounded-lg shadow p-6">
        <div v-if="validationErrors.length > 0" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 class="font-semibold text-red-800 mb-2">Validation Errors:</h3>
          <ul class="list-disc list-inside text-red-700">
            <li v-for="error in validationErrors" :key="error">{{ error }}</li>
          </ul>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
              Title (8-120 characters)
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              minlength="8"
              maxlength="120"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter article title"
            />
          </div>

          <div>
            <label for="summary" class="block text-sm font-medium text-gray-700 mb-1">
              Summary (20-280 characters)
            </label>
            <textarea
              id="summary"
              v-model="form.summary"
              rows="3"
              required
              minlength="20"
              maxlength="280"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter article summary"
            />
            <p class="mt-1 text-sm text-gray-500">{{ form.summary.length }}/280 characters</p>
          </div>

          <div>
            <label for="content" class="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              v-model="form.content"
              rows="10"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter article content"
            />
          </div>

          <div>
            <label class="flex items-center">
              <input
                v-model="form.publishedAt"
                type="checkbox"
                :true-value="new Date().toISOString()"
                :false-value="null"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">
                {{ form.publishedAt ? "Published" : "Draft" }}
              </span>
            </label>
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="submitting"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? "Saving..." : "Save Changes" }}
            </button>
            <nuxt-link
              :to="`/articles/${$route.params.id}`"
              class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition inline-block"
            >
              Cancel
            </nuxt-link>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import { api, Article } from "~/utils/api";

@Component({
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
    publishedAt: null as string | null,
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
        this.error = "Not authorized to edit this article";
        return;
      }

      this.form = {
        title: this.article.title,
        summary: this.article.summary,
        content: this.article.content,
        publishedAt: this.article.publishedAt,
      };
    } catch (err: any) {
      this.error = err.message || "Failed to load article";
      if (err.status === 404) {
        this.error = "Article not found";
      }
      console.error("Error loading article:", err);
    } finally {
      this.loading = false;
    }
  }

  async handleSubmit() {
    this.validationErrors = [];
    this.submitting = true;

    try {
      const payload: any = {};
      if (this.form.title !== this.article?.title) payload.title = this.form.title;
      if (this.form.summary !== this.article?.summary) payload.summary = this.form.summary;
      if (this.form.content !== this.article?.content) payload.content = this.form.content;
      if (this.form.publishedAt !== this.article?.publishedAt) {
        payload.publishedAt = this.form.publishedAt;
      }

      await api.updateArticle(this.$route.params.id, payload);
      alert("Article updated successfully!");
      this.$router.push(`/articles/${this.$route.params.id}`);
    } catch (err: any) {
      if (err.details && Array.isArray(err.details)) {
        this.validationErrors = err.details.map((d: any) => `${d.path}: ${d.message}`);
      } else {
        this.validationErrors = [err.message || "Failed to update article"];
      }
      console.error("Error updating article:", err);
    } finally {
      this.submitting = false;
    }
  }
}
</script>
