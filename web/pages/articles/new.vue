<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="!isAuthenticated || !isAdmin" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p class="text-yellow-800 mb-4">You must be logged in as an admin to create articles.</p>
        <nuxt-link
          to="/login"
          class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </nuxt-link>
      </div>
    </div>
    <div v-else>
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nuxt-link
          to="/"
          class="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to articles
        </nuxt-link>
        <h1 class="text-3xl font-bold text-gray-900">Create New Article</h1>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow p-6">
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
                v-model="publishNow"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">Publish immediately</span>
            </label>
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="submitting"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? "Creating..." : "Create Article" }}
            </button>
            <nuxt-link
              to="/"
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
import { api } from "~/utils/api";

@Component
export default class NewArticlePage extends Vue {
  form = {
    title: "",
    summary: "",
    content: "",
  };
  publishNow = false;
  submitting = false;
  validationErrors: string[] = [];

  get isAuthenticated() {
    return this.$store.getters["auth/isAuthenticated"];
  }

  get isAdmin() {
    return this.$store.getters["auth/isAdmin"];
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
      alert("Article created successfully!");
      this.$router.push(`/articles/${article.id}`);
    } catch (err: any) {
      if (err.details && Array.isArray(err.details)) {
        this.validationErrors = err.details.map((d: any) => `${d.path}: ${d.message}`);
      } else {
        this.validationErrors = [err.message || "Failed to create article"];
      }
      console.error("Error creating article:", err);
    } finally {
      this.submitting = false;
    }
  }
}
</script>
