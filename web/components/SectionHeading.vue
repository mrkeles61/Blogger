<template>
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-3xl font-playfair font-bold text-gray-900">
      {{ title }}
    </h2>
    <nuxt-link
      v-if="showMoreLink"
      :to="moreLink"
      class="text-accent-orange hover:text-orange-700 font-medium text-sm flex items-center gap-1 transition-soft"
    >
      {{ moreText }}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "SectionHeading",
  props: {
    title: {
      type: String,
      required: true,
    },
    showMoreLink: {
      type: Boolean,
      default: false,
    },
    moreLink: {
      type: String,
      default: "#",
    },
    moreText: {
      type: String,
      default: "Tümünü Gör",
    },
  },
});
</script>
