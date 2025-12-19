<template>
  <div class="animate-pulse">
    <div class="bg-gray-200 rounded" :style="{ width: width, height: height }"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ShimmerPlaceholder",
  props: {
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "20px",
    },
  },
});
</script>
