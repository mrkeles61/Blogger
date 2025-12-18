<template>
  <button
    @click="handleClick"
    :disabled="loading"
    class="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ease-in-out font-medium"
    :class="
      isLiked
        ? 'bg-red-100 text-red-600 hover:bg-red-200 hover:shadow-md'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    "
    :aria-label="isLiked ? 'Unlike' : 'Like'"
  >
    <svg
      class="w-5 h-5 transition-transform duration-200"
      :class="{ 'scale-110': isLiked }"
      :fill="isLiked ? 'currentColor' : 'none'"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
    <span>{{ likeCount }}</span>
  </button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "nuxt-property-decorator";

@Component
export default class LikeButton extends Vue {
  @Prop({ required: true }) articleId!: string;
  @Prop({ default: 0 }) likeCount!: number;

  loading = false;

  async mounted() {
    if (this.isAuthenticated) {
      await this.$store.dispatch("social/checkLikeStatus", this.articleId);
    }
  }

  async handleClick() {
    if (!this.isAuthenticated) {
      this.$router.push("/login");
      return;
    }

    this.loading = true;
    try {
      await this.$store.dispatch("social/toggleLike", this.articleId);
      this.$emit("liked");
    } catch (err: any) {
      alert(`Failed to ${this.isLiked ? "unlike" : "like"}: ${err.message}`);
    } finally {
      this.loading = false;
    }
  }

  get isAuthenticated() {
    return this.$store.getters["auth/isAuthenticated"];
  }

  get isLiked() {
    return this.$store.getters["social/isLiked"](this.articleId);
  }
}
</script>

