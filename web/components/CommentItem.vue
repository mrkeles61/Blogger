<template>
  <div ref="commentContainer" class="comment-item" :class="{ 'ml-8': comment.parentId }">
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
                @click="showDeleteConfirm = true"
                class="text-sm text-red-600 hover:text-red-700"
              >
                Sil
              </button>
            </div>
          </div>

          <!-- Inline Delete Confirmation -->
          <transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-class="opacity-0 transform translate-y-2"
            enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-class="opacity-100 transform translate-y-0"
            leave-to-class="opacity-0 transform translate-y-2"
          >
            <div
              v-if="showDeleteConfirm"
              ref="deleteConfirmRow"
              class="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm flex items-center justify-between"
            >
              <span class="text-red-800 font-medium">Bu yorumu silmek istiyor musun?</span>
              <div class="flex items-center gap-2">
                <button
                  @click="showDeleteConfirm = false"
                  :disabled="deleting"
                  class="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-soft font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Vazgeç
                </button>
                <button
                  @click="handleDelete"
                  :disabled="deleting"
                  class="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-soft font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg
                    v-if="deleting"
                    class="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>{{ deleting ? "Siliniyor..." : "Sil" }}</span>
                </button>
              </div>
            </div>
          </transition>
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
      showDeleteConfirm: false,
      deleting: false,
    };
  },
  mounted() {
    // Add click outside listener
    if (process.client) {
      document.addEventListener("click", this.handleClickOutside);
    }
  },
  beforeDestroy() {
    // Remove click outside listener
    if (process.client) {
      document.removeEventListener("click", this.handleClickOutside);
    }
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
    handleClickOutside(event: Event) {
      // Close confirmation if clicking outside the comment container
      if (this.showDeleteConfirm && this.$refs.commentContainer) {
        const target = event.target as Node;
        const commentContainer = this.$refs.commentContainer as HTMLElement;
        
        if (commentContainer && !commentContainer.contains(target)) {
          this.showDeleteConfirm = false;
        }
      }
    },
    async handleDelete() {
      if (this.deleting) return;
      
      this.deleting = true;
      try {
        this.$emit("delete", this.comment);
        // Close confirmation after emit (parent will handle actual deletion)
        this.showDeleteConfirm = false;
      } catch (error) {
        console.error("Error deleting comment:", error);
      } finally {
        // Reset deleting state after a short delay to allow parent to process
        setTimeout(() => {
          this.deleting = false;
        }, 500);
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
