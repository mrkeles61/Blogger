<template>
  <div class="bg-gray-700 rounded-lg shadow-lg p-2 flex items-center gap-2 border border-gray-600 mb-2">
    <button
      type="button"
      @click="handleFormat('bold')"
      class="p-2 hover:bg-gray-600 rounded transition-soft text-gray-300 hover:text-white"
      title="Bold"
      aria-label="Bold"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
      </svg>
    </button>
    <button
      type="button"
      @click="handleFormat('italic')"
      class="p-2 hover:bg-gray-600 rounded transition-soft text-gray-300 hover:text-white"
      title="Italic"
      aria-label="Italic"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    </button>
    <button
      type="button"
      @click="handleFormat('code')"
      class="p-2 hover:bg-gray-600 rounded transition-soft text-gray-300 hover:text-white"
      title="Code"
      aria-label="Code"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </button>
    <div class="w-px h-6 bg-gray-600"></div>
    <button
      type="button"
      @click="handleFormat('list')"
      class="p-2 hover:bg-gray-600 rounded transition-soft text-gray-300 hover:text-white"
      title="List"
      aria-label="List"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <button
      type="button"
      @click="handleFormat('link')"
      class="p-2 hover:bg-gray-600 rounded transition-soft text-gray-300 hover:text-white"
      title="Link"
      aria-label="Link"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    </button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "FloatingToolbar",
  methods: {
    handleFormat(formatType: string) {
      this.$emit("format", formatType);
    },
  },
});
</script>
