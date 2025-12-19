<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'px-6 py-2 rounded-full font-medium transition-all duration-300 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      variantClasses,
      disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover-scale-sm',
      loading ? 'cursor-wait' : '',
    ]"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="inline-flex items-center">
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {{ loadingText }}
    </span>
    <span v-else>
      <slot />
    </span>
  </button>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "PillButton",
  props: {
    type: {
      type: String,
      default: "button",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    loadingText: {
      type: String,
      default: "Loading...",
    },
    variant: {
      type: String as () => "primary" | "secondary" | "outline" | "danger",
      default: "primary",
    },
  },
  computed: {
    variantClasses(): string {
      const variants: Record<string, string> = {
        primary: "bg-gradient-shift text-white hover:shadow-glow focus:ring-accent-orange",
        secondary: "bg-accent-blue text-white hover:bg-blue-700 focus:ring-accent-blue",
        outline: "border-2 border-accent-orange text-accent-orange hover:bg-accent-orange hover:text-white focus:ring-accent-orange",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      };
      return variants[this.variant] || variants.primary;
    },
  },
});
</script>
