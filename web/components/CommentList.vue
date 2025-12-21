<template>
  <div class="space-y-4">
    <div v-if="loading" class="text-center py-4">
      <p class="text-gray-400">Yorumlar yükleniyor...</p>
    </div>

    <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-400">
      <p>Henüz yorum yok. İlk yorumu siz yapın!</p>
    </div>

    <div v-else class="space-y-4">
      <CommentItem
        v-for="comment in normalizedComments"
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
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-purple focus:border-transparent text-white placeholder-gray-400"
            required
            @input="handleCommentInput"
          />
        </div>
        <button
          type="submit"
          :disabled="submitting || !newComment.trim()"
          class="px-6 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {{ submitting ? "Gönderiliyor..." : "Yorum Yap" }}
        </button>
      </form>
    </div>

    <div v-else class="mt-6 text-center">
      <nuxt-link
        to="/login"
        class="text-accent-purple hover:text-purple-300 transition-soft"
      >
        Yorum yapmak için giriş yapın
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
    // Flatten nested replies into root comment's replies array
    normalizedComments(): Comment[] {
      return this.comments.map((comment) => {
        const flattened = { ...comment };
        if (comment.replies && comment.replies.length > 0) {
          // Flatten all nested replies into a single level
          flattened.replies = this.flattenReplies(comment.replies);
        }
        return flattened;
      });
    },
  },
  async mounted() {
    await this.loadComments();
    // Watch for changes in store comments
    this.$store.watch(
      (state) => state.social.comments[this.articleId],
      (newComments) => {
        if (newComments) {
          this.comments = newComments;
        }
      },
      { immediate: false }
    );
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
        // If replying to a reply, find the root comment (parentId should be root comment's id)
        let parentId: string | null = null;
        if (this.replyingTo) {
          // Find the root comment (comment without parentId)
          const rootComment = this.findRootComment(this.replyingTo);
          parentId = rootComment.id;
        }
        
        const result = await this.$store.dispatch("social/addComment", {
          articleId: this.articleId,
          content: this.newComment,
          parentId,
        });
        this.newComment = "";
        this.replyingTo = null;
        await this.loadComments();
        // Emit event to parent with updated comment count from backend
        if (result && result.articleCommentCount !== undefined) {
          this.$emit("comment-added", { commentCount: result.articleCommentCount });
        }
      } catch (err: any) {
        console.error("Comment add error:", err);
        alert(`Yorum gönderilemedi: ${err.message || err}`);
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
    // Flatten nested replies into a single level
    flattenReplies(replies: Comment[]): Comment[] {
      const flattened: Comment[] = [];
      for (const reply of replies) {
        flattened.push(reply);
        // If this reply has nested replies, flatten them too
        if (reply.replies && reply.replies.length > 0) {
          flattened.push(...this.flattenReplies(reply.replies));
        }
      }
      return flattened;
    },
    // Find the root comment (top-level comment without parentId)
    findRootComment(comment: Comment): Comment {
      // If comment has no parentId, it's already the root
      if (!comment.parentId) {
        return comment;
      }
      // Search through all comments and their replies to find the root
      for (const rootComment of this.comments) {
        if (rootComment.id === comment.parentId) {
          // Found the root comment
          return rootComment;
        }
        // Search in this root comment's replies
        const found = this.findCommentInReplies(rootComment, comment.parentId);
        if (found) {
          // Found the parent, now find its root
          return this.findRootComment(found);
        }
      }
      // Fallback: if we can't find it, assume it's a root comment
      // This shouldn't happen, but handle gracefully
      return comment;
    },
    // Helper to find a comment in nested replies
    findCommentInReplies(comment: Comment, commentId: string): Comment | null {
      if (comment.id === commentId) {
        return comment;
      }
      if (comment.replies) {
        for (const reply of comment.replies) {
          if (reply.id === commentId) {
            return reply;
          }
          const found = this.findCommentInReplies(reply, commentId);
          if (found) {
            return found;
          }
        }
      }
      return null;
    },
    handleCommentInput() {
      // Could add mention autocomplete here
    },
    async handleDelete(comment: Comment) {
      try {
        // Optimistic update: remove from local state immediately
        this.comments = this.comments.filter((c) => c.id !== comment.id);
        
        const result = await this.$store.dispatch("social/deleteComment", {
          articleId: this.articleId,
          commentId: comment.id,
        });
        
        // Reload to ensure sync with backend
        await this.loadComments();
        // Emit event to parent with updated comment count from backend
        if (result && result.commentCount !== undefined) {
          this.$emit("comment-deleted", { commentCount: result.commentCount });
        }
      } catch (err: any) {
        console.error("Comment delete error:", err);
        // Revert on error
        await this.loadComments();
        alert(`Yorum silinemedi: ${err.message || err}`);
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
