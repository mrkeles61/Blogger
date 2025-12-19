<template>
  <div class="comment-item" :class="{ 'ml-8': comment.parentId }">
    <div class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-soft">
      <div class="flex items-start gap-3">
        <img
          v-if="comment.user?.avatarUrl"
          :src="comment.user.avatarUrl"
          :alt="comment.user.displayName || comment.user.username"
          class="w-10 h-10 rounded-full object-cover"
        />
        <div
          v-else
          class="w-10 h-10 rounded-full bg-gradient-shift flex items-center justify-center text-sm font-semibold text-white"
        >
          {{ (comment.user?.displayName || comment.user?.username || "U")[0].toUpperCase() }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="font-semibold text-gray-900">
              {{ comment.user?.displayName || comment.user?.username || "User" }}
            </span>
            <span class="text-sm text-gray-500">
              {{ formatDate(comment.createdAt) }}
            </span>
            <span
              v-if="comment.parentId"
              class="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full"
            >
              Yanıt
            </span>
          </div>
          <p class="text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>

          <div class="mt-3 flex items-center gap-3">
            <button
              v-if="isAuthenticated"
              @click="$emit('reply', comment)"
              class="text-sm text-gray-600 hover:text-accent-orange transition-soft flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Yanıtla
            </button>
            <button
              v-if="!comment.parentId && isAuthenticated"
              @click="showReportModal = true"
              class="text-sm text-gray-600 hover:text-red-600 transition-soft"
            >
              Raporla
            </button>
            <div v-if="canEditComment" class="ml-auto flex gap-2">
              <button
                @click="$emit('edit', comment)"
                class="text-sm text-blue-600 hover:text-blue-700"
              >
                Düzenle
              </button>
              <button
                @click="handleDelete"
                class="text-sm text-red-600 hover:text-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Nested Replies -->
    <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 space-y-3">
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :article-id="articleId"
        :current-user-id="currentUserId"
        :is-admin="isAdmin"
        @reply="$emit('reply', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>

    <!-- Report Modal -->
    <div
      v-if="showReportModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showReportModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Yorumu Raporla</h2>
        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 mb-2">Sebep</label>
          <textarea
            v-model="reportReason"
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue"
            placeholder="Lütfen raporlama sebebinizi belirtin..."
          />
        </div>
        <div class="flex gap-3">
          <button
            @click="submitReport"
            :disabled="!reportReason || reporting"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-soft font-medium disabled:opacity-50"
          >
            {{ reporting ? "Gönderiliyor..." : "Raporla" }}
          </button>
          <button
            @click="showReportModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-soft"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { Comment } from "~/utils/api";

export default Vue.extend({
  name: "CommentItem",
  props: {
    comment: {
      type: Object as PropType<Comment & { replies?: Comment[] }>,
      required: true,
    },
    articleId: {
      type: String,
      required: true,
    },
    currentUserId: {
      type: String,
      default: undefined,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showReportModal: false,
      reportReason: "",
      reporting: false,
    };
  },
  computed: {
    canEditComment(): boolean {
      if (!this.currentUserId) return false;
      return this.comment.userId === this.currentUserId || this.isAdmin;
    },
    isAuthenticated(): boolean {
      return !!this.currentUserId;
    },
  },
  methods: {
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Az önce";
      if (diffMins < 60) return `${diffMins} dakika önce`;
      if (diffHours < 24) return `${diffHours} saat önce`;
      if (diffDays < 7) return `${diffDays} gün önce`;
      return date.toLocaleDateString("tr-TR");
    },
    handleDelete() {
      if (confirm("Bu yorumu silmek istediğinizden emin misiniz?")) {
        this.$emit("delete", this.comment);
      }
    },
    async submitReport() {
      if (!this.reportReason) return;

      this.reporting = true;
      try {
        const response = await fetch(
          `${process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000"}/api/reports`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              type: "Comment",
              itemId: this.comment.id,
              reason: this.reportReason,
            }),
          }
        );

        if (response.ok) {
          alert("Rapor başarıyla gönderildi");
          this.showReportModal = false;
          this.reportReason = "";
        }
      } catch (err) {
        console.error("Error submitting report:", err);
      } finally {
        this.reporting = false;
      }
    },
  },
});
</script>
