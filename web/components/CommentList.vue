<template>
  <div class="space-y-4">
    <div v-if="loading" class="text-center py-4">
      <p class="text-gray-500">Loading comments...</p>
    </div>

    <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500">
      <p>No comments yet. Be the first to comment!</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="bg-gray-50 rounded-lg p-4"
      >
        <div class="flex items-start gap-3">
          <img
            v-if="comment.user.avatarUrl"
            :src="comment.user.avatarUrl"
            :alt="comment.user.displayName || comment.user.username"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div
            v-else
            class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-600"
          >
            {{ (comment.user.displayName || comment.user.username || "U")[0].toUpperCase() }}
          </div>

          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold text-gray-900">
                {{ comment.user.displayName || comment.user.username || "User" }}
              </span>
              <span class="text-sm text-gray-500">
                {{ formatDate(comment.createdAt) }}
              </span>
            </div>
            <p class="text-gray-700">{{ comment.content }}</p>

            <div
              v-if="canEditComment(comment)"
              class="mt-2 flex gap-2"
            >
              <button
                @click="handleEdit(comment)"
                class="text-sm text-blue-600 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                @click="handleDelete(comment)"
                class="text-sm text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Comment Form -->
    <div v-if="isAuthenticated" class="mt-6">
      <form @submit.prevent="handleSubmit" class="space-y-2">
        <textarea
          v-model="newComment"
          rows="3"
          placeholder="Write a comment..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <button
          type="submit"
          :disabled="submitting"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {{ submitting ? "Posting..." : "Post Comment" }}
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
import { Component, Vue, Prop } from "nuxt-property-decorator";
import { Comment } from "~/utils/api";

@Component
export default class CommentList extends Vue {
  @Prop({ required: true }) articleId!: string;

  comments: Comment[] = [];
  loading = true;
  submitting = false;
  newComment = "";

  async mounted() {
    await this.loadComments();
  }

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
  }

  async handleSubmit() {
    if (!this.newComment.trim()) return;

    this.submitting = true;
    try {
      await this.$store.dispatch("social/addComment", {
        articleId: this.articleId,
        content: this.newComment,
      });
      this.newComment = "";
      await this.loadComments();
    } catch (err: any) {
      alert(`Failed to post comment: ${err.message}`);
    } finally {
      this.submitting = false;
    }
  }

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
  }

  handleEdit(comment: Comment) {
    // Simple inline edit - could be enhanced
    const newContent = prompt("Edit comment:", comment.content);
    if (newContent && newContent !== comment.content) {
      // Would need updateComment action
      alert("Edit functionality coming soon");
    }
  }

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
  }

  canEditComment(comment: Comment): boolean {
    if (!this.isAuthenticated) return false;
    const currentUserId = this.$store.state.auth.user?.id;
    const isAdmin = this.$store.getters["auth/isAdmin"];
    return comment.userId === currentUserId || isAdmin;
  }

  get isAuthenticated() {
    return this.$store.getters["auth/isAuthenticated"];
  }
}
</script>

