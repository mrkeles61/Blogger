<template>
  <div class="space-y-4">
    <div v-if="loading" class="text-center py-4">
      <p class="text-gray-500">Loading comments...</p>
    </div>

    <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500">
      <p>No comments yet. Be the first to comment!</p>
    </div>

    <div v-else class="space-y-4">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :article-id="articleId"
        :current-user-id="currentUserId"
        :is-admin="isAdmin"
        @reply="handleReply"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- Add Comment Form -->
    <div v-if="isAuthenticated" class="mt-6">
      <form @submit.prevent="handleSubmit" class="space-y-2">
        <div class="relative">
          <textarea
            v-model="newComment"
            ref="commentTextarea"
            rows="3"
            placeholder="Yorum yazın... (@ ile kullanıcıları bahsedin)"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            required
            @input="handleCommentInput"
          />
        </div>
        <button
          type="submit"
          :disabled="submitting || !newComment.trim()"
          class="px-6 py-2 bg-gradient-to-r from-accent-orange to-accent-blue text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {{ submitting ? "Gönderiliyor..." : "Yorum Yap" }}
        </button>
      </form>
    </div>

    <div v-else class="mt-6 text-center">
      <nuxt-link
        to="/login"
        class="text-blue-600 hover:text-blue-700"
      >
        Login to comment
      </nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { Comment } from "~/utils/api";
import CommentItem from "~/components/CommentItem.vue";

export default Vue.extend({
  name: "CommentList",
  components: {
    CommentItem,
  },
  props: {
    articleId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      comments: [] as Comment[],
      loading: true,
      submitting: false,
      newComment: "",
      replyingTo: null as Comment | null,
      editingComment: null as Comment | null,
    };
  },
  computed: {
    isAuthenticated(): boolean {
      return this.$store.getters["auth/isAuthenticated"];
    },
    currentUserId(): string | undefined {
      return this.$store.state.auth.user?.id;
    },
    isAdmin(): boolean {
      return this.$store.getters["auth/isAdmin"];
    },
  },
  async mounted() {
    await this.loadComments();
  },
  methods: {
    async loadComments() {
      this.loading = true;
      try {
        await this.$store.dispatch("social/loadComments", this.articleId);
        this.comments = this.$store.getters["social/getComments"](this.articleId);
      } catch (err: any) {
        console.error("Failed to load comments:", err);
      } finally {
        this.loading = false;
      }
    },
    async handleSubmit() {
      if (!this.newComment.trim()) return;

      this.submitting = true;
      try {
        const parentId = this.replyingTo?.id || null;
        await this.$store.dispatch("social/addComment", {
          articleId: this.articleId,
          content: this.newComment,
          parentId,
        });
        this.newComment = "";
        this.replyingTo = null;
        await this.loadComments();
      } catch (err: any) {
        alert(`Yorum gönderilemedi: ${err.message}`);
      } finally {
        this.submitting = false;
      }
    },
    handleReply(comment: Comment) {
      this.replyingTo = comment;
      this.newComment = `@${comment.user.username || comment.user.displayName} `;
      this.$nextTick(() => {
        const textarea = this.$refs.commentTextarea as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
      });
    },
    handleCommentInput() {
      // Could add mention autocomplete here
    },
    async handleDelete(comment: Comment) {
      if (!confirm("Are you sure you want to delete this comment?")) return;

      try {
        await this.$store.dispatch("social/deleteComment", {
          articleId: this.articleId,
          commentId: comment.id,
        });
        await this.loadComments();
      } catch (err: any) {
        alert(`Failed to delete comment: ${err.message}`);
      }
    },
    handleEdit(comment: Comment) {
      // Simple inline edit - could be enhanced
      const newContent = prompt("Edit comment:", comment.content);
      if (newContent && newContent !== comment.content) {
        // Would need updateComment action
        alert("Edit functionality coming soon");
      }
    },
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    },
    canEditComment(comment: Comment): boolean {
      if (!this.isAuthenticated) return false;
      const currentUserId = this.$store.state.auth.user?.id;
      const isAdmin = this.$store.getters["auth/isAdmin"];
      return comment.userId === currentUserId || isAdmin;
    },
  },
});
</script>
