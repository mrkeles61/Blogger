<template>
  <div class="animate-pulse">
    <div class="bg-gray-200 rounded" :style="{ width: width, height: height }"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "nuxt-property-decorator";

@Component
export default class ShimmerPlaceholder extends Vue {
  @Prop({ default: "100%" }) width!: string;
  @Prop({ default: "20px" }) height!: string;
}
</script>

