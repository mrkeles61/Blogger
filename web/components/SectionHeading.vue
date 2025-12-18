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
import { Component, Vue, Prop } from "nuxt-property-decorator";

@Component
export default class SectionHeading extends Vue {
  @Prop({ required: true }) title!: string;
  @Prop({ default: false }) showMoreLink!: boolean;
  @Prop({ default: "#" }) moreLink!: string;
  @Prop({ default: "Tümünü Gör" }) moreText!: string;
}
</script>

