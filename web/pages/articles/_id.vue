<template>
  <div class="min-h-screen bg-gray-50 font-inter">
    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid gap-8 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
          <ShimmerPlaceholder class="h-96 rounded-xl" />
          <ShimmerPlaceholder class="h-64 rounded-xl" />
        </div>
        <div class="lg:col-span-1">
          <ShimmerPlaceholder class="h-96 rounded-xl" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-800 font-medium mb-4">{{ error }}</p>
        <nuxt-link
          to="/"
          class="inline-block px-6 py-3 bg-accent-orange text-white rounded-full font-semibold hover:bg-opacity-90 transition-soft"
        >
          ← Ana Sayfaya Dön
        </nuxt-link>
      </div>
    </div>

    <!-- Article Content -->
    <div v-else-if="article" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid gap-8 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Hero Section -->
          <section class="relative bg-gradient-to-r from-accent-orange to-accent-blue rounded-2xl overflow-hidden shadow-xl">
            <div class="absolute inset-0 z-0 opacity-10">
              <svg class="w-full h-full" fill="none" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                <pattern id="pattern-hero" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="1" fill="rgba(255,255,255,0.2)" />
                </pattern>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-hero)" />
              </svg>
            </div>
            <div class="relative z-10 p-8 md:p-12 text-white">
              <div class="mb-4">
                <span
                  v-if="article.publishedAt"
                  class="inline-block px-4 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-sm font-medium"
                >
                  Yayınlandı {{ formatDate(article.publishedAt) }}
                </span>
                <span
                  v-else
                  class="inline-block px-4 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-sm font-medium"
                >
                  Taslak
                </span>
              </div>
              <h1 class="text-4xl md:text-5xl font-playfair font-bold mb-4 leading-tight">
                {{ article.title }}
              </h1>
              <p class="text-xl md:text-2xl opacity-90 mb-6">{{ article.summary }}</p>
              
              <!-- Metadata Row -->
              <div class="flex flex-wrap items-center gap-4 text-sm opacity-90">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ formatDateTime(article.createdAt) }}</span>
                </div>
                <div v-if="article._count" class="flex items-center gap-4">
                  <span class="flex items-center gap-1">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    {{ article._count.likes || 0 }}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {{ article._count.comments || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <!-- Action Buttons -->
          <div class="flex flex-wrap items-center gap-4 bg-white rounded-xl shadow-sm p-6">
            <LikeButton :article-id="article.id" :like-count="article._count?.likes || 0" />
            <BookmarkButton :article-id="article.id" />
            <div v-if="canEdit" class="flex gap-2 ml-auto">
              <nuxt-link
                :to="`/articles/${article.id}/edit`"
                class="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-opacity-90 transition-soft font-medium"
              >
                Düzenle
              </nuxt-link>
              <button
                @click="handleDelete"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-soft font-medium"
              >
                Sil
              </button>
            </div>
          </div>

          <!-- Article Content -->
          <article class="bg-white rounded-xl shadow-sm p-8 md:p-12 prose prose-lg max-w-none">
            <div class="whitespace-pre-wrap text-gray-800 leading-relaxed">{{ article.content }}</div>
          </article>

          <!-- Author Spotlight Card -->
          <div v-if="article.author" class="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div class="flex flex-col md:flex-row items-start gap-6">
              <div class="flex-shrink-0">
                <img
                  v-if="article.author.avatarUrl"
                  :src="article.author.avatarUrl"
                  :alt="article.author.displayName || article.author.username"
                  class="w-24 h-24 rounded-full object-cover ring-4 ring-accent-orange ring-opacity-20"
                />
                <div
                  v-else
                  class="w-24 h-24 rounded-full bg-gradient-to-r from-accent-orange to-accent-blue flex items-center justify-center text-3xl font-bold text-white ring-4 ring-accent-orange ring-opacity-20"
                >
                  {{ (article.author.displayName || article.author.username || "U")[0].toUpperCase() }}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <nuxt-link
                    :to="`/users/${article.author.id}`"
                    class="text-2xl font-playfair font-bold text-gray-900 hover:text-accent-orange transition-soft"
                  >
                    {{ article.author.displayName || article.author.username || "User" }}
                  </nuxt-link>
                  <span
                    v-if="article.author.isVerified"
                    class="text-accent-blue"
                    title="Doğrulanmış"
                  >
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
                <p v-if="article.author.username" class="text-gray-600 mb-2">@{{ article.author.username }}</p>
                <p v-if="article.author.headline" class="text-lg text-gray-700 mb-3 font-medium">
                  {{ article.author.headline }}
                </p>
                <p v-if="article.author.bio" class="text-gray-600 mb-4">{{ article.author.bio }}</p>
                <div class="flex flex-wrap items-center gap-4">
                  <FollowButton
                    :user-id="article.author.id"
                    :is-own-profile="article.author.id === currentUserId"
                  />
                  <button
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-soft font-medium"
                    disabled
                  >
                    Mesaj
                  </button>
                  <span
                    v-if="article.author.role === 'Admin'"
                    class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    Admin
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <div class="bg-white rounded-xl shadow-sm p-8">
            <h2 class="text-2xl font-playfair font-bold mb-6">Yorumlar ({{ article._count?.comments || 0 }})</h2>
            <CommentList :article-id="article.id" />
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="lg:col-span-1 space-y-6">
          <!-- Sticky Container -->
          <div class="lg:sticky lg:top-24 space-y-6">
            <!-- Related Articles -->
            <div v-if="relatedArticles.length > 0" class="bg-white rounded-xl shadow-sm p-6">
              <h3 class="text-xl font-playfair font-bold mb-4 text-gray-900">İlgili Makaleler</h3>
              <div class="space-y-4">
                <article
                  v-for="relatedArticle in relatedArticles.slice(0, 3)"
                  :key="relatedArticle.id"
                  class="group cursor-pointer"
                >
                  <nuxt-link :to="`/articles/${relatedArticle.id}`" class="block">
                    <h4 class="font-semibold text-gray-900 mb-1 group-hover:text-accent-orange transition-soft line-clamp-2">
                      {{ relatedArticle.title }}
                    </h4>
                    <p class="text-sm text-gray-600 line-clamp-2 mb-2">{{ relatedArticle.summary }}</p>
                    <div class="flex items-center gap-2 text-xs text-gray-500">
                      <span>{{ formatDate(relatedArticle.publishedAt || relatedArticle.createdAt) }}</span>
                      <span>•</span>
                      <span>{{ relatedArticle._count?.likes || 0 }} beğeni</span>
                    </div>
                  </nuxt-link>
                </article>
              </div>
            </div>

            <!-- Author Stats Card -->
            <div v-if="article.author" class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 class="text-xl font-playfair font-bold mb-4 text-gray-900">Yazar Hakkında</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Makaleler</span>
                  <span class="font-semibold text-gray-900">{{ article.author.articlesCount || 0 }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Takipçiler</span>
                  <span class="font-semibold text-gray-900">{{ article.author.followersCount || 0 }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Takip Edilen</span>
                  <span class="font-semibold text-gray-900">{{ article.author.followingCount || 0 }}</span>
                </div>
                <nuxt-link
                  :to="`/users/${article.author.id}`"
                  class="block mt-4 text-center px-4 py-2 bg-accent-orange text-white rounded-lg hover:bg-opacity-90 transition-soft font-medium"
                >
                  Profili Görüntüle
                </nuxt-link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import { api, Article } from "~/utils/api";
import LikeButton from "~/components/LikeButton.vue";
import BookmarkButton from "~/components/BookmarkButton.vue";
import FollowButton from "~/components/FollowButton.vue";
import CommentList from "~/components/CommentList.vue";
import ShimmerPlaceholder from "~/components/ShimmerPlaceholder.vue";

@Component({
  components: {
    LikeButton,
    BookmarkButton,
    FollowButton,
    CommentList,
    ShimmerPlaceholder,
  },
})
export default class ArticleDetailPage extends Vue {
  article: Article | null = null;
  relatedArticles: Article[] = [];
  loading = true;
  error: string | null = null;

  async fetch() {
    const id = this.$route.params.id;
    await this.loadArticle(id);
  }

  async loadArticle(id: string) {
    this.loading = true;
    this.error = null;
    try {
      this.article = await api.getArticle(id);
      if (this.article && this.article.authorId && this.isAuthenticated) {
        await this.$store.dispatch("social/checkBookmarkStatus", id);
      }
      // Load related articles by same author
      if (this.article?.authorId) {
        const result = await api.getArticles(undefined, this.article.authorId);
        this.relatedArticles = result.items.filter((a) => a.id !== id).slice(0, 5);
      }
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

  async handleDelete() {
    if (!this.article) return;

    if (!confirm("Bu makaleyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await api.deleteArticle(this.article.id);
      alert("Makale başarıyla silindi");
      this.$router.push("/");
    } catch (err: any) {
      alert(`Makale silinemedi: ${err.message}`);
      console.error("Error deleting article:", err);
    }
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  get isAuthenticated() {
    return this.$store.getters["auth/isAuthenticated"];
  }

  get currentUserId() {
    return this.$store.state.auth.user?.id;
  }

  get canEdit() {
    if (!this.article || !this.isAuthenticated) return false;
    const isAdmin = this.$store.getters["auth/isAdmin"];
    return this.article.authorId === this.currentUserId || isAdmin;
  }
}
</script>

<style scoped>
.prose {
  @apply text-gray-800;
}

.prose p {
  @apply mb-4;
}
</style>
