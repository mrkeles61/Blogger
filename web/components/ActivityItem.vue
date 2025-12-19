<template>
  <div class="flex gap-4 relative">
    <!-- Timeline Line -->
    <div class="flex flex-col items-center">
      <div class="w-10 h-10 rounded-full flex items-center justify-center bg-accent-orange text-white z-10">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <div class="absolute top-10 left-5 w-0.5 h-full bg-gray-200"></div>
    </div>

    <!-- Content -->
    <div class="flex-1 pb-8">
      <div class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-soft">
        <div class="flex items-center gap-2 mb-2">
          <nuxt-link
            :to="`/users/${activity.user.id}`"
            class="font-semibold text-gray-900 hover:text-accent-orange transition-soft"
          >
            {{ activity.user.displayName || activity.user.username || "User" }}
          </nuxt-link>
          <span class="text-gray-600">{{ activityText }}</span>
        </div>
        <p class="text-sm text-gray-500">
          {{ formatDate(activity.createdAt) }}
        </p>
        <nuxt-link
          v-if="activity.entityId && showArticleLink"
          :to="`/articles/${activity.entityId}`"
          class="mt-2 inline-block text-accent-blue hover:underline text-sm"
        >
          View article →
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { ActivityLog } from "~/utils/api";

export default Vue.extend({
  name: "ActivityItem",
  props: {
    activity: {
      type: Object as PropType<ActivityLog>,
      required: true,
    },
    showArticleLink: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    activityText(): string {
      const typeMap: Record<string, string> = {
        article_created: "created an article",
        article_liked: "liked an article",
        comment_added: "commented on an article",
        article_bookmarked: "bookmarked an article",
        user_followed: "started following a user",
      };
      return typeMap[this.activity.type] || "performed an action";
    },
  },
  methods: {
    getActivityIconBg(type: string): string {
      const bgMap: Record<string, string> = {
        article_created: "bg-blue-100 text-blue-600",
        article_liked: "bg-red-100 text-red-600",
        comment_added: "bg-green-100 text-green-600",
        article_bookmarked: "bg-yellow-100 text-yellow-600",
        user_followed: "bg-purple-100 text-purple-600",
      };
      return bgMap[type] || "bg-gray-100 text-gray-600";
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
  },
});
</script>

