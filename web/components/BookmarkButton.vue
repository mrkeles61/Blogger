<template>
  <button
    @click="handleClick"
    :disabled="loading"
    class="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ease-in-out font-medium"
    :class="
      isBookmarked
        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 hover:shadow-md'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    "
    :aria-label="isBookmarked ? 'Remove bookmark' : 'Bookmark'"
  >
    <svg
      class="w-5 h-5 transition-transform duration-200"
      :class="{ 'scale-110': isBookmarked }"
      :fill="isBookmarked ? 'currentColor' : 'none'"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
    <span v-if="showText">{{ isBookmarked ? 'Saved' : 'Save' }}</span>
  </button>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "BookmarkButton",
  props: {
    articleId: {
      type: String,
      required: true,
    },
    showText: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    isAuthenticated(): boolean {
      return this.$store.getters["auth/isAuthenticated"];
    },
    isBookmarked(): boolean {
      return this.$store.getters["social/isBookmarked"](this.articleId);
    },
  },
  async mounted() {
    if (this.isAuthenticated) {
      await this.$store.dispatch("social/checkBookmarkStatus", this.articleId);
    }
  },
  methods: {
    async handleClick() {
      if (!this.isAuthenticated) {
        this.$router.push("/login");
        return;
      }

      this.loading = true;
      try {
        await this.$store.dispatch("social/toggleBookmark", this.articleId);
        this.$emit("bookmarked");
      } catch (err: any) {
        alert(`Failed to ${this.isBookmarked ? "unbookmark" : "bookmark"}: ${err.message}`);
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>
