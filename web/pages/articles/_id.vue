<template>
  <div class="min-h-screen bg-gray-900 font-inter">
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
      <div class="bg-red-900 bg-opacity-20 border border-red-500 rounded-xl p-6 text-center">
        <p class="text-red-400 font-medium mb-4">{{ error }}</p>
        <nuxt-link
          to="/"
          class="inline-block px-6 py-3 bg-accent-purple text-white rounded-full font-semibold hover:bg-purple-700 transition-soft"
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
          <section class="relative bg-gradient-to-r from-purple-900 via-purple-800 to-blue-900 rounded-2xl overflow-hidden shadow-xl border border-purple-700 border-opacity-30">
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
          <div class="flex flex-wrap items-center gap-4 bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700">
            <LikeButton 
              :article-id="article.id" 
              :like-count="article._count?.likes || 0" 
              @liked="handleLikeUpdate"
            />
            <BookmarkButton :article-id="article.id" />
            <div class="flex gap-2 ml-auto">
              <button
                v-if="!canEdit && isAuthenticated"
                @click="showReportModal = true"
                class="px-4 py-2 text-gray-400 hover:text-red-400 transition-soft font-medium flex items-center gap-2"
                title="Raporla"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Raporla
              </button>
              <div v-if="canEdit" class="flex gap-2">
                <nuxt-link
                  :to="`/articles/${article.id}/edit`"
                  class="px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-soft font-medium"
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
          </div>

          <!-- Report Modal -->
          <div
            v-if="showReportModal"
            class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            @click.self="showReportModal = false"
          >
            <div class="bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-700">
              <h2 class="text-2xl font-playfair font-bold text-white mb-4">Makaleyi Raporla</h2>
              <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-300 mb-2">Sebep</label>
                <textarea
                  v-model="reportReason"
                  rows="4"
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-purple focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Lütfen raporlama sebebinizi belirtin..."
                />
              </div>
              <div class="flex gap-3">
                <button
                  @click="submitReport"
                  :disabled="!reportReason || reporting"
                  class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-soft font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ reporting ? "Gönderiliyor..." : "Raporla" }}
                </button>
                <button
                  @click="showReportModal = false"
                  class="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-soft font-medium"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>

          <!-- Article Content -->
          <article class="bg-gray-800 rounded-xl shadow-sm p-8 md:p-12 prose prose-lg max-w-none border border-gray-700">
            <div class="whitespace-pre-wrap text-gray-200 leading-relaxed">{{ article.content }}</div>
          </article>

          <!-- Author Spotlight Card -->
          <div v-if="article && article.author" class="bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-700">
            <div class="flex flex-col md:flex-row items-start gap-6">
              <div class="flex-shrink-0">
                <img
                  v-if="article.author.avatarUrl"
                  :src="article.author.avatarUrl"
                  :alt="article.author.displayName || article.author.username"
                  class="w-24 h-24 rounded-full object-cover ring-4 ring-accent-purple ring-opacity-30"
                />
                <div
                  v-else
                  class="w-24 h-24 rounded-full bg-gradient-to-r from-accent-purple to-accent-blue flex items-center justify-center text-3xl font-bold text-white ring-4 ring-accent-purple ring-opacity-30"
                >
                  {{ (article.author.displayName || article.author.username || "U")[0].toUpperCase() }}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <nuxt-link
                    :to="`/users/${article.author.id}`"
                    class="text-2xl font-playfair font-bold text-white hover:text-accent-purple transition-soft"
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
                <p v-if="article.author.username" class="text-gray-400 mb-2">@{{ article.author.username }}</p>
                <p v-if="article.author.headline" class="text-lg text-white mb-3 font-medium">
                  {{ article.author.headline }}
                </p>
                <p v-if="article.author.bio" class="text-gray-300 mb-4">{{ article.author.bio }}</p>
                <div class="flex flex-wrap items-center gap-4">
                  <FollowButton
                    :user-id="article.author.id"
                    :is-own-profile="article.author.id === currentUserId"
                  />
                  <button
                    class="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-soft font-medium"
                    disabled
                  >
                    Mesaj
                  </button>
                  <span
                    v-if="article.author.role === 'Admin'"
                    class="px-3 py-1 bg-purple-900 bg-opacity-30 text-purple-300 rounded-full text-sm font-medium border border-purple-700"
                  >
                    Admin
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <div class="bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-700">
            <h2 class="text-2xl font-playfair font-bold mb-6 text-white">Yorumlar ({{ article._count?.comments || 0 }})</h2>
            <CommentList 
              :article-id="article.id" 
              @comment-added="handleCommentAdded"
              @comment-deleted="handleCommentDeleted"
            />
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="lg:col-span-1 space-y-6">
          <!-- Sticky Container -->
          <div class="lg:sticky lg:top-24 space-y-6">
            <!-- Related Articles -->
            <div v-if="relatedArticles.length > 0" class="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700">
              <h3 class="text-xl font-playfair font-bold mb-4 text-white">İlgili Makaleler</h3>
              <div class="space-y-4">
                <article
                  v-for="relatedArticle in relatedArticles.slice(0, 3)"
                  :key="relatedArticle.id"
                  class="group cursor-pointer"
                >
                  <nuxt-link :to="`/articles/${relatedArticle.id}`" class="block">
                    <h4 class="font-semibold text-white mb-1 group-hover:text-accent-purple transition-soft line-clamp-2">
                      {{ relatedArticle.title }}
                    </h4>
                    <p class="text-sm text-gray-400 line-clamp-2 mb-2">{{ relatedArticle.summary }}</p>
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
            <div v-if="article && article.author" class="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700">
              <h3 class="text-xl font-playfair font-bold mb-4 text-white">Yazar Hakkında</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">Makaleler</span>
                  <span class="font-semibold text-white">{{ article.author.articlesCount || 0 }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">Takipçiler</span>
                  <span class="font-semibold text-white">{{ article.author.followersCount || 0 }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">Takip Edilen</span>
                  <span class="font-semibold text-white">{{ article.author.followingCount || 0 }}</span>
                </div>
                <nuxt-link
                  :to="`/users/${article.author.id}`"
                  class="block mt-4 text-center px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-soft font-medium"
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
  showReportModal = false;
  reportReason = "";
  reporting = false;

  async fetch() {
    const id = this.$route.params.id;
    await this.loadArticle(id);
  }

  async loadArticle(id: string) {
    this.loading = true;
    this.error = null;
    try {
      this.article = await api.getArticle(id);
      console.log("[DEBUG] Article loaded, comment count from backend:", this.article?._count?.comments);
      console.log("[DEBUG] Full article _count:", this.article?._count);
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

  async submitReport() {
    if (!this.reportReason || !this.article) return;

    this.reporting = true;
    try {
      const response = await fetch(
        `${process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000"}/api/reports`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            type: "Article",
            itemId: this.article.id,
            reason: this.reportReason,
          }),
        }
      );

      if (response.ok) {
        alert("Rapor başarıyla gönderildi");
        this.showReportModal = false;
        this.reportReason = "";
      } else {
        const error = await response.json();
        alert(error.message || "Rapor gönderilemedi");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("Rapor gönderilirken bir hata oluştu");
    } finally {
      this.reporting = false;
    }
  }

  get canEdit() {
    if (!this.article || !this.isAuthenticated) return false;
    const isAdmin = this.$store.getters["auth/isAdmin"];
    return this.article.authorId === this.currentUserId || isAdmin;
  }

  handleLikeUpdate(payload: { articleId: string; likeCount: number }) {
    // Update article like count in real-time
    if (this.article && this.article.id === payload.articleId) {
      if (!this.article._count) {
        this.$set(this.article, '_count', { likes: 0, comments: 0 });
      }
      this.$set(this.article._count, 'likes', payload.likeCount);
    }
  }

  handleCommentAdded(payload?: { commentCount?: number }) {
    // Update comment count from backend response
    if (this.article && payload?.commentCount !== undefined) {
      if (!this.article._count) {
        this.$set(this.article, '_count', { likes: 0, comments: 0 });
      }
      this.$set(this.article._count, 'comments', payload.commentCount);
    }
  }

  handleCommentDeleted(payload?: { commentCount?: number }) {
    // Update comment count from backend response
    if (this.article && payload?.commentCount !== undefined) {
      if (!this.article._count) {
        this.$set(this.article, '_count', { likes: 0, comments: 0 });
      }
      this.$set(this.article._count, 'comments', payload.commentCount);
    }
  }
}
</script>

<style scoped>
.prose {
  @apply text-gray-200;
}

.prose p {
  @apply mb-4;
}
</style>
