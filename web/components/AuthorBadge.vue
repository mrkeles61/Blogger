<template>
  <div class="flex items-center gap-3">
    <img
      v-if="user.avatarUrl"
      :src="user.avatarUrl"
      :alt="user.displayName || user.username"
      class="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
    />
    <div
      v-else
      class="w-12 h-12 rounded-full bg-gradient-shift flex items-center justify-center text-white font-semibold ring-2 ring-gray-200"
    >
      {{ (user.displayName || user.username || "U")[0].toUpperCase() }}
    </div>
    <div>
      <div class="flex items-center gap-2">
        <p class="font-semibold text-gray-900">
          {{ user.displayName || user.username || "User" }}
        </p>
        <span
          v-if="user.isVerified"
          class="text-accent-blue"
          title="Verified"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      </div>
      <p v-if="user.headline" class="text-sm text-gray-600">
        {{ user.headline }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { User } from "~/utils/api";

export default Vue.extend({
  name: "AuthorBadge",
  props: {
    user: {
      type: Object as PropType<User>,
      required: true,
    },
  },
});
</script>
